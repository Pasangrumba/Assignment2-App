import React, { useEffect, useState } from "react";
import NavBar from "./NavBar";
import { adminApi, authApi } from "./api";

function AdminChampions() {
  const [role, setRole] = useState("");
  const [championUserId, setChampionUserId] = useState("");
  const [region, setRegion] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    authApi
      .me()
      .then((data) => setRole(String(data.user?.role || "")))
      .catch(() => setRole(""));
  }, []);

  const handleAssign = (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    adminApi
      .assignChampion({
        champion_user_id: Number(championUserId),
        region,
      })
      .then(() => setMessage("Champion assigned to region."))
      .catch((err) => setError(err.message));
  };

  const isAdmin = role.toLowerCase() === "admin";

  return (
    <div className="app-shell">
      <NavBar />
      <div className="app-main">
        <div className="container py-4">
          <h2 className="h4 mb-3">Assign Champions</h2>
          {!isAdmin && (
            <div className="alert alert-warning">
              You need admin access to assign champions.
            </div>
          )}
          {isAdmin && (
            <form className="card p-3" onSubmit={handleAssign}>
              {message && <div className="alert alert-success">{message}</div>}
              {error && <div className="alert alert-danger">{error}</div>}
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Champion User ID</label>
                  <input
                    className="form-control"
                    value={championUserId}
                    onChange={(event) => setChampionUserId(event.target.value)}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Region</label>
                  <input
                    className="form-control"
                    value={region}
                    onChange={(event) => setRegion(event.target.value)}
                    placeholder="e.g. UK, EU"
                    required
                  />
                </div>
                <div className="col-md-4 d-flex align-items-end">
                  <button className="btn btn-primary w-100" type="submit">
                    Assign
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminChampions;
