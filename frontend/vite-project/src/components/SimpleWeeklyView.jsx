import React, { useState, useEffect } from "react";
import "./WeeklyView.css";

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, "0")}:00`);

const getStartOfWeek = (date) => {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
};

const SimpleWeeklyView = () => {
  const [tasks, setTasks] = useState([]);
  const [weekStart, setWeekStart] = useState(getStartOfWeek(new Date()));

  useEffect(() => {
    const saved = localStorage.getItem("tasks");
    setTasks(saved ? JSON.parse(saved) : []);
  }, []);

  const getDatesOfWeek = (start) => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return new Date(d);
    });
  };

  const dates = getDatesOfWeek(weekStart);

  const formatDate = (date) => {
    const month = date.toLocaleString("en-US", { month: "short" });
    return `${month} ${date.getDate()}`;
  };

  const handlePrev = () => {
    const prev = new Date(weekStart);
    prev.setDate(prev.getDate() - 7);
    setWeekStart(prev);
  };

  const handleNext = () => {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + 7);
    setWeekStart(next);
  };

  return (
    <div className="weekly-container">
      <div className="weekly-header">
        <button className="nav-btn" onClick={handlePrev}>{"<"}</button>
        <div className="week-label">Week of {weekStart.toDateString()}</div>
        <button className="nav-btn" onClick={handleNext}>{">"}</button>
      </div>

      <div className="weekly-grid">
        <div className="time-column">
          <div className="day-header empty-cell"></div>
          {hours.map((hour) => (
            <div key={hour} className="time-cell">{hour}</div>
          ))}
        </div>

        {dates.map((date, i) => {
          const dayName = days[date.getDay()];
          const dateStr = date.toISOString().split("T")[0];

          return (
            <div key={i} className="day-column">
              <div className="day-header">
                {formatDate(date)}<br />{dayName}
              </div>
              {hours.map((hour, j) => {
                const task = tasks.find(t => t.date === dateStr && t.time === hour);
                return (
                  <div key={j} className="day-cell">
                    {task && <div className="task-box">{task.name}</div>}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SimpleWeeklyView;
