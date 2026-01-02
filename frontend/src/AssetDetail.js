import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import NavBar from "./NavBar";
import { assetsApi, governanceApi } from "./api";

function AssetDetail() {
  const { id } = useParams();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const loadAsset = useCallback(() => {
    setLoading(true);
    setError("");
    assetsApi
      .getById(id)
      .then((data) => setAsset(data.asset))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    loadAsset();
  }, [loadAsset]);

  const handleApprove = () => {
    setActionMessage("");
    governanceApi
      .approveAsset(id)
      .then(() => {
        setActionMessage("Asset approved and published.");
        loadAsset();
      })
      .catch((err) => setError(err.message));
  };

  return (
    <div>
      <NavBar />
      <div className="container py-4">
        {loading && <p>Loading asset...</p>}
        {error && <div className="alert alert-danger">{error}</div>}
        {actionMessage && (
          <div className="alert alert-success">{actionMessage}</div>
        )}

        {!loading && asset && (
          <div className="card">
            <div className="card-body">
              <h2 className="h4">{asset.title}</h2>
              <p className="text-muted">{asset.description}</p>
              <p>
                <span className="badge bg-secondary">{asset.status}</span>
              </p>
              <h6>Metadata</h6>
              {asset.tags.length === 0 && (
                <p className="text-muted">No metadata tags assigned.</p>
              )}
              <div className="d-flex flex-wrap gap-2">
                {asset.tags.map((tag) => (
                  <span className="badge bg-light text-dark" key={tag.id}>
                    {tag.tag_type}: {tag.tag_value}
                  </span>
                ))}
              </div>

              {asset.status === "PendingReview" && (
                <div className="mt-3">
                  <button className="btn btn-success" onClick={handleApprove}>
                    Approve and Publish
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AssetDetail;
