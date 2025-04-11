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
import EventBox from "./EventBox";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";


const WeeklyPage = () => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const passedDateStr = location.state?.selectedDate;
  const passedDate = passedDateStr ? new Date(passedDateStr) : new Date();

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
  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem("events");
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: "e1",
            name: "Daily Meeting",
            startTime: "10:00",
            startDate: "2025-04-07",
            endTime: "11:30",
            endDate: "2025-04-11",
            repeat: "daily",
          },
          {
            id: "e2",
            name: "Doctor Appointment",
            startTime: "15:00",
            startDate: "2025-04-08",
            endTime: "16:00",
            endDate: "2025-04-08",
            repeat: "never",
          },
          {
            id: "e3",
            name: "Team Sync",
            startTime: "09:00",
            startDate: "2025-04-09",
            endTime: "09:30",
            endDate: "2025-04-30",
            repeat: "weekly",
          },
        ];
  });
  useEffect(() => {
    const eventSlots = expandEventSlots(events);
    const cleanedTasks = removeTaskConflicts(tasks, eventSlots);
    setTasks(cleanedTasks);
  }, [events]);

  useEffect(() => {
    localStorage.setItem("events", JSON.stringify(events));
  }, [events]);

  const expandEventSlots = (events) => {
    const eventSlots = [];

    events.forEach((event) => {
      const { id, name, startTime, startDate, endTime, endDate, repeat } =
        event;

      const start = new Date(`${startDate}T${startTime}`);
      const end = new Date(`${endDate}T${endTime}`);
      let current = new Date(start);

      while (current <= end) {
        const dateStr = `${current.getFullYear()}-${(current.getMonth() + 1)
          .toString()
          .padStart(2, "0")}-${current.getDate().toString().padStart(2, "0")}`;

        const [startHour, startMin] = startTime.split(":").map(Number);
        const [endHour, endMin] = endTime.split(":").map(Number);
        let durationHours =
          (endHour * 60 + endMin - (startHour * 60 + startMin)) / 60;
        durationHours = Math.max(1, durationHours);
        eventSlots.push({
          id,
          name,
          date: dateStr,
          time: startTime,
          duration: durationHours,
          endTime,
          repeat,
          startDate,
          endDate,
        });

        if (repeat === "Never") break;
        if (repeat === "Daily") current.setDate(current.getDate() + 1);
        else if (repeat === "Weekly") current.setDate(current.getDate() + 7);
        else if (repeat === "Monthly") current.setMonth(current.getMonth() + 1);
      }
    });

    return eventSlots;
  };

  const removeTaskConflicts = (taskList, eventSlots) => {
    const blockedKeys = new Set(
      eventSlots.flatMap((e) => {
        const [sh, sm] = e.time.split(":").map(Number);
        const blocks = [];
        for (let i = 0; i < Math.ceil(e.duration * 2); i++) {
          const totalMin = sh * 60 + sm + i * 30;
          const h = Math.floor(totalMin / 60);
          const m = totalMin % 60;
          blocks.push(
            `${e.date}-${h.toString().padStart(2, "0")}:${m
              .toString()
              .padStart(2, "0")}`
          );
        }
        return blocks;
      })
    );

    return taskList.map((task) => {
      const hasConflict = (task.slots || []).some((slot) =>
        blockedKeys.has(`${slot.date}-${slot.time}`)
      );

      return {
        ...task,
        slots: hasConflict ? [] : task.slots,
      };
    });
  };

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

    tasks.forEach((task) => {
      if (!task.slots || !task.slots.length) return;

      const unitStr = String(task.workTime || "")
        .replace("h", "")
        .trim();
      const unit = parseFloat(unitStr) || 1;

      task.slots.forEach((slot) => {
        const [startHour, startMin] = slot.time.split(":").map(Number);

        const halfHoursCount = Math.ceil(unit * 2);

        for (let i = 0; i < halfHoursCount; i++) {
          const hh = startHour + Math.floor((startMin + i * 30) / 60);
          const mm = (startMin + i * 30) % 60;
          const timeStr = `${hh.toString().padStart(2, "0")}:${mm
            .toString()
            .padStart(2, "0")}`;
          used.add(`${slot.date}-${timeStr}`);
        }
      });
    });

    const eventSlots = expandEventSlots(events);
    eventSlots.forEach((e) => {
      const [startHour, startMin] = e.time.split(":").map(Number);
      const duration = parseFloat(e.duration || 1);
      const totalHalfHours = Math.ceil(duration * 2);

      for (let i = 0; i < totalHalfHours; i++) {
        const hour = startHour + Math.floor((startMin + i * 30) / 60);
        const minute = (startMin + i * 30) % 60;
        const timeStr = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        used.add(`${e.date}-${timeStr}`);
      }
    });

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
            const slotStart = new Date(`${dateStr}T${time}`);

            if (slotStart > due || slotStart < now) continue;

            const unitHalfHours = Math.ceil(unit * 2);

            const [startHour, startMin] = time.split(":").map(Number);
            let canUse = true;
            for (let i = 0; i < unitHalfHours; i++) {
              const checkHour =
                startHour + Math.floor((startMin + i * 30) / 60);
              const checkMin = (startMin + i * 30) % 60;
              const checkTimeStr = `${checkHour
                .toString()
                .padStart(2, "0")}:${checkMin.toString().padStart(2, "0")}`;
              if (used.has(`${dateStr}-${checkTimeStr}`)) {
                canUse = false;
                break;
              }
            }

            const slotEnd = new Date(slotStart);
            slotEnd.setMinutes(slotEnd.getMinutes() + unit * 60);
            if (slotStart.toDateString() !== slotEnd.toDateString()) {
              canUse = false;
            }

            if (!canUse) continue;

            for (let i = 0; i < unitHalfHours; i++) {
              const checkHour =
                startHour + Math.floor((startMin + i * 30) / 60);
              const checkMin = (startMin + i * 30) % 60;
              const checkTimeStr = `${checkHour
                .toString()
                .padStart(2, "0")}:${checkMin.toString().padStart(2, "0")}`;
              used.add(`${dateStr}-${checkTimeStr}`);
            }

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
      <Header
        title="Project Name?"
        showHome={true}
        rightButtonText="Edit Events"
        onRightButtonClick={() => navigate("/monthly")}
        onHomeClick={() => navigate("/")}
      />
      <div className="weekly-layout">
      <WeeklyView
        initialDate={passedDate}
        tasks={tasks}
        events={events}
        eventSlots={expandEventSlots(events)}
        setTasks={setTasks}
        setSelectedTask={setSelectedTask}
        setShowModal={setShowModal}
        setIsEditing={setIsEditing}
        setSelectedEvent={setSelectedEvent}
        setShowEventModal={setShowEventModal}
      />
        <WeeklyTaskPanel
          tasks={tasks}
          setTasks={setTasks}
          setSelectedTask={setSelectedTask}
          setShowModal={setShowModal}
          setIsEditing={setIsEditing}
          generateSchedule={generateSchedule}
          setSelectedEvent={setSelectedEvent}
          setShowEventModal={setShowEventModal}
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
        {showEventModal && selectedEvent && (
          <div className="task-modal">
            <div className="task-modal-content">
              <h3>{selectedEvent.name}</h3>
              <p>
                <strong>Date:</strong> {selectedEvent.date}
              </p>
              <p>
                <strong>Time:</strong> {selectedEvent.time} ~{" "}
                {selectedEvent.endTime}
              </p>
              <p>
                <strong>Repeat:</strong> {selectedEvent.repeat}
              </p>
              <p>
                <strong>Start Date:</strong> {selectedEvent.startDate}
              </p>
              <p>
                <strong>End Date:</strong> {selectedEvent.endDate}
              </p>
              <div className="modal-buttons">
                <button
                  className="modal-button close-btn"
                  onClick={() => setShowEventModal(false)}
                >
                  Close
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
  initialDate = new Date(),
  tasks,
  events,
  eventSlots,
  setTasks,
  setSelectedTask,
  setShowModal,
  setIsEditing,
  setSelectedEvent,
  setShowEventModal,
}) => {
  const getStartOfWeek = (date) => {
    const d = new Date(date);
    d.setDate(d.getDate() - d.getDay());
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const [weekStart, setWeekStart] = useState(getStartOfWeek(initialDate));

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

    const now = new Date();
    const dropTime = new Date(`${targetDateStr}T${targetTime}`);
    if (dropTime < now) {
      alert("You can't move a task to the past.");
      return;
    }

    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const getOccupiedKeys = (dateStr, startTime, durationHours) => {
      const result = [];
      const [sh, sm] = startTime.split(":").map(Number);
      const totalHalfHours = Math.ceil(durationHours * 2);

      for (let i = 0; i < totalHalfHours; i++) {
        const totalMinutes = sh * 60 + sm + i * 30;
        const offsetDays = Math.floor(totalMinutes / (24 * 60));
        const minsInDay = totalMinutes % (24 * 60);
        const h = Math.floor(minsInDay / 60);
        const m = minsInDay % 60;
        const d = new Date(dateStr);
        d.setDate(d.getDate() + offsetDays);
        const newDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
          2,
          "0"
        )}-${String(d.getDate()).padStart(2, "0")}`;

        result.push(
          `${newDate}-${String(h).padStart(2, "0")}:${String(m).padStart(
            2,
            "0"
          )}`
        );
      }

      return result;
    };

    const doTimesOverlap = (date1, time1, dur1, date2, time2, dur2) => {
      const toMinutes = (dateStr, timeStr) => {
        const [h, m] = timeStr.split(":").map(Number);
        const d = new Date(`${dateStr}T00:00`);
        return d.getTime() + h * 60 * 60 * 1000 + m * 60 * 1000;
      };

      const start1 = toMinutes(date1, time1);
      const end1 = start1 + dur1 * 60 * 60 * 1000;
      const start2 = toMinutes(date2, time2);
      const end2 = start2 + dur2 * 60 * 60 * 1000;

      return Math.max(start1, start2) < Math.min(end1, end2);
    };

    const used = new Set();

    tasks.forEach((t) => {
      if (t.id === taskId) return;
      t.slots?.forEach((s) => {
        const dur = parseFloat(t.workTime || 1);
        getOccupiedKeys(s.date, s.time, dur).forEach((k) => used.add(k));
      });
    });

    let hasEventConflict = false;
    for (const e of eventSlots) {
      const overlap = doTimesOverlap(
        e.date,
        e.time,
        parseFloat(e.duration || 1),
        targetDateStr,
        targetTime,
        parseFloat(task.workTime || 1)
      );
      if (overlap) {
        hasEventConflict = true;
        break;
      }
    }

    const keysToCheck = getOccupiedKeys(
      targetDateStr,
      targetTime,
      parseFloat(task.workTime || 1)
    );
    const isOccupied = hasEventConflict || keysToCheck.some((k) => used.has(k));

    if (isOccupied) {
      alert("Target time slot is occupied by another task or event.");
      return;
    }

    const newSlot = { date: targetDateStr, time: targetTime };

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;

        const updatedSlots = t.slots
          .filter((s) => !(s.date === oldSlot.date && s.time === oldSlot.time))
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
            <div
              key={i}
              className="day-column"
              style={{ position: "relative" }}
            >
              <div className="day-header">
                {formatDate(date)}
                <br />
                {dayName}
              </div>

              {hours.map((hour, j) => (
                <div
                  key={j}
                  className="day-cell"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, dateStr, hour)}
                >
                  {eventSlots
                    .filter((e) => {
                      if (e.date !== dateStr) return false;

                      const parseTime = (t) => {
                        const [h, m] = t.split(":").map(Number);
                        return h * 60 + m;
                      };

                      const eventMinutes = parseTime(e.time);
                      const slotMinutes = parseTime(hour);
                      return Math.abs(eventMinutes - slotMinutes) <= 30;
                    })
                    .map((event, idx) => (
                      <EventBox
                        key={`event-${event.id}-${idx}`}
                        event={event}
                        onClick={() => {
                          setSelectedEvent(event);
                          setShowEventModal(true);
                        }}
                      />
                    ))}

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
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyPage;
