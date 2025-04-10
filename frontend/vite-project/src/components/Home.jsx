import React, { useEffect, useState } from "react";
import "./Home.css";
import Header from "./Header";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const hours = Array.from(
  { length: 18 },
  (_, i) => `${(i + 6).toString().padStart(2, "0")}:00`
);

const getStartOfWeek = () => {
  const now = new Date();
  now.setDate(now.getDate() - now.getDay());
  now.setHours(0, 0, 0, 0);
  return now;
};

const Home = ({ goToWeekly }) => {
  const [tasks, setTasks] = useState([]);
  const [weekStart, setWeekStart] = useState(getStartOfWeek());

  useEffect(() => {
    const stored = localStorage.getItem("tasks");
    if (stored) setTasks(JSON.parse(stored));
  }, []);

  const getDatesOfWeek = () =>
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d.toISOString().split("T")[0];
    });

  const dateList = getDatesOfWeek();

  const sortedTasks = [...tasks]
    .filter((t) => t.date && t.time)
    .sort(
      (a, b) =>
        new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`)
    );

  return (
    <div className="home-page">
      <Header
        title="Project Name?"
        monthButtonText="View Monthly"
        rightButtonText="Edit Schedule"
        onMonthButtonClick={goToMonthly}
        onRightButtonClick={goToWeekly}
      />

      <div className="home-main">
        <div className="readonly-section">
          <div className="section-title">This Week's Schedule</div>

          <div className="readonly-grid">
            <div className="readonly-row">
              <div className="readonly-cell empty-cell" />
              {dateList.map((d, i) => (
                <div key={i} className="readonly-cell day-label">
                  {days[i]}
                </div>
              ))}
            </div>

            {hours.map((hour, hIdx) => (
              <div key={hIdx} className="readonly-row">
                <div className="readonly-cell time-label">{hour}</div>
                {dateList.map((date, dIdx) => {
                  const task = tasks.find(
                    (t) => t.date === date && t.time === hour
                  );
                  return (
                    <div key={dIdx} className="readonly-cell task-slot">
                      {task && <div className="readonly-task">{task.name}</div>}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="task-list-panel">
          <div className="task-list-title">Upcoming Tasks</div>
          <ul className="task-list">
            {sortedTasks.map((task) => (
              <li key={task.id} className="task-list-item">
                <span className="task-name">{task.name}</span>
                <span className="task-time">
                  {task.date} {task.time}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Home;
