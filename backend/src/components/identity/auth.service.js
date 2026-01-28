const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { get, run } = require("../../db/db");

const JWT_SECRET = process.env.JWT_SECRET || "mwcd_coursework2_dev_secret";
const JWT_EXPIRES_IN = "2h";

const signUserToken = (user) =>
  jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role || 'author' }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

const serializeList = (value) => {
  if (!value) return null;
  const normalized = Array.isArray(value)
    ? value
    : String(value)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
  return JSON.stringify(normalized);
};

const parseList = (value) => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (_err) {
    // fall through
  }
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const register = async ({ name, email, password, role }) => {
  const existing = await get("SELECT id FROM users WHERE email = ?", [email]);
  if (existing) {
    const error = new Error("Email already registered");
    error.status = 400;
    throw error;
  }

  const allowedRoles = new Set(["author", "reviewer"]);
  const normalizedRole = role ? String(role).trim().toLowerCase() : "author";
  const safeRole = allowedRoles.has(normalizedRole) ? normalizedRole : "author";

  const passwordHash = await bcrypt.hash(password, 10);
  const result = await run(
    "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
    [name, email, passwordHash, safeRole]
  );

  await run("INSERT OR IGNORE INTO expertise_profiles (user_id) VALUES (?)", [
    result.id,
  ]);

  return { id: result.id, name, email, role: safeRole };
};

const login = async ({ email, password }) => {
  const user = await get(
    "SELECT id, name, email, password_hash, role, region, languages, availability FROM users WHERE email = ?",
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

  const token = signUserToken(user);

  const expertise = await get(
    "SELECT skills, domains, certifications, current_projects FROM expertise_profiles WHERE user_id = ?",
    [user.id]
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role || 'author',
      region: user.region || null,
      languages: parseList(user.languages),
      availability: user.availability || null,
      expertise: {
        skills: parseList(expertise?.skills),
        domains: parseList(expertise?.domains),
        certifications: parseList(expertise?.certifications),
        currentProjects: parseList(expertise?.current_projects),
      },
    },
  };
};

const getUserProfile = async (userId) => {
  const user = await get(
    "SELECT id, name, email, role, region, languages, availability FROM users WHERE id = ?",
    [userId]
  );
  if (!user) {
    return null;
  }
  const expertise = await get(
    "SELECT skills, domains, certifications, current_projects FROM expertise_profiles WHERE user_id = ?",
    [userId]
  );

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role || 'author',
    region: user.region || null,
    languages: parseList(user.languages),
    availability: user.availability || null,
    expertise: {
      skills: parseList(expertise?.skills),
      domains: parseList(expertise?.domains),
      certifications: parseList(expertise?.certifications),
      currentProjects: parseList(expertise?.current_projects),
    },
  };
};

const updateProfile = async ({
  userId,
  name,
  email,
  password,
  role,
  region,
  languages,
  availability,
  skills,
  domains,
  certifications,
  currentProjects,
}) => {
  const existing = await get(
    "SELECT id FROM users WHERE email = ? AND id != ?",
    [email, userId]
  );
  if (existing) {
    const error = new Error("Email already registered");
    error.status = 400;
    throw error;
  }

  let passwordHash = null;
  if (password) {
    passwordHash = await bcrypt.hash(password, 10);
  }

  const languagesJson = serializeList(languages);
  const userParams = [
    name,
    email,
    role || null,
    region || null,
    languagesJson,
    availability || null,
  ];

  if (passwordHash) {
    await run(
      "UPDATE users SET name = ?, email = ?, role = ?, region = ?, languages = ?, availability = ?, password_hash = ? WHERE id = ?",
      [...userParams, passwordHash, userId]
    );
  } else {
    await run(
      "UPDATE users SET name = ?, email = ?, role = ?, region = ?, languages = ?, availability = ? WHERE id = ?",
      [...userParams, userId]
    );
  }

  await run(
    "INSERT OR IGNORE INTO expertise_profiles (user_id) VALUES (?)",
    [userId]
  );

  await run(
    "UPDATE expertise_profiles SET skills = ?, domains = ?, certifications = ?, current_projects = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?",
    [
      serializeList(skills),
      serializeList(domains),
      serializeList(certifications),
      serializeList(currentProjects),
      userId,
    ]
  );

  const updatedUser = await getUserProfile(userId);
  const token = signUserToken(updatedUser);
  return { user: updatedUser, token };
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
  updateProfile,
  getUserProfile,
  authenticate,
  authenticateOptional,
};
