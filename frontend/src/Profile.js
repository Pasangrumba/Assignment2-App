import React, { useEffect, useState } from "react";
import NavBar from "./NavBar";
import { authApi, setToken } from "./api";

function Profile() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    authApi
      .me()
      .then((data) => {
        setForm((prev) => ({ ...prev, name: data.user.name, email: data.user.email }));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (form.password && form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSaving(true);
    authApi
      .updateMe({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password || undefined,
      })
      .then((res) => {
        if (res.token) {
          setToken(res.token);
        }
        setForm((prev) => ({ ...prev, password: "", confirmPassword: "" }));
        setSuccess("Profile updated");
      })
      .catch((err) => setError(err.message || "Update failed"))
      .finally(() => setSaving(false));
  };

  return (
    <div className="app-shell">
      <NavBar />
      <main className="app-main">
        <div className="container py-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h2 className="h4 mb-0">Profile</h2>
              <div className="text-muted small">View and update your account details.</div>
            </div>
          </div>

          {loading && <p>Loading profile...</p>}
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {!loading && (
            <form className="card p-3" onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input
                  className="form-control"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  className="form-control"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">New Password (optional)</label>
                <input
                  className="form-control"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Leave blank to keep current password"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Confirm New Password</label>
                <input
                  className="form-control"
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter new password"
                />
              </div>
              <button className="btn btn-success" type="submit" disabled={saving}>
                {saving ? "Saving..." : "Update Profile"}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

export default Profile;
