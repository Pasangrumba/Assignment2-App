import React, { useCallback, useEffect, useState } from "react";
import NavBar from "./NavBar";
import { governanceApi, workspacesApi } from "./api";

function PendingReviews() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [workspaces, setWorkspaces] = useState([]);
  const [workspaceFilter, setWorkspaceFilter] = useState("");

  const loadWorkspaces = useCallback(() => {
    workspacesApi
      .list()
      .then((data) => setWorkspaces(data.workspaces || []))
      .catch(() => setWorkspaces([]));
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    governanceApi
      .listPending(workspaceFilter ? workspaceFilter : null)
      .then((data) => setAssets(data.assets || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [workspaceFilter]);

  useEffect(() => {
    load();
    loadWorkspaces();
  }, [load, loadWorkspaces]);

  useEffect(() => {
    load();
  }, [load]);

  const handleApprove = async (id) => {
    setMessage("");
    try {
      await governanceApi.approveAsset(id, "Approved via Pending Reviews UI");
      setMessage("Asset approved and published.");
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReject = async (id) => {
    setMessage("");
    const review_comment = window.prompt("Rejection comment (optional):", "");
    try {
      await governanceApi.rejectAsset(id, review_comment || "");
      setMessage("Asset rejected.");
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="app-shell">
      <NavBar />
      <div className="app-main">
        <div className="container py-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="h4 mb-0">Pending Reviews</h2>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-12 col-md-6">
              <label className="form-label">Workspace</label>
              <select
                className="form-select"
                value={workspaceFilter}
                onChange={(event) => setWorkspaceFilter(event.target.value)}
              >
                <option value="">All workspaces</option>
                {workspaces.map((ws) => (
                  <option key={ws.id} value={ws.id}>
                    {ws.name}
                  </option>
                ))}
              </select>
              <div className="form-text">Filter pending assets by workspace.</div>
            </div>
          </div>

          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-danger">{error}</div>}

          {loading ? (
            <p>Loading pending assets...</p>
          ) : assets.length === 0 ? (
            <p>No assets are currently pending review.</p>
          ) : (
            <div className="row g-3">
              {assets.map((asset) => (
                <div className="col-12" key={asset.id}>
                  <div className="card">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h5 className="card-title mb-1">{asset.title}</h5>
                          <p className="card-text text-muted mb-2">Owner: {asset.owner_name || asset.owner_user_id}</p>
                          <p className="card-text">{asset.description}</p>
                        </div>
                        <div className="text-end">
                          <button className="btn btn-success btn-sm me-2" onClick={() => handleApprove(asset.id)}>
                            Approve
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleReject(asset.id)}>
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PendingReviews;
