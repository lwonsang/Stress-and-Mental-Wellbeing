import { useState } from "react";
import "./App.css";
import WeeklyPage from "./components/WeeklyView";
import Home from "./components/Home";

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
