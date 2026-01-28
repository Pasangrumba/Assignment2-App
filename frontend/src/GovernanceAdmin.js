import React, { useEffect, useState } from "react";
import NavBar from "./NavBar";
import { authApi, governanceApi } from "./api";

const STATUS_TABS = [
  { key: "needs_review", label: "Due for Review" },
  { key: "expired", label: "Expired" },
  { key: "published", label: "Approved" },
];

function GovernanceAdmin() {
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("needs_review");
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [auditLogs, setAuditLogs] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);

  useEffect(() => {
    authApi
      .me()
      .then((data) => setRole(String(data.user?.role || "")))
      .catch(() => setRole(""));
  }, []);

  const loadAssets = (nextStatus) => {
    setLoading(true);
    setError("");
    governanceApi
      .listByStatus(nextStatus)
      .then((data) => setAssets(data.assets || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAssets(status);
  }, [status]);

  const handleRevalidate = (assetId) => {
    governanceApi
      .revalidateAsset(assetId, "Revalidated via admin panel")
      .then(() => loadAssets(status))
      .catch((err) => setError(err.message));
  };

  const handleAudit = (assetId) => {
    setSelectedAsset(assetId);
    governanceApi
      .auditLogs(assetId)
      .then((data) => setAuditLogs(data.logs || []))
      .catch((err) => setError(err.message));
  };

  const isReviewer = ["reviewer", "admin"].includes(role.toLowerCase());

  return (
    <div className="app-shell">
      <NavBar />
      <div className="app-main">
        <div className="container py-4">
          <h2 className="h4 mb-3">Governance Lifecycle</h2>
          {!isReviewer && (
            <div className="alert alert-warning">
              You need reviewer/admin access to view this page.
            </div>
          )}
          {isReviewer && (
            <>
              <div className="btn-group mb-3">
                {STATUS_TABS.map((tab) => (
                  <button
                    key={tab.key}
                    className={`btn btn-outline-secondary ${status === tab.key ? "active" : ""}`}
                    onClick={() => setStatus(tab.key)}
                    type="button"
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {loading && <p>Loading governance assets...</p>}
              {error && <div className="alert alert-danger">{error}</div>}
              {!loading && assets.length === 0 && (
                <p className="text-muted">No assets for this status.</p>
              )}

              <div className="table-responsive">
                <table className="table table-sm align-middle">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Owner</th>
                      <th>Status</th>
                      <th>Review Due</th>
                      <th>Expiry</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assets.map((asset) => (
                      <tr key={asset.id}>
                        <td>{asset.title}</td>
                        <td>
                          {asset.owner_name} <div className="text-muted small">{asset.owner_email}</div>
                        </td>
                        <td className="text-uppercase">{asset.status}</td>
                        <td>{asset.review_due_at || "-"}</td>
                        <td>{asset.expiry_at || "-"}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => handleAudit(asset.id)}
                              type="button"
                            >
                              Audit Log
                            </button>
                            {status !== "published" && (
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => handleRevalidate(asset.id)}
                                type="button"
                              >
                                Revalidate
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selectedAsset && (
                <div className="card mt-3">
                  <div className="card-body">
                    <h6 className="mb-2">Audit Logs for Asset #{selectedAsset}</h6>
                    {auditLogs.length === 0 && (
                      <p className="text-muted mb-0">No audit logs recorded.</p>
                    )}
                    {auditLogs.length > 0 && (
                      <ul className="list-group list-group-flush">
                        {auditLogs.map((log) => (
                          <li className="list-group-item" key={log.id}>
                            <strong>{log.action}</strong> by {log.actor_name || "system"}{" "}
                            <span className="text-muted small">({log.created_at})</span>
                            {log.notes && <div className="text-muted">{log.notes}</div>}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default GovernanceAdmin;
