const express = require("express");
const cors = require("cors");

const authRoutes = require("./components/identity/auth.routes");
const assetRoutes = require("./components/knowledge/assets.routes");
const tagRoutes = require("./components/metadata/tags.routes");
const governanceRoutes = require("./components/governance/governance.routes");
const workspaceRoutes = require("./components/knowledge/workspaces.routes");
const recommendationRoutes = require("./components/knowledge/recommendations.routes");

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";

const corsOptions = {
  // For the coursework sandbox we accept all origins and echo them back
  origin: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/governance", governanceRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/recommendations", recommendationRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Server error" });
});

app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});
