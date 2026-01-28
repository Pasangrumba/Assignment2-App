import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import NavBar from "./NavBar";
import { assetsApi } from "./api";

function Library() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const loadAssets = (searchQuery = "") => {
    setLoading(true);
    const request = searchQuery ? assetsApi.search(searchQuery) : assetsApi.listPublished();
    request
      .then((data) => setAssets(data.assets || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAssets();
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    setError("");
    loadAssets(query.trim());
  };

  return (
    <div className="app-shell">
      <NavBar />
      <div className="app-main">
        <div className="container py-4">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
            <h2 className="h4 mb-0">Published Library</h2>
            <form className="d-flex gap-2" onSubmit={handleSearch}>
              <input
                className="form-control"
                placeholder="Search by title, keywords..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <button className="btn btn-outline-secondary" type="submit">
                Search
              </button>
            </form>
          </div>
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
                    <div className="d-flex flex-wrap gap-2 mb-2">
                      {asset.status && asset.status !== "published" && (
                        <span className="badge bg-secondary text-uppercase">
                          {asset.status.replace("_", " ")}
                        </span>
                      )}
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
