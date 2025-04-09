import { useState } from "react";
import "./App.css";
import WeeklyPage from "./components/WeeklyView";
import Home from "./components/Home";
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Calendar from './components/MonthlyView'

function App() {
  const [page, setPage] = useState("home");

  return (
    <div>
      {page === "home" && <Home goToWeekly={() => setPage("weekly")} />}
      {page === "weekly" && <WeeklyPage goHome={() => setPage("home")} />}
    </div>
  );
}

export default App;
