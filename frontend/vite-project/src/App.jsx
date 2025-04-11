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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/weekly" element={<WeeklyPage />} />
        <Route path="/monthly" element={<Calendar />} />
      </Routes>
    </Router>
  );
}

export default App;
