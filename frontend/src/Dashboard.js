import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import { assetsApi } from "./api";

function Dashboard() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
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

  useEffect(() => {
    loadAssets();
  }, []);

  useEffect(() => {
    if (location.state?.actionMessage) {
      setActionMessage(location.state.actionMessage);
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

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

        {loading && <p>Loading assets...</p>}
        {error && <div className="alert alert-danger">{error}</div>}
        {actionMessage && (
          <div className="alert alert-success">{actionMessage}</div>
        )}

        {!loading && assets.length === 0 && (
          <p className="text-muted">No assets yet. Create your first draft.</p>
        )}

        <div className="row g-3">
          {assets.map((asset) => (
            <div className="col-12" key={asset.id}>
              <div className="card">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h5 className="card-title mb-1">{asset.title}</h5>
                      <p className="card-text text-muted mb-2">
                        {asset.description}
                      </p>
                      <span className="badge bg-secondary me-2">
                        {asset.status}
                      </span>
                    </div>
                    <div className="text-end">
                      <Link
                        className="btn btn-outline-dark btn-sm me-2"
                        to={`/assets/${asset.id}`}
                      >
                        View
                      </Link>
                      {asset.status === "Draft" && (
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
      </div>
    </div>
  </div>
  );
}

export default Dashboard;
