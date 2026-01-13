module.exports = function requireRole(allowedRoles = []) {
  const normalized = allowedRoles.map((r) => String(r).toLowerCase());
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthenticated" });
    }
    const role = String(req.user.role || "author").toLowerCase();
    if (!normalized.includes(role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    return next();
  };
};
