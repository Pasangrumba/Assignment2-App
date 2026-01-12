import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authApi, setToken } from "./api";

function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  const handleLogout = () => {
    setToken(null);
    navigate("/");
  };

  useEffect(() => {
    authApi
      .me()
      .then((data) => setUser(data.user))
      .catch(() => setUser(null));
  }, []);

  const initials = useMemo(() => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [user]);

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: "🏠" },
    { to: "/assets/new", label: "Create Asset", icon: "📝" },
    { to: "/library", label: "Library", icon: "📚" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark">DKN</div>
        <div className="brand-text">
          <div className="brand-title">Digital Knowledge</div>
          <div className="brand-subtitle">Network System</div>
        </div>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`sidebar-link ${
              location.pathname.startsWith(item.to) ? "active" : ""
            }`}
          >
            <span className="sidebar-icon" aria-hidden>
              {item.icon}
            </span>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button
          className="sidebar-profile"
          onClick={() => navigate("/profile")}
          type="button"
        >
          <span className="profile-avatar">{initials}</span>
          <div className="profile-meta">
            <div className="profile-name">{user?.name || "Profile"}</div>
            <div className="profile-email text-muted small">
              {user?.email || "View details"}
            </div>
            {(user?.role || user?.region) && (
              <div className="text-muted small">
                {[user?.role, user?.region].filter(Boolean).join(" · ")}
              </div>
            )}
          </div>
        </button>
        <button className="btn btn-outline-light btn-sm w-100" onClick={handleLogout}>
          <span aria-hidden>↩</span> Log Out
        </button>
      </div>
    </aside>
  );
}

export default NavBar;
