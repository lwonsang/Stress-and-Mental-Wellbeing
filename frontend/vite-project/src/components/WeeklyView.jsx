import React, { useState } from "react";
import "./WeeklyView.css";
import TaskBox from "./TaskBox";
import WeeklyTaskPanel from "./WeeklyTaskPanel";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useEffect } from "react";
import Header from "./Header";

const WeeklyPage = ({ goHome }) => {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("tasks");
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: "t1",
            name: "Learning",
            duration: "3h",
            workTime: "1h",
            dueDate: "2025-04-30",
            dueTime: "10:00",
            slots: [
              { date: "2025-04-07", time: "10:00" },
              { date: "2025-04-08", time: "10:00" },
              { date: "2025-04-09", time: "10:00" },
            ],
          },
          {
            id: "t2",
            name: "Workout",
            duration: "1h",
            workTime: "1h",
            dueDate: "2025-04-10",
            dueTime: "18:00",
            slots: [{ date: "2025-04-09", time: "18:00" }],
          },
        ];
  });

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const generateOptions = (max) => {
    const options = [];
    for (let i = 0.5; i <= max; i += 0.5) {
      options.push(`${i}h`);
    }
    return options;
  };

  const generateSchedule = () => {
    const hours = Array.from(
      { length: 16 },
      (_, i) => `${(i + 6).toString().padStart(2, "0")}:00`
    );

    const morning = hours.slice(0, 5);
    const midday = hours.slice(5, 10);
    const evening = hours.slice(10);

    const mixedHours = [
      ...morning.sort(() => Math.random() - 0.5),
      ...midday.sort(() => Math.random() - 0.5),
      ...evening.sort(() => Math.random() - 0.5),
    ].sort(() => Math.random() - 0.5);

    const dayOrder = Array.from({ length: 7 }, (_, i) => i).sort(
      () => Math.random() - 0.5
    );

    const now = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const used = new Set();
    tasks.forEach((t) =>
      t.slots?.forEach((s) => {
        const hour = parseInt(s.time.split(":")[0], 10);
        used.add(`${s.date}-${hour.toString().padStart(2, "0")}:00`);
        used.add(`${s.date}-${(hour + 1).toString().padStart(2, "0")}:00`);
      })
    );

    const insufficientTasks = [];

    const newTasks = tasks.map((task) => {
      if (Array.isArray(task.slots) && task.slots.length > 0) return task;

      const total = parseFloat(task.duration);
      const unit = parseFloat(task.workTime);
      if (!total || !unit) return task;

      const needed = Math.ceil(total / unit);
      const newSlots = [];
      let filled = 0;
      let offset = 0;

      const due = new Date(`${task.dueDate}T${task.dueTime || "23:59"}`);

      while (filled < needed && offset < 14) {
        for (let time of mixedHours) {
          for (let d of dayOrder) {
            const day = new Date(startDate);
            day.setDate(startDate.getDate() + ((d + offset) % 7));
            const dateStr = day.toISOString().split("T")[0];
            const slotDateTime = new Date(`${dateStr}T${time}`);

            const hour = parseInt(time.split(":")[0], 10);
            const hourBlock = [
              `${hour.toString().padStart(2, "0")}:00`,
              `${(hour + 1).toString().padStart(2, "0")}:00`,
            ];
            const blockKeys = hourBlock.map((t) => `${dateStr}-${t}`);
            const blockUsed = blockKeys.some((k) => used.has(k));

            if (slotDateTime > due || slotDateTime < now || blockUsed) continue;

            blockKeys.forEach((k) => used.add(k));
            newSlots.push({ date: dateStr, time });
            filled++;
            if (filled >= needed) break;
          }
          if (filled >= needed) break;
        }
        offset++;
      }

      if (filled < needed) {
        insufficientTasks.push(task.name || "Unnamed Task");
        return { ...task, slots: undefined };
      }

      return { ...task, slots: newSlots };
    });

    setTasks(newTasks);

    if (insufficientTasks.length > 0) {
      alert(
        `Some tasks couldn't be fully scheduled before their due time:\n\n${insufficientTasks.join(
          "\n"
        )}\n\nPlease adjust the due date, time, or duration and try again.`
      );
    }
  };

  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <>
      <Header title="Project Name?" showHome={true} onHomeClick={goHome} />
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
          generateSchedule={generateSchedule}
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
                <strong>Date:</strong>{" "}
                {selectedTask.selectedSlot?.date || "N/A"}
              </p>
              <p>
                <strong>Time Slot:</strong>{" "}
                {selectedTask.selectedSlot?.time || "N/A"}
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
              <div style={{ width: "100%" }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <TimePicker
                    ampm={false}
                    value={
                      selectedTask.dueTime
                        ? dayjs(`2025-01-01T${selectedTask.dueTime}`)
                        : null
                    }
                    onChange={(value) =>
                      setSelectedTask({
                        ...selectedTask,
                        dueTime: value ? value.format("HH:mm") : "",
                      })
                    }
                    slotProps={{
                      textField: {
                        variant: "standard",
                        InputProps: {
                          style: {
                            backgroundColor: "white",
                            borderRadius: "4px",
                            fontSize: "1rem",
                            border: "1px solid #ccc",
                            height: "36px",
                            padding: "0 12px",
                            boxSizing: "border-box",
                          },
                        },
                        fullWidth: true,
                      },
                    }}
                    sx={{ marginTop: "4px" }}
                  />
                </LocalizationProvider>
              </div>

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
                    const { name, duration, workTime, dueDate, dueTime } =
                      selectedTask;

                    if (
                      !name ||
                      !duration ||
                      !workTime ||
                      !dueDate ||
                      !dueTime
                    ) {
                      alert("Please fill out all fields before submitting.");
                      return;
                    }

                    const exists = tasks.some((t) => t.id === selectedTask.id);
                    if (exists) {
                      setTasks((prev) =>
                        prev.map((t) => {
                          if (t.id !== selectedTask.id) return t;

                          const original = t;
                          const durationChanged =
                            original.duration !== selectedTask.duration;
                          const workTimeChanged =
                            original.workTime !== selectedTask.workTime;
                          const dueDateChanged =
                            original.dueDate !== selectedTask.dueDate;
                          const dueTimeChanged =
                            original.dueTime !== selectedTask.dueTime;

                          const shouldClearSlots =
                            durationChanged ||
                            workTimeChanged ||
                            dueDateChanged ||
                            dueTimeChanged;

                          return {
                            ...selectedTask,
                            slots: shouldClearSlots ? [] : original.slots || [],
                          };
                        })
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
    </>
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
    const data = JSON.parse(e.dataTransfer.getData("application/json"));
    const { taskId, slot: oldSlot } = data;

    const newSlot = { date: targetDateStr, time: targetTime };

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;

        const updatedSlots = t.slots
          .filter((s) => !(s.date === oldSlot.date && s.time === oldSlot.time)) // 删除旧的
          .concat([newSlot]);

        return { ...t, slots: updatedSlots };
      })
    );
  };

  const onClickTask = (task, slot) => {
    setSelectedTask({
      ...task,
      selectedSlot: slot,
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
    });
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
                const tasksInSlot = tasks.filter((t) =>
                  t.slots?.some((s) => s.date === dateStr && s.time === hour)
                );

                return (
                  <div
                    key={j}
                    className="day-cell"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, dateStr, hour)}
                  >
                    {tasks.flatMap((task) =>
                      task.slots
                        ?.filter((s) => s.date === dateStr && s.time === hour)
                        .map((slot, idx) => (
                          <TaskBox
                            key={`${task.id}-${slot.date}-${slot.time}-${idx}`}
                            task={task}
                            slot={slot}
                            onClick={onClickTask}
                          />
                        ))
                    )}
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
