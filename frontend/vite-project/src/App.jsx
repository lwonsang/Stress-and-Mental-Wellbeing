import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import "./App.css";
import WeeklyPage from "./components/WeeklyView";
import Home from "./components/Home";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Calendar from "./components/MonthlyView";
import { useEffect } from "react";
import Login from "./components/Login";

function App() {
  const isProd = import.meta.env.MODE === "production";
  
  useEffect(() => {
    const existing = JSON.parse(localStorage.getItem("accounts")) || [];
    const hasSample = existing.some(acc => acc.username === "testuser");
    if (!hasSample) {
      existing.push({ username: "testuser", password: "123456" });
      localStorage.setItem("accounts", JSON.stringify(existing));
    }
  }, []);

  return (

    <Router basename={isProd ? "/Stress-and-Mental-Wellbeing" : "/"}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={localStorage.getItem("currentUser") ? <Home /> : <Login />}
        />
        <Route
          path="/weekly"
          element={localStorage.getItem("currentUser") ? <WeeklyPage /> : <Login />}
        />
        <Route
          path="/monthly"
          element={localStorage.getItem("currentUser") ? <Calendar /> : <Login />}
        />
      </Routes>
    </Router>
  );
}

export default App;
