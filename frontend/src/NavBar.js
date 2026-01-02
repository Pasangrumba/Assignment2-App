import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { assetsApi, setToken } from "./api";

function NavBar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    setToken(null);
    navigate("/");
  };

  const handleReset = async () => {
    const confirmed = window.confirm(
      "This will delete all of your assets (drafts and published). Continue?"
    );
    if (!confirmed) {
      return;
    }

    try {
      await assetsApi.resetMine();
      navigate(0);
    } catch (err) {
      alert(err.message || "Failed to reset assets.");
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
      <Link className="navbar-brand" to="/dashboard">
        MWCD Knowledge Hub
      </Link>
      <div className="navbar-nav">
        <Link className="nav-link" to="/dashboard">
          Dashboard
        </Link>
        <Link className="nav-link" to="/assets/new">
          Create Asset
        </Link>
        <Link className="nav-link" to="/library">
          Library
        </Link>
      </div>
      <div className="ms-auto d-flex gap-2">
        <button className="btn btn-outline-warning btn-sm" onClick={handleReset}>
          Reset Assets
        </button>
        <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
          Log Out
        </button>
      </div>
    </nav>
  );
}

export default NavBar;
