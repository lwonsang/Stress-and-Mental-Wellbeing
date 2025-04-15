import React, { useState } from "react";
import "./Header.css";
import { useNavigate } from "react-router-dom";

const Header = ({ title, user, showHome, onHomeClick, currentView }) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  return (
    <div className="home-header">
      <div className="header-left">
      {showHome && (
  <button className="home-icon" onClick={onHomeClick} title="Go Home">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
    <span>Home</span>
  </button>
)}

        <div className="header-title">{title}</div>

        <div className="user-dropdown">
          <button
            className="user-toggle"
            onClick={() => setShowMenu((prev) => !prev)}
          >
            Hi, {user.username} ⌄
          </button>
          {showMenu && (
            <div className="dropdown-menu">
              <button onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>

      <div className="header-right">
        <div className="view-switcher-container">
          <div className="view-switcher">
            <button
              className={`header-button ${
                currentView === "monthly" ? "active" : ""
              }`}
              onClick={() => navigate("/monthly")}
              title="Edit Events (Monthly View)"
            >
              Monthly
            </button>
            <button
              className={`header-button ${
                currentView === "weekly" ? "active" : ""
              }`}
              onClick={() => navigate("/weekly")}
              title="Edit Tasks (Weekly View)"
            >
              Weekly
            </button>
          </div>
          <div className="view-description">
            Switch between event planning and task scheduling
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
