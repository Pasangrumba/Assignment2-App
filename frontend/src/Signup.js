import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Validation from "./SignupValidation";
import { authApi } from "./api";

function Signup() {
  const [values, setValues] = useState({
    name: "",
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

    if (err.name === "" && err.email === "" && err.password === "") {
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
    <div className="d-flex justify-content-center align-items-center bg-primary vh-100">
      <div className="bg-white p-3 rounded w-25">
        <h4 className="text-center">Sign-Up</h4>
        {serverError && <div className="alert alert-danger">{serverError}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name" className="text-left">
              <strong>Name</strong>
            </label>
            <input
              type="text"
              name="name"
              placeholder="Enter Name"
              onChange={handleInput}
              className="form-control rounded-0"
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
            <strong>{loading ? "Signing up..." : "Sign Up"}</strong>
          </button>
          <p></p>
          <Link
            to="/"
            className="btn btn-default border w-100 bg-light rounded-0 text-decoration-none"
          >
            <strong>Log In</strong>
          </Link>
        </form>
      </div>
    </div>
  );
}

export default Signup;
