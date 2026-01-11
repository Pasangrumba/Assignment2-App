import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import NavBar from "./NavBar";
import { assetsApi } from "./api";

function Library() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    assetsApi
      .listPublished()
      .then((data) => setAssets(data.assets || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="app-shell">
      <NavBar />
      <div className="app-main">
        <div className="container py-4">
          <h2 className="h4 mb-3">Published Library</h2>
          {loading && <p>Loading published assets...</p>}
          {error && <div className="alert alert-danger">{error}</div>}
          {!loading && assets.length === 0 && (
            <p className="text-muted">No published assets yet.</p>
          )}
          <div className="row g-3">
            {assets.map((asset) => (
              <div className="col-12" key={asset.id}>
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title mb-1">{asset.title}</h5>
                    <p className="card-text text-muted">{asset.description}</p>
                    <Link
                      className="btn btn-outline-primary btn-sm"
                      to={`/assets/${asset.id}`}
                    >
                      View Details
                    </Link>
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

export default Library;
