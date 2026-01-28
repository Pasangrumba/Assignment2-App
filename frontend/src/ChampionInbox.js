import React, { useEffect, useState } from "react";
import NavBar from "./NavBar";
import { authApi, mentoringApi } from "./api";

function ChampionInbox() {
  const [role, setRole] = useState("");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    authApi
      .me()
      .then((data) => setRole(String(data.user?.role || "")))
      .catch(() => setRole(""));
  }, []);

  const loadInbox = () => {
    setLoading(true);
    mentoringApi
      .inbox()
      .then((data) => setRequests(data.requests || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadInbox();
  }, []);

  const updateStatus = (id, status) => {
    mentoringApi
      .update(id, status)
      .then(() => loadInbox())
      .catch((err) => setError(err.message));
  };

  const isChampion = ["champion", "admin"].includes(role.toLowerCase());

  return (
    <div className="app-shell">
      <NavBar />
      <div className="app-main">
        <div className="container py-4">
          <h2 className="h4 mb-3">Champion Inbox</h2>
          {!isChampion && (
            <div className="alert alert-warning">
              You need champion/admin access to view this page.
            </div>
          )}
          {isChampion && (
            <>
              {loading && <p>Loading mentoring requests...</p>}
              {error && <div className="alert alert-danger">{error}</div>}
              {!loading && requests.length === 0 && (
                <p className="text-muted">No mentoring requests assigned.</p>
              )}
              <div className="table-responsive">
                <table className="table table-sm align-middle">
                  <thead>
                    <tr>
                      <th>Requester</th>
                      <th>Topic</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((req) => (
                      <tr key={req.id}>
                        <td>
                          {req.requester_name}
                          <div className="text-muted small">{req.requester_email}</div>
                        </td>
                        <td>{req.topic}</td>
                        <td className="text-uppercase">{req.status}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => updateStatus(req.id, "IN_PROGRESS")}
                              type="button"
                            >
                              In Progress
                            </button>
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => updateStatus(req.id, "RESOLVED")}
                              type="button"
                            >
                              Resolve
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChampionInbox;
