import { useState } from "react";
import "./App.css";
import WeeklyPage from "./components/WeeklyView";
import Home from "./components/Home";
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Calendar from './components/MonthlyView'
import { useEffect } from "react";

function App() {
  const [page, setPage] = useState("home");
  useEffect(() => {
    setPage("home");
  }, []);
  return (
    <div>
      {page === "home" && (
        <Home
          goToWeekly={() => setPage("weekly")}
          goToMonthly={() => setPage("monthly")}
        />
      )}
      {page === "weekly" && (
        <WeeklyPage goHome={() => setPage("home")} />
      )}
      {page === "monthly" && (
        <Calendar goHome={() => setPage("home")} />
      )}
    </div>
  );
}

export default App;
