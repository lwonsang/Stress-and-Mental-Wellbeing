import React from "react";
import "./Header.css";
import { useNavigate } from "react-router-dom";

const Header = ({
  title,
  user,
  showHome,
  onHomeClick,
  monthButtonText,
  rightButtonText,
  onMonthButtonClick,
  onRightButtonClick  
}) => {
  const navigate = useNavigate();

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
              fill="white"
            >
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
          </button>
        )}
        <div className="header-title">{title}</div>
      </div>
      
      {user && (
          <div className="header-user">
            Hi, {user.username}
          </div>
      )}
      
      <div className="header-right">
        {monthButtonText && (
          <button className="header-button" onClick={onMonthButtonClick}>
            {monthButtonText}
          </button>
        )}
        {rightButtonText && (
          <button className="header-button" onClick={onRightButtonClick}>
            {rightButtonText}
          </button>
        )}
        <button
          className="header-button"
          onClick={handleLogout}
          style={{ marginLeft: 8 }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Header;
