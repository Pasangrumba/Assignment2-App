import React, { useEffect, useState } from "react";
import NavBar from "./NavBar";
import { championsApi, mentoringApi } from "./api";

function Champions() {
  const [champions, setChampions] = useState([]);
  const [region, setRegion] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedChampion, setSelectedChampion] = useState(null);
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");

  const loadChampions = (filterRegion = "") => {
    setLoading(true);
    setError("");
    championsApi
      .list(filterRegion)
      .then((data) => setChampions(data.champions || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadChampions();
  }, []);

  const handleRequest = (champion) => {
    setSelectedChampion(champion);
    setTopic("");
    setMessage("");
    setNotice("");
  };

  const submitRequest = (event) => {
    event.preventDefault();
    if (!selectedChampion) return;
    mentoringApi
      .create({
        champion_user_id: selectedChampion.user_id,
        topic,
        message,
      })
      .then(() => {
        setNotice("Mentoring request sent.");
        setSelectedChampion(null);
      })
      .catch((err) => setError(err.message));
  };

  return (
    <div className="app-shell">
      <NavBar />
      <div className="app-main">
        <div className="container py-4">
          <h2 className="h4 mb-3">Champions</h2>
          <form
            className="d-flex gap-2 mb-3"
            onSubmit={(event) => {
              event.preventDefault();
              loadChampions(region.trim());
            }}
          >
            <input
              className="form-control"
              placeholder="Filter by region (e.g. UK)"
              value={region}
              onChange={(event) => setRegion(event.target.value)}
            />
            <button className="btn btn-outline-secondary" type="submit">
              Filter
            </button>
          </form>
          {notice && <div className="alert alert-success">{notice}</div>}
          {loading && <p>Loading champions...</p>}
          {error && <div className="alert alert-danger">{error}</div>}
          {!loading && champions.length === 0 && (
            <p className="text-muted">No champions assigned yet.</p>
          )}
          <div className="row g-3">
            {champions.map((champion) => (
              <div className="col-12 col-md-6" key={champion.id}>
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title">{champion.name}</h5>
                    <p className="card-text text-muted mb-1">{champion.email}</p>
                    <span className="badge bg-light text-dark">{champion.region}</span>
                    <div className="mt-3">
                      <button
                        className="btn btn-outline-primary btn-sm"
                        type="button"
                        onClick={() => handleRequest(champion)}
                      >
                        Request mentoring
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedChampion && (
            <div className="card mt-4">
              <div className="card-body">
                <h5>Request mentoring from {selectedChampion.name}</h5>
                <form onSubmit={submitRequest}>
                  <div className="mb-2">
                    <label className="form-label">Topic</label>
                    <input
                      className="form-control"
                      value={topic}
                      onChange={(event) => setTopic(event.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Message</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                    />
                  </div>
                  <div className="d-flex gap-2">
                    <button className="btn btn-success" type="submit">
                      Send request
                    </button>
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => setSelectedChampion(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Champions;
