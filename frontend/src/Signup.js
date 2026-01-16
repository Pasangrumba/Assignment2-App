import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Validation from "./SignupValidation";
import { authApi } from "./api";

function Signup() {
  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInput = (event) => {
    setValues((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const err = Validation(values);
    setErrors(err);
    setServerError("");

    if (
      err.name === "" &&
      err.email === "" &&
      err.password === "" &&
      err.confirmPassword === ""
    ) {
      setLoading(true);
      authApi
        .register({
          name: values.name.trim(),
          email: values.email.trim(),
          password: values.password,
        })
        .then(() => {
          navigate("/");
        })
        .catch((error) => {
          setServerError(error.message);
        })
        .finally(() => setLoading(false));
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-panel">
        <div className="auth-brand">
          <h1>Digital Knowledge Network System</h1>
          <p>Create your workspace identity</p>
        </div>
        <div className="auth-card">
          <h4 className="text-center">Create account</h4>
          <div className="text-center auth-subtitle">
            Set up access to manage and govern knowledge assets.
          </div>
          <div className="text-center auth-subtitle">
          All users register with the default author role. Reviewer roles are assigned after sign-in via the User Profile.
          </div>
          {serverError && (
            <div className="alert alert-danger">{serverError}</div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="name" className="text-left">
                <strong>Name</strong>
              </label>
              <input
                type="text"
                name="name"
                placeholder="Your full name"
                onChange={handleInput}
                className="form-control rounded-0 auth-input"
              />
              {errors.name && <span className="text-danger">{errors.name}</span>}
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="text-left">
                <strong>Email</strong>
              </label>
              <input
                type="email"
                name="email"
                placeholder="you@institution.ac.uk"
                onChange={handleInput}
                className="form-control rounded-0 auth-input"
              />
              {errors.email && (
                <span className="text-danger">{errors.email}</span>
              )}
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="text-left">
                <strong>Password</strong>
              </label>
              <input
                type="password"
                name="password"
                placeholder="Create a secure password"
                onChange={handleInput}
                className="form-control rounded-0 auth-input"
              />
              {errors.password && (
                <span className="text-danger">{errors.password}</span>
              )}
            </div>
            <div className="mb-3">
              <label htmlFor="confirmPassword" className="text-left">
                <strong>Confirm Password</strong>
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Re-enter your password"
                onChange={handleInput}
                className="form-control rounded-0 auth-input"
              />
              {errors.confirmPassword && (
                <span className="text-danger">{errors.confirmPassword}</span>
              )}
            </div>
            <button
              type="submit"
              className="btn btn-success w-100"
              disabled={loading}
            >
              <strong>{loading ? "Creating account..." : "Join the network"}</strong>
            </button>
            <div className="auth-footer text-center">
              <span className="text-muted">Already signed up? </span>
              <Link to="/" className="text-decoration-none fw-bold">
                Return to sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;
