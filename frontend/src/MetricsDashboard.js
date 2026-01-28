import React, { useEffect, useState } from "react";
import NavBar from "./NavBar";
import { authApi, metricsApi } from "./api";

function MetricsDashboard() {
  const [role, setRole] = useState("");
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    authApi
      .me()
      .then((data) => setRole(String(data.user?.role || "")))
      .catch(() => setRole(""));
  }, []);

  const loadMetrics = () => {
    setLoading(true);
    setError("");
    metricsApi
      .adoption(from, to)
      .then((data) => setMetrics(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  const isReviewer = ["reviewer", "admin"].includes(role.toLowerCase());

  return (
    <div className="app-shell">
      <NavBar />
      <div className="app-main">
        <div className="container py-4">
          <h2 className="h4 mb-3">Adoption Metrics</h2>
          {!isReviewer && (
            <div className="alert alert-warning">
              You need reviewer/admin access to view this page.
            </div>
          )}
          {isReviewer && (
            <>
              <form
                className="row g-2 align-items-end mb-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  loadMetrics();
                }}
              >
                <div className="col-auto">
                  <label className="form-label">From</label>
                  <input
                    type="date"
                    className="form-control"
                    value={from}
                    onChange={(event) => setFrom(event.target.value)}
                  />
                </div>
                <div className="col-auto">
                  <label className="form-label">To</label>
                  <input
                    type="date"
                    className="form-control"
                    value={to}
                    onChange={(event) => setTo(event.target.value)}
                  />
                </div>
                <div className="col-auto">
                  <button className="btn btn-outline-primary" type="submit">
                    Refresh
                  </button>
                </div>
              </form>

              {loading && <p>Loading metrics...</p>}
              {error && <div className="alert alert-danger">{error}</div>}
              {!loading && metrics && (
                <>
                  <div className="row g-3 mb-3">
                    <div className="col-md-3">
                      <div className="card p-3">
                        <div className="text-muted small">Active Users</div>
                        <div className="h4 mb-0">{metrics.activeUsers}</div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card p-3">
                        <div className="text-muted small">Contributors</div>
                        <div className="h4 mb-0">{metrics.contributors}</div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card p-3">
                        <div className="text-muted small">Consumers</div>
                        <div className="h4 mb-0">{metrics.consumers}</div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card p-3">
                        <div className="text-muted small">Rate</div>
                        <div className="h4 mb-0">{metrics.contributorVsConsumerRate}</div>
                      </div>
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="card p-3">
                        <h6>Top Events</h6>
                        <table className="table table-sm">
                          <thead>
                            <tr>
                              <th>Event</th>
                              <th>Count</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(metrics.topEvents || []).map((event) => (
                              <tr key={event.event_type}>
                                <td>{event.event_type}</td>
                                <td>{event.count}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card p-3">
                        <h6>Weekly Trend</h6>
                        <ul className="list-group list-group-flush">
                          {(metrics.weeklyTrend || []).map((week) => (
                            <li className="list-group-item" key={week.week}>
                              <strong>{week.week}</strong> · Active {week.activeUsers} · Contributors{" "}
                              {week.contributors} · Consumers {week.consumers}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default MetricsDashboard;
