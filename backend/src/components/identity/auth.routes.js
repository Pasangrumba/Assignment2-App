const express = require("express");
const { register, login, authenticate } = require("./auth.service");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const user = await register({
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      password: String(password),
    });
    return res.status(201).json({ user });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const payload = await login({
      email: String(email).trim().toLowerCase(),
      password: String(password),
    });
    return res.json(payload);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
});

router.get("/me", authenticate, (req, res) => {
  return res.json({ user: req.user });
});

module.exports = router;
