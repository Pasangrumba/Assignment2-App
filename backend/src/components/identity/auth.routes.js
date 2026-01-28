const express = require("express");
const {
  register,
  login,
  authenticate,
  updateProfile,
  getUserProfile,
} = require("./auth.service");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const user = await register({
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      password: String(password),
      role: role ? String(role) : null,
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
  getUserProfile(req.user.id)
    .then((user) => {
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      return res.json({ user });
    })
    .catch(() => res.status(500).json({ error: "Failed to load user" }));
});

router.put("/me", authenticate, async (req, res) => {
  try {
    const {
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
    } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }
    const payload = await updateProfile({
      userId: req.user.id,
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      password: password ? String(password) : null,
      role: role ? String(role) : null,
      region: region ? String(region) : null,
      languages: languages || null,
      availability: availability ? String(availability) : null,
      skills: skills || null,
      domains: domains || null,
      certifications: certifications || null,
      currentProjects: currentProjects || null,
    });
    return res.json(payload);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
});

module.exports = router;
