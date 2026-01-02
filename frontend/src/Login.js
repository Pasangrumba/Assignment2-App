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
    <div className="d-flex justify-content-center align-items-center bg-primary vh-100">
      <div className="bg-white p-3 rounded w-25">
        <h4 className="text-center">Sign-In</h4>
        {serverError && <div className="alert alert-danger">{serverError}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="text-left">
              <strong>Email</strong>
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter Email"
              onChange={handleInput}
              className="form-control rounded-0"
            />
            {errors.email && <span className="text-danger">{errors.email}</span>}
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="text-left">
              <strong>Password</strong>
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter Password"
              onChange={handleInput}
              className="form-control rounded-0"
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
            <strong>{loading ? "Logging in..." : "Log In"}</strong>
          </button>
          <p></p>
          <Link
            to="/signup"
            className="btn btn-default border w-100 bg-light rounded-0 text-decoration-none"
          >
            <strong>Create Account</strong>
          </Link>
        </form>
      </div>
    </div>
  );
}

export default Login;
