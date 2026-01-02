const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { get, run } = require("../../db/db");

const JWT_SECRET = process.env.JWT_SECRET || "mwcd_coursework2_dev_secret";
const JWT_EXPIRES_IN = "2h";

const register = async ({ name, email, password }) => {
  const existing = await get("SELECT id FROM users WHERE email = ?", [email]);
  if (existing) {
    const error = new Error("Email already registered");
    error.status = 400;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const result = await run(
    "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
    [name, email, passwordHash]
  );

  return { id: result.id, name, email };
};

const login = async ({ email, password }) => {
  const user = await get(
    "SELECT id, name, email, password_hash FROM users WHERE email = ?",
    [email]
  );
  if (!user) {
    const error = new Error("Invalid credentials");
    error.status = 401;
    throw error;
  }

  const passwordMatch = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatch) {
    const error = new Error("Invalid credentials");
    error.status = 401;
    throw error;
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return { token, user: { id: user.id, name: user.name, email: user.email } };
};

const authenticate = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Missing auth token" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid auth token" });
  }
};

const authenticateOptional = (req, _res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return next();
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
  } catch (err) {
    req.user = null;
  }

  return next();
};

module.exports = {
  register,
  login,
  authenticate,
  authenticateOptional,
};
