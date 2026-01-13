import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import { assetsApi, recommendationsApi, workspacesApi } from "./api";

function Dashboard() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [workspaces, setWorkspaces] = useState([]);
  const [workspaceFilter, setWorkspaceFilter] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const loadAssets = () => {
    setLoading(true);
    setError("");
    assetsApi
      .listMine()
      .then((data) => {
        setAssets(data.assets || []);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  };

  const loadWorkspaces = () => {
    workspacesApi
      .list()
      .then((data) => setWorkspaces(data.workspaces || []))
      .catch(() => setWorkspaces([]));
  };

  const loadRecommendations = (workspaceId) => {
    setRecLoading(true);
    setRecError("");
    recommendationsApi
      .list(workspaceId || null)
      .then((data) => setRecommendations(data.recommendations || []))
      .catch((err) => setRecError(err.message))
      .finally(() => setRecLoading(false));
  };

  useEffect(() => {
    loadAssets();
    loadWorkspaces();
  }, []);

  useEffect(() => {
    if (location.state?.actionMessage) {
      setActionMessage(location.state.actionMessage);
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  useEffect(() => {
    loadRecommendations(workspaceFilter);
  }, [workspaceFilter]);

  const handleSubmit = (assetId) => {
    setActionMessage("");
    assetsApi
      .submitForReview(assetId)
      .then(() => {
        setActionMessage("Asset submitted for review.");
        loadAssets();
      })
      .catch((err) => {
        setError(err.message);
      });
  };

  const handleDelete = (assetId) => {
    const confirmed = window.confirm(
      "Delete this draft? This cannot be undone."
    );
    if (!confirmed) {
      return;
    }

    setActionMessage("");
    assetsApi
      .deleteDraft(assetId)
      .then(() => {
        setActionMessage("Draft deleted.");
        loadAssets();
      })
      .catch((err) => {
        setError(err.message);
      });
  };

  const filteredAssets = workspaceFilter
    ? assets.filter((asset) => String(asset.workspace_id) === workspaceFilter)
    : assets;

  return (
    <div className="app-shell">
      <NavBar />
      <div className="app-main">
        <div className="container py-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h2 className="h4 mb-0">Digital Knowledge Network System Dashboard</h2>
              <div className="text-muted small">
                Manage your knowledge assets across the network.
              </div>
            </div>
            <Link className="btn btn-primary btn-sm" to="/assets/new">
              Create Draft
            </Link>
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
                {workspaces.map((workspace) => (
                  <option key={workspace.id} value={workspace.id}>
                    {workspace.name}
                  </option>
                ))}
              </select>
              <div className="form-text">Filter assets and recommendations.</div>
            </div>
          </div>

          {loading && <p>Loading assets...</p>}
          {error && <div className="alert alert-danger">{error}</div>}
          {actionMessage && (
            <div className="alert alert-success">{actionMessage}</div>
          )}

          {!loading && filteredAssets.length === 0 && (
            <p className="text-muted">No assets yet. Create your first draft.</p>
          )}

          <div className="row g-3">
            {filteredAssets.map((asset) => (
              <div className="col-12" key={asset.id}>
                <div className="card">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h5 className="card-title mb-1">{asset.title}</h5>
                        <p className="card-text text-muted mb-2">
                          {asset.description}
                        </p>
                        <div className="d-flex flex-wrap gap-2 mb-2">
                          <span className="badge bg-secondary">
                            {asset.status}
                          </span>
                          {asset.asset_type && (
                            <span className="badge bg-info text-dark">
                              {asset.asset_type}
                            </span>
                          )}
                          {asset.confidentiality && (
                            <span className="badge bg-warning text-dark">
                              {asset.confidentiality}
                            </span>
                          )}
                          <span className="badge bg-dark">
                            v{asset.version_major ?? 1}.{asset.version_minor ?? 0}
                          </span>
                          {asset.workspace_name && (
                            <span className="badge bg-light text-dark">
                              {asset.workspace_name}
                            </span>
                          )}
                        </div>
                        {(asset.source_project_id || asset.keywords) && (
                          <div className="small text-muted">
                            {asset.source_project_id && (
                              <span className="me-3">
                                Source Project: {asset.source_project_id}
                              </span>
                            )}
                            {asset.keywords && <span>Keywords: {asset.keywords}</span>}
                          </div>
                        )}
                      </div>
                      <div className="text-end">
                        <Link
                          className="btn btn-outline-dark btn-sm me-2"
                          to={`/assets/${asset.id}`}
                        >
                          View
                        </Link>
                        {asset.status === "draft" && (
                          <>
                            <Link
                              className="btn btn-outline-primary btn-sm me-2"
                              to={`/assets/${asset.id}/edit`}
                            >
                              Edit Draft
                            </Link>
                            <button
                              className="btn btn-outline-danger btn-sm me-2"
                              onClick={() => handleDelete(asset.id)}
                            >
                              Delete Draft
                            </button>
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleSubmit(asset.id)}
                            >
                              Submit for Review
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <h3 className="h5 mb-2">Recommendations</h3>
            {recLoading && <p>Generating recommendations...</p>}
            {recError && <div className="alert alert-danger">{recError}</div>}
            {!recLoading && recommendations.length === 0 && (
              <p className="text-muted">No recommendations yet.</p>
            )}
            <div className="row g-3">
              {recommendations.map((rec) => (
                <div className="col-12 col-md-6" key={rec.recommendationId}>
                  <div className="card h-100">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <div className="text-muted small">
                            Score: <strong>{rec.score}</strong>
                          </div>
                          <h6 className="mb-1">{rec.title}</h6>
                          <p className="text-muted small mb-2">
                            {rec.description}
                          </p>
                          <div className="text-muted small">{rec.explanation}</div>
                          {rec.workspaceName && (
                            <div className="small mt-1">
                              Workspace: {rec.workspaceName}
                            </div>
                          )}
                        </div>
                        <Link
                          className="btn btn-outline-primary btn-sm"
                          to={`/assets/${rec.assetId}`}
                        >
                          Open
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
