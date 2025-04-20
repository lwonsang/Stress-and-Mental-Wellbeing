import React, { useState } from "react";
import "./Header.css";
import { useNavigate } from "react-router-dom";

const Header = ({ title, user, showHome, onHomeClick, currentView }) => {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);

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
            onClick={() => {
              setShowUserMenu((prev) => !prev);
              setShowAddMenu(false);
            }}
          >
            Hi, {user.username} ⌄
          </button>
          {showUserMenu && (
            <div className="dropdown-menu">
              <button onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>

      <div className="header-right">
        {currentView === "" && (
          <div className="add-dropdown">
            <button
              className="add-button"
              onClick={() => {
                setShowAddMenu((prev) => !prev);
                setShowUserMenu(false);
              }}
            >
              ＋ Manage
            </button>
            {showAddMenu && (
              <div className="add-dropdown-menu">
                <button onClick={() => navigate("/monthly")}>
                  Manage Events
                </button>
                <button onClick={() => navigate("/weekly")}>
                  Manage Tasks
                </button>
              </div>
            )}
          </div>
        )}

        {currentView === "monthly" && (
          <button className="header-button" onClick={() => navigate("/weekly")}>
            Manage Tasks
          </button>
        )}

        {currentView === "weekly" && (
          <button
            className="header-button"
            onClick={() => navigate("/monthly")}
          >
            Manage Events
          </button>
        )}
      </div>
    </div>
  );
};

export default Header;
