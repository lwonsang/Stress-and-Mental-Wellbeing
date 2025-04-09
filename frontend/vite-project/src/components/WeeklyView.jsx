import React, { useState } from "react";
import "./WeeklyView.css";
import TaskBox from "./TaskBox";
import WeeklyTaskPanel from "./WeeklyTaskPanel";

const WeeklyPage = () => {
  const [tasks, setTasks] = useState([
    {
      id: "t1",
      name: "Team Meeting",
      duration: "1h",
      workTime: "3h",
      dueDate: "2025-03-31",
      dueTime: "10:00",
      date: "2025-04-07",
      time: "10:00",
    },
    {
      id: "t2",
      name: "Workout",
      duration: "1h",
      workTime: "1h",
      dueDate: "2025-04-02",
      dueTime: "18:00",
      date: "2025-04-09",
      time: "18:00",
    },
  ]);

  const generateOptions = (max) => {
    const options = [];
    for (let i = 0.5; i <= max; i += 0.5) {
      options.push(`${i}h`);
    }
    return options;
  };

  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="weekly-layout">
      <WeeklyView
        tasks={tasks}
        setTasks={setTasks}
        setSelectedTask={setSelectedTask}
        setShowModal={setShowModal}
        setIsEditing={setIsEditing}
      />
      <WeeklyTaskPanel
        tasks={tasks}
        setTasks={setTasks}
        setSelectedTask={setSelectedTask}
        setShowModal={setShowModal}
        setIsEditing={setIsEditing}
      />

      {showModal && selectedTask && (
        <div className="task-modal">
          <div className="task-modal-content">
            <h3>{selectedTask.name}</h3>
            <p>
              <strong>Duration:</strong> {selectedTask.duration}
            </p>
            <p>
              <strong>Work Time:</strong> {selectedTask.workTime}
            </p>
            <p>
              <strong>Due:</strong> {selectedTask.dueDate}{" "}
              {selectedTask.dueTime}
            </p>
            <p>
              <strong>Date:</strong> {selectedTask.date}
            </p>
            <p>
              <strong>Time Slot:</strong> {selectedTask.time}
            </p>

            <div className="modal-buttons">
              <button
                className="modal-button close-btn"
                onClick={() => {
                  setIsEditing(false);
                  setShowModal(false);
                }}
              >
                Close
              </button>{" "}
              <button className="edit-btn" onClick={() => setIsEditing(true)}>
                Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditing && selectedTask && (
        <div className="task-modal">
          <div className="task-modal-content">
            <h3>Edit To-Do</h3>
            <label>Name:</label>
            <input
              value={selectedTask.name}
              onChange={(e) =>
                setSelectedTask({ ...selectedTask, name: e.target.value })
              }
              placeholder="Insert To-Do name here..."
            />

            <label>Duration:</label>
            <select
              value={selectedTask.duration}
              onChange={(e) => {
                const newDuration = e.target.value;
                setSelectedTask((prev) => {
                  const dur = parseFloat(newDuration);
                  const work = parseFloat(prev.workTime || 0);
                  const adjustedWorkTime = work > dur ? "" : prev.workTime;
                  return {
                    ...prev,
                    duration: newDuration,
                    workTime: adjustedWorkTime,
                  };
                });
              }}
            >
              <option value="" disabled hidden>
                Insert estimated duration of to-do
              </option>
              {generateOptions(10).map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <label>Work Time Duration:</label>
            <select
              value={selectedTask.workTime}
              onChange={(e) =>
                setSelectedTask({ ...selectedTask, workTime: e.target.value })
              }
            >
              <option value="" disabled hidden>
                I want to work on this for __ hours at once
              </option>
              {generateOptions(
                selectedTask.duration ? parseFloat(selectedTask.duration) : 10
              ).map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>

            <label>Due Date:</label>
            <input
              type="date"
              value={selectedTask.dueDate}
              onChange={(e) =>
                setSelectedTask({ ...selectedTask, dueDate: e.target.value })
              }
            />

            <label>Due Time:</label>
            <input
              type="time"
              value={selectedTask.dueTime}
              onChange={(e) =>
                setSelectedTask({ ...selectedTask, dueTime: e.target.value })
              }
            />

            <div className="modal-buttons">
              <button
                className="modal-button close-btn"
                onClick={() => {
                  setIsEditing(false);
                  setShowModal(false);
                }}
              >
                Close
              </button>{" "}
              <button
                className="modal-button delete-btn"
                onClick={() => {
                  setTasks(tasks.filter((t) => t.id !== selectedTask.id));
                  setIsEditing(false);
                  setShowModal(false);
                }}
              >
                Delete
              </button>
              <button
                className="modal-button submit-btn"
                onClick={() => {
                  const exists = tasks.some((t) => t.id === selectedTask.id);
                  if (exists) {
                    setTasks((prev) =>
                      prev.map((t) =>
                        t.id === selectedTask.id ? selectedTask : t
                      )
                    );
                  } else {
                    setTasks((prev) => [...prev, selectedTask]);
                  }
                  setIsEditing(false);
                  setShowModal(false);
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const hours = Array.from(
  { length: 24 },
  (_, i) => `${i.toString().padStart(2, "0")}:00`
);

const WeeklyView = ({
  tasks,
  setTasks,
  setSelectedTask,
  setShowModal,
  setIsEditing,
}) => {
  const getStartOfWeek = (date) => {
    const d = new Date(date);
    d.setDate(d.getDate() - d.getDay());
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const [weekStart, setWeekStart] = useState(getStartOfWeek(new Date()));

  const getDatesOfWeek = (start) => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      dates.push(new Date(d));
    }
    return dates;
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

  const handleDrop = (e, targetDateStr, targetTime) => {
    e.preventDefault();
    const draggedTask = JSON.parse(e.dataTransfer.getData("text/plain"));
    setTasks((prev) =>
      prev.map((t) =>
        t.id === draggedTask.id
          ? { ...t, date: targetDateStr, time: targetTime }
          : t
      )
    );
  };

  const onClickTask = (task) => {
    setSelectedTask(task);
    setShowModal(true);
  };

  return (
    <div className="weekly-container">
      <div className="weekly-header">
        <button className="nav-btn" onClick={handlePrev}>
          {"<"}
        </button>
        <div className="week-label">Week of {weekStart.toDateString()}</div>
        <button className="nav-btn" onClick={handleNext}>
          {">"}
        </button>
      </div>

      <div className="weekly-grid">
        <div className="time-column">
          <div className="day-header empty-cell"></div>
          {hours.map((hour) => (
            <div key={hour} className="time-cell">
              {hour}
            </div>
          ))}
        </div>

        {dates.map((date, i) => {
          const dayName = days[date.getDay()];
          const dateStr = date.toISOString().split("T")[0];

          return (
            <div key={i} className="day-column">
              <div className="day-header">
                {formatDate(date)}
                <br />
                {dayName}
              </div>
              {hours.map((hour, j) => {
                const task = tasks.find(
                  (t) => t.date === dateStr && t.time === hour
                );
                return (
                  <div
                    key={j}
                    className="day-cell"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, dateStr, hour)}
                  >
                    {task && <TaskBox task={task} onClick={onClickTask} />}
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

export default WeeklyPage;
