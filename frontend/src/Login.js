import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Validation from "./LoginValidation";
import { authApi, setToken } from "./api";

function Login() {
  const [values, setValues] = useState({
    email: "",
    password: "",
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

    if (err.email === "" && err.password === "") {
      setLoading(true);
      authApi
        .login({
          email: values.email.trim(),
          password: values.password,
        })
        .then((res) => {
          setToken(res.token);
          navigate("/dashboard");
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
          <p>Centralized access to managed knowledge assets</p>
        </div>
        <div className="auth-card">
          <h4 className="text-center">Sign in</h4>
          <div className="text-center auth-subtitle">
            Continue to the Digital Knowledge Network workspace.
          </div>
          {serverError && (
            <div className="alert alert-danger">{serverError}</div>
          )}
          <form onSubmit={handleSubmit}>
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
                placeholder="Enter your password"
                onChange={handleInput}
                className="form-control rounded-0 auth-input"
              />
              {errors.password && (
                <span className="text-danger">{errors.password}</span>
              )}
            </div>
            <button
              type="submit"
              className="btn btn-success w-100"
              disabled={loading}
            >
              <strong>{loading ? "Signing you in..." : "Access workspace"}</strong>
            </button>
            <div className="auth-footer text-center">
              <span className="text-muted">First time here? </span>
              <Link to="/signup" className="text-decoration-none fw-bold">
                Create an account
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
