const express = require("express");
const cors = require("cors");

const authRoutes = require("./components/identity/auth.routes");
const assetRoutes = require("./components/knowledge/assets.routes");
const tagRoutes = require("./components/metadata/tags.routes");
const governanceRoutes = require("./components/governance/governance.routes");
const workspaceRoutes = require("./components/knowledge/workspaces.routes");
const recommendationRoutes = require("./components/knowledge/recommendations.routes");
const metricsRoutes = require("./components/metrics/metrics.routes");
const championRoutes = require("./components/champions/champions.routes");
const mentoringRoutes = require("./components/champions/mentoring.routes");
const championAdminRoutes = require("./components/champions/admin.routes");
const { startGovernanceScheduler } = require("./jobs/governanceScheduler");

const app = express();
const PORT = process.env.PORT || 5001;
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
app.use("/api/metrics", metricsRoutes);
app.use("/api/champions", championRoutes);
app.use("/api/mentoring-requests", mentoringRoutes);
app.use("/api/admin", championAdminRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Server error" });
});

app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});

startGovernanceScheduler();
