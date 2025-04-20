import { useRef, useEffect, useState } from "react";
import "./Home.css";
import Header from "./Header";
import { useNavigate } from "react-router-dom";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const hours = Array.from(
  { length: 24 },
  (_, i) => `${i.toString().padStart(2, "0")}:00`
);

const getStartOfWeek = () => {
  const now = new Date();
  now.setDate(now.getDate() - now.getDay());
  now.setHours(0, 0, 0, 0);
  return now;
};

const safeParseDate = (dateStr) => {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const Home = ({ user }) => {
  const [tasks, setTasks] = useState([]);
  const [weekStart, setWeekStart] = useState(getStartOfWeek());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [eventSlots, setEventSlots] = useState([]);
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("weekly");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const toDateStr = (date) => date.toLocaleDateString("en-CA");
  const selectedDateStr = toDateStr(selectedDate);

  const tasksForSelectedDay = tasks.filter((task) =>
    (task.slots || []).some((slot) => slot.date === selectedDateStr)
  );

  const eventsForSelectedDay = eventSlots.filter(
    (event) => event.date === selectedDateStr
  );

  const currentYear = selectedDate.getFullYear();
  const currentMonth = selectedDate.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const startDayIndex = firstDayOfMonth.getDay();

  const calendarDays = [];

  for (let i = 0; i < startDayIndex; i++) {
    calendarDays.push(
      <div key={`empty-${i}`} className="calendar-cell empty-cell" />
    );
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(currentYear, currentMonth, d);
    const dateStr = toDateStr(date);
    const hasTask = tasks.some((task) =>
      (task.slots || []).some((slot) => slot.date === dateStr)
    );
    const hasEvent = eventSlots.some((e) => e.date === dateStr);

    calendarDays.push(
      <div
        key={d}
        className={`calendar-cell ${
          selectedDateStr === dateStr ? "selected" : ""
        }`}
        onClick={() => setSelectedDate(date)}
      >
        <div className="calendar-day">{d}</div>
        {hasTask && <div className="dot task-dot" />}
        {hasEvent && <div className="dot event-dot" />}
      </div>
    );
  }

  useEffect(() => {
    const storedTasks = localStorage.getItem("tasks");
    const defaultTasks = [
      // {
      //   id: "t1",
      //   name: "Learning",
      //   duration: "3h",
      //   workTime: "1h",
      //   dueDate: "2025-04-30",
      //   dueTime: "10:00",
      //   slots: [
      //     { date: "2025-04-07", time: "10:00" },
      //     { date: "2025-04-08", time: "10:00" },
      //     { date: "2025-04-09", time: "10:00" },
      //   ],
      // },
      // {
      //   id: "t2",
      //   name: "Workout",
      //   duration: "1h",
      //   workTime: "1h",
      //   dueDate: "2025-04-10",
      //   dueTime: "18:00",
      //   slots: [{ date: "2025-04-09", time: "18:00" }],
      // },
    ];
    const loadedTasks = storedTasks ? JSON.parse(storedTasks) : defaultTasks;

    const storedEvents = localStorage.getItem("events");
    const defaultEvents = [
      {
        id: "e1",
        name: "Daily Meeting",
        startTime: "10:00",
        startDate: "2025-04-07",
        endTime: "23:30",
        endDate: "2025-04-11",
        repeat: "Daily",
      },
    ];
    const loadedEvents = storedEvents
      ? JSON.parse(storedEvents)
      : defaultEvents;

    const expandEventSlots = (events) => {
      const slots = [];

      events.forEach((event) => {
        const { id, name, startTime, endTime, startDate, endDate, repeat } =
          event;

        const start = new Date(`${startDate}T${startTime}`);
        const end = new Date(`${endDate}T${endTime}`);
        let current = new Date(start);

        while (current <= end) {
          const startTimeMin =
            parseInt(startTime.split(":")[0]) * 60 +
            parseInt(startTime.split(":")[1]);
          const endTimeMin =
            parseInt(endTime.split(":")[0]) * 60 +
            parseInt(endTime.split(":")[1]);
          const isOvernight = endTimeMin <= startTimeMin;

          let remainingMin = isOvernight
            ? 24 * 60 - startTimeMin + endTimeMin
            : endTimeMin - startTimeMin;

          remainingMin = Math.max(30, remainingMin);

          let dayStartMin = startTimeMin;
          let segmentDate = new Date(current);

          while (remainingMin > 0) {
            const segmentDateStr = toDateStr(segmentDate);
            const segmentStartHour = Math.floor(dayStartMin / 60);
            const segmentStartMin = dayStartMin % 60;
            const segmentTime = `${segmentStartHour
              .toString()
              .padStart(2, "0")}:${segmentStartMin
              .toString()
              .padStart(2, "0")}`;

            const maxMinutesThisDay = 24 * 60 - dayStartMin;
            const segmentMin = Math.min(remainingMin, maxMinutesThisDay);
            const segmentDuration = segmentMin / 60;

            slots.push({
              id,
              name,
              date: segmentDateStr,
              time: segmentTime,
              duration: segmentDuration,
              endTime,
              repeat,
              startDate,
              endDate,
            });

            remainingMin -= segmentMin;
            segmentDate.setDate(segmentDate.getDate() + 1);
            dayStartMin = 0;
          }

          if (repeat === "Never") break;
          if (repeat === "Daily") current.setDate(current.getDate() + 1);
          else if (repeat === "Weekly") current.setDate(current.getDate() + 7);
          else if (repeat === "Monthly")
            current.setMonth(current.getMonth() + 1);
        }
      });

      return slots;
    };

    const eventSlots = expandEventSlots(loadedEvents);

    const blockedKeys = new Set(
      eventSlots.flatMap((e) => {
        const [sh, sm] = e.time.split(":").map(Number);
        const roundedStartMin = Math.round((sh * 60 + sm) / 30) * 30;
        const keys = [];
        for (let i = 0; i < Math.ceil(e.duration * 2); i++) {
          const totalMin = roundedStartMin + i * 30;
          const h = Math.floor(totalMin / 60);
          const m = totalMin % 60;
          keys.push(
            `${e.date}-${h.toString().padStart(2, "0")}:${m
              .toString()
              .padStart(2, "0")}`
          );
        }
        return keys;
      })
    );

    const cleanedTasks = loadedTasks.map((task) => {
      const unit = parseFloat(task.workTime || 1);
      const blocks = Math.ceil(unit * 2);

      const hasConflict = (task.slots || []).some((slot) => {
        const [h, m] = slot.time.split(":").map(Number);
        const roundedStartMin = Math.round((h * 60 + m) / 30) * 30;
        for (let i = 0; i < blocks; i++) {
          const totalMin = roundedStartMin + i * 30;
          const hh = Math.floor(totalMin / 60);
          const mm = totalMin % 60;
          const key = `${slot.date}-${hh.toString().padStart(2, "0")}:${mm
            .toString()
            .padStart(2, "0")}`;
          if (blockedKeys.has(key)) return true;
        }
        return false;
      });

      return {
        ...task,
        slots: hasConflict ? [] : task.slots,
      };
    });

    setTasks(cleanedTasks);
    localStorage.setItem("tasks", JSON.stringify(cleanedTasks));
    localStorage.setItem("events", JSON.stringify(loadedEvents));
    setEventSlots(eventSlots);
  }, []);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);

  const AutoSizedEvent = ({ event, index, onClick }) => {
    const ref = useRef(null);
    const [fontSize, setFontSize] = useState(12);

    useEffect(() => {
      const el = ref.current;
      if (!el) return;

      const maxHeight = el.offsetHeight;
      let currentSize = 12;
      el.style.fontSize = `${currentSize}px`;

      console.log(
        `[AutoSizedEvent] Event "${event.name}" initial height: ${maxHeight}px`
      );

      while (el.scrollHeight > maxHeight && currentSize > 6) {
        currentSize -= 1;
        el.style.fontSize = `${currentSize}px`;
      }

      console.log(
        `[AutoSizedEvent] Final font size for "${event.name}": ${currentSize}px`
      );

      setFontSize(currentSize);
    }, [event.name]);

    console.log(
      `[AutoSizedEvent] Rendering "${event.name}" with duration: ${
        event.duration
      }, computed height: ${24 * parseFloat(event.duration || 1)}px`
    );

    return (
      <div
        className="readonly-task"
        title={event.name}
        ref={ref}
        onClick={() => onClick(event)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          textAlign: "center",
          backgroundColor: "#e3e9ff",
          color: "#1a237e",
          height: `${24 * parseFloat(event.duration || 1)}px`,
          position: "absolute",
          top: `${index * 30}px`,
          left: 0,
          right: 0,
          borderLeft: "4px solid #7986cb",
          fontWeight: "600",
          fontSize: `${fontSize}px`,
          lineHeight: "1.1",
          zIndex: 5,
          padding: "2px 4px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "normal",
          wordBreak: "break-word",
          cursor: "pointer",
        }}
      >
        {event.name}
      </div>
    );
  };

  const getDatesOfWeek = () =>
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return toDateStr(d);
    });

  const dateList = getDatesOfWeek();

  const allSlots = tasks.flatMap((task) =>
    (task.slots || []).map((slot) => ({
      ...slot,
      name: task.name,
      taskId: task.id,
      duration: task.duration,
      workTime: task.workTime,
      dueDate: task.dueDate,
      dueTime: task.dueTime,
    }))
  );

  const handlePrev = () => {
    if (activeView === "weekly") {
      const prevWeek = new Date(weekStart);
      prevWeek.setDate(prevWeek.getDate() - 7);
      setWeekStart(prevWeek);
    } else if (activeView === "monthly") {
      const prevMonth = new Date(selectedDate);
      prevMonth.setMonth(prevMonth.getMonth() - 1);
      setSelectedDate(prevMonth);
    }
  };

  const handleNext = () => {
    if (activeView === "weekly") {
      const nextWeek = new Date(weekStart);
      nextWeek.setDate(nextWeek.getDate() + 7);
      setWeekStart(nextWeek);
    } else if (activeView === "monthly") {
      const nextMonth = new Date(selectedDate);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      setSelectedDate(nextMonth);
    }
  };

  const sortedSlots = [...allSlots].sort(
    (a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`)
  );

  const now = new Date();
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const upcomingSlots = sortedSlots.filter((slot) => {
    const slotDateTime = new Date(`${slot.date}T${slot.time}`);
    return slotDateTime >= now && slotDateTime < weekEnd;
  });

  return (
    <div className="home-page">
      <Header title="WeekPlanr" user={user} showHome={false} currentView="" />

      <div className="view-switcher-bar">
        <div className="switch-group">
          <div className="switch-buttons">
            <button
              className={`switch-tab ${
                activeView === "weekly" ? "active" : ""
              }`}
              onClick={() => setActiveView("weekly")}
            >
              Weekly
            </button>
            <button
              className={`switch-tab ${
                activeView === "monthly" ? "active" : ""
              }`}
              onClick={() => setActiveView("monthly")}
            >
              Monthly
            </button>
          </div>
          <div className="switch-hint">🔒 This is a read-only overview.</div>
        </div>
      </div>

      {activeView === "weekly" && (
        <>
          <div className="section-header">
            <button className="nav-button" onClick={handlePrev}>
              ◀
            </button>
            <div className="section-title">
              {`Week of ${weekStart.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}`}
            </div>
            <button className="nav-button" onClick={handleNext}>
              ▶
            </button>
          </div>
          <div className="home-main">
            <div className="readonly-section">
              <div className="readonly-grid">
                <div className="readonly-row">
                  <div className="readonly-cell empty-cell" />
                  {dateList.map((dateStr, i) => {
                    const date = safeParseDate(dateStr);
                    const month = date.getMonth() + 1;
                    const day = date.getDate();
                    return (
                      <div key={i} className="readonly-cell day-label">
                        {days[i] + " "}
                        {month}/{day}
                      </div>
                    );
                  })}
                </div>

                {hours.map((hour, hIdx) => (
                  <div key={hIdx} className="readonly-row">
                    <div className="readonly-cell time-label">{hour}</div>

                    {dateList.map((date, dIdx) => {
                      const parseTime = (timeStr) => {
                        const [h, m] = timeStr.split(":").map(Number);
                        return h * 60 + m;
                      };

                      const eventsAtTime = eventSlots.filter((e) => {
                        if (e.date !== date) return false;
                        const slotMin = parseTime(hour);
                        const eventMin = parseTime(e.time);
                        return Math.abs(eventMin - slotMin) <= 30;
                      });

                      const slotsAtTime = allSlots.filter(
                        (s) => s.date === date && s.time === hour
                      );

                      return (
                        <div
                          key={dIdx}
                          className="readonly-cell task-slot"
                          style={{ position: "relative" }}
                        >
                          {eventsAtTime.map((event, i) => (
                            <AutoSizedEvent
                              key={event.id + i}
                              event={event}
                              index={i}
                              onClick={(e) => {
                                setSelectedEvent(e);
                                setShowEventModal(true);
                              }}
                            />
                          ))}

                          {slotsAtTime.map((slot, i) => {
                            const maxChars = 12;
                            const shouldTruncate = slot.name.length > maxChars;
                            const displayName = shouldTruncate
                              ? slot.name.slice(0, maxChars - 1) + "…"
                              : slot.name;

                            return (
                              <div
                                key={i}
                                className="readonly-task"
                                onClick={() => {
                                  setSelectedSlot(slot);
                                  setShowModal(true);
                                }}
                                style={{
                                  height: `${
                                    24 * parseFloat(slot.workTime || "1")
                                  }px`,
                                  position: "absolute",
                                  top: `${i * 30}px`,
                                  left: 0,
                                  right: 0,
                                  zIndex: 1,
                                }}
                              >
                                {displayName}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="task-panels">
              <div className="task-list-panel">
                <div className="task-list-title">Upcoming Tasks</div>
                <ul className="task-list">
                  {upcomingSlots.length === 0 ? (
                    <li className="task-list-item" style={{ opacity: 0.6 }}>
                      No tasks this week.
                    </li>
                  ) : (
                    upcomingSlots.map((slot) => (
                      <li
                        key={slot.taskId + "-" + slot.date + "-" + slot.time}
                        className="task-list-item"
                        onClick={() => {
                          setSelectedSlot(slot);
                          setShowModal(true);
                        }}
                      >
                        <span className="task-name">{slot.name}</span>
                        <span className="task-time">
                          {slot.date} {slot.time}
                        </span>
                      </li>
                    ))
                  )}
                </ul>
              </div>

              {tasks.some((t) => !t.slots || t.slots.length === 0) && (
                <div className="task-list-panel unplanned-panel">
                  <div className="task-list-title">Unplanned Tasks</div>
                  <ul className="task-list">
                    {tasks
                      .filter((t) => !t.slots || t.slots.length === 0)
                      .map((task) => (
                        <li
                          key={task.id}
                          className="task-list-item unplanned-item"
                        >
                          <span className="task-name">{task.name}</span>
                          <span className="task-time">
                            Due: {task.dueDate} {task.dueTime}
                          </span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          </div>{" "}
        </>
      )}
      {activeView === "monthly" && (
        <>
          <div className="section-header">
            <button className="nav-button" onClick={handlePrev}>
              ◀
            </button>
            <div className="section-title">
              {activeView === "weekly"
                ? `Week of ${weekStart.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}`
                : `${new Date(currentYear, currentMonth).toLocaleString(
                    "en-US",
                    {
                      month: "long",
                      year: "numeric",
                    }
                  )}`}
            </div>
            <button className="nav-button" onClick={handleNext}>
              ▶
            </button>
          </div>

          <div
            className="monthly-legend"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginLeft: "20px",
              marginTop: "8px",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span className="event-dot" />
              <span style={{ fontSize: "14px", color: "#333" }}>Event</span>
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span className="task-dot" />
              <span style={{ fontSize: "14px", color: "#333" }}>Task</span>
            </span>
          </div>

          <div className="monthly-content">
            <div className="monthly-grid">
              {days.map((d) => (
                <div key={d} className="monthly-day-label">
                  {d}
                </div>
              ))}

              {Array(firstDayOfMonth.getDay())
                .fill(null)
                .map((_, i) => (
                  <div key={`empty-${i}`} className="monthly-day-cell empty" />
                ))}

              {Array(daysInMonth)
                .fill(null)
                .map((_, i) => {
                  const day = i + 1;
                  const dateKey = `${currentYear}-${String(
                    currentMonth + 1
                  ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const isSelected = selectedDateStr === dateKey;
                  return (
                    <div
                      key={day}
                      className={`monthly-day-cell ${
                        isSelected ? "selected" : ""
                      }`}
                      onClick={() => setSelectedDate(safeParseDate(dateKey))}
                    >
                      <div className="day-number">{day}</div>
                      <div className="dot-bar">
                        {eventSlots.some((e) => e.date === dateKey) && (
                          <span className="event-dot" />
                        )}
                        {tasks.some((t) =>
                          (t.slots || []).some((s) => s.date === dateKey)
                        ) && <span className="task-dot" />}
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="monthly-task-panel">
              <div className="monthly-task-list-title">
                Tasks & Events on {selectedDateStr}
              </div>

              {[
                ...eventsForSelectedDay.map((e) => ({
                  type: "event",
                  name: e.name,
                  time: e.time,
                  endTime: e.endTime,
                  data: e,
                })),
                ...tasksForSelectedDay.map((t) => {
                  const slot = (t.slots || []).find(
                    (s) => s.date === selectedDateStr
                  );
                  if (!slot) return null;
                  return {
                    type: "task",
                    name: t.name,
                    time: slot.time,
                    workTime: t.workTime,
                    data: {
                      ...slot,
                      name: t.name,
                      taskId: t.id,
                      duration: t.duration,
                      dueDate: t.dueDate,
                      dueTime: t.dueTime,
                    },
                  };
                }),
              ]
                .filter(Boolean)
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((item, i) => (
                  <li
                    key={`${item.type}-${i}`}
                    className={`monthly-task-item ${item.type}-item`}
                    onClick={() => {
                      if (item.type === "event") {
                        setSelectedEvent(item.data);
                        setShowEventModal(true);
                      } else {
                        setSelectedSlot(item.data);
                        setShowModal(true);
                      }
                    }}
                  >
                    <span className="monthly-task-name">{item.name}</span>
                    <span className="monthly-task-time">
                      {item.type === "event"
                        ? `${item.time} ~ ${item.endTime}`
                        : (() => {
                            const [h, m] = item.time.split(":").map(Number);
                            const raw = String(item.workTime || "1");
                            const hours =
                              parseFloat(raw.replace(/[^\d.]/g, "")) || 1;
                            const totalMin = h * 60 + m + hours * 60;
                            const endH = Math.floor(totalMin / 60) % 24;
                            const endM = totalMin % 60;
                            return `${item.time} ~ ${String(endH).padStart(
                              2,
                              "0"
                            )}:${String(endM).padStart(2, "0")}`;
                          })()}
                    </span>
                  </li>
                ))}
            </div>
          </div>
        </>
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
              <button
                className="modal-button submit-btn"
                onClick={() =>
                  navigate("/monthly", {
                    state: { selectedDate: selectedEvent.date },
                  })
                }
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && selectedSlot && (
        <div className="task-modal">
          <div className="task-modal-content">
            <h3>{selectedSlot.name}</h3>
            <p>
              <strong>Duration:</strong> {selectedSlot.duration}
            </p>
            <p>
              <strong>Work Time:</strong> {selectedSlot.workTime}
            </p>
            <p>
              <strong>Due:</strong> {selectedSlot.dueDate}{" "}
              {selectedSlot.dueTime}
            </p>
            <p>
              <strong>Date:</strong> {selectedSlot.date}
            </p>
            <p>
              <strong>Time Slot:</strong> {selectedSlot.time}
            </p>
            <div className="modal-buttons">
              <button
                className="modal-button close-btn"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
              <button
                className="modal-button submit-btn"
                onClick={() =>
                  navigate("/weekly", {
                    state: { selectedDate: selectedSlot.date },
                  })
                }
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
