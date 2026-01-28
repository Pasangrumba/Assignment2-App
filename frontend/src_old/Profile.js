import React, { useEffect, useState } from "react";
import NavBar from "./NavBar";
import { authApi, setToken } from "./api";

function Profile() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "",
    region: "",
    languages: "",
    availability: "",
    skills: "",
    domains: "",
    certifications: "",
    currentProjects: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    authApi
      .me()
      .then((data) => {
        const user = data.user;
        setForm((prev) => ({
          ...prev,
          name: user.name || "",
          email: user.email || "",
          role: user.role || "",
          region: user.region || "",
          languages: (user.languages || []).join(", "),
          availability: user.availability || "",
          skills: (user.expertise?.skills || []).join(", "),
          domains: (user.expertise?.domains || []).join(", "),
          certifications: (user.expertise?.certifications || []).join(", "),
          currentProjects: (user.expertise?.currentProjects || []).join(", "),
        }));
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
        role: form.role.trim() || undefined,
        region: form.region.trim() || undefined,
        languages: form.languages || undefined,
        availability: form.availability.trim() || undefined,
        skills: form.skills || undefined,
        domains: form.domains || undefined,
        certifications: form.certifications || undefined,
        currentProjects: form.currentProjects || undefined,
      })
      .then((res) => {
        if (res.token) {
          setToken(res.token);
        }
        const user = res.user;
        setForm((prev) => ({
          ...prev,
          name: user.name || "",
          email: user.email || "",
          role: user.role || "",
          region: user.region || "",
          languages: (user.languages || []).join(", "),
          availability: user.availability || "",
          skills: (user.expertise?.skills || []).join(", "),
          domains: (user.expertise?.domains || []).join(", "),
          certifications: (user.expertise?.certifications || []).join(", "),
          currentProjects: (user.expertise?.currentProjects || []).join(", "),
          password: "",
          confirmPassword: "",
        }));
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
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label">Name</label>
                  <input
                    className="form-control"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-12 col-md-6">
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
                <div className="col-12 col-md-6">
                  <label className="form-label">Role</label>
                  <input
                    className="form-control"
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    placeholder="e.g. Knowledge Manager"
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label">Region</label>
                  <input
                    className="form-control"
                    name="region"
                    value={form.region}
                    onChange={handleChange}
                    placeholder="e.g. UK, EU"
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label">Languages</label>
                  <input
                    className="form-control"
                    name="languages"
                    value={form.languages}
                    onChange={handleChange}
                    placeholder="Comma separated e.g. English, French"
                  />
                  <div className="form-text">Tracked for UserProfile and availability.</div>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label">Availability</label>
                  <input
                    className="form-control"
                    name="availability"
                    value={form.availability}
                    onChange={handleChange}
                    placeholder="e.g. 50% this quarter"
                  />
                </div>
              </div>

              <hr className="my-4" />
              <h6 className="mb-3">Expertise Profile</h6>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label">Skills</label>
                  <input
                    className="form-control"
                    name="skills"
                    value={form.skills}
                    onChange={handleChange}
                    placeholder="Comma separated e.g. React, Node.js"
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label">Domains</label>
                  <input
                    className="form-control"
                    name="domains"
                    value={form.domains}
                    onChange={handleChange}
                    placeholder="e.g. FinTech, Healthcare"
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label">Certifications</label>
                  <input
                    className="form-control"
                    name="certifications"
                    value={form.certifications}
                    onChange={handleChange}
                    placeholder="e.g. AWS SA, PMP"
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label">Current Projects</label>
                  <input
                    className="form-control"
                    name="currentProjects"
                    value={form.currentProjects}
                    onChange={handleChange}
                    placeholder="e.g. DKN rollout, API redesign"
                  />
                </div>
              </div>

              <hr className="my-4" />
              <h6 className="mb-3">Security</h6>
              <div className="row g-3">
                <div className="col-12 col-md-6">
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
                <div className="col-12 col-md-6">
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
              </div>

              <div className="mt-3">
                <button className="btn btn-success" type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Update Profile"}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

export default Profile;
