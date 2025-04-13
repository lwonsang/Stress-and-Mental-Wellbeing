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

const Home = ({ user }) => {
  const [tasks, setTasks] = useState([]);
  const [weekStart] = useState(getStartOfWeek());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [eventSlots, setEventSlots] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedTasks = localStorage.getItem("tasks");
    const defaultTasks = [
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
            const segmentDateStr = segmentDate.toISOString().split("T")[0];
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
      }, computed height: ${28 * parseFloat(event.duration || 1)}px`
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
          height: `${28 * parseFloat(event.duration || 1)}px`,
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
      return d.toISOString().split("T")[0];
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

  const sortedSlots = [...allSlots].sort(
    (a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`)
  );

  const now = new Date();
  const upcomingSlots = sortedSlots.filter((slot) => {
    const slotDateTime = new Date(`${slot.date}T${slot.time}`);
    return slotDateTime >= now;
  });

  return (
    <div className="home-page">
      <Header
        title="WeekPlanr"
        user={user}
        monthButtonText="Edit Events"
        rightButtonText="Add Tasks & Edit Schedule"
        onMonthButtonClick={() => navigate("/monthly")}
        onRightButtonClick={() => navigate("/weekly")}
      />

      <div className="home-main">
        <div className="readonly-section">
          <div className="section-title">This Week's Schedule</div>

          <div className="readonly-grid">
            <div className="readonly-row">
              <div className="readonly-cell empty-cell" />
              {dateList.map((dateStr, i) => {
                const date = new Date(dateStr);
                const month = date.getMonth() + 1;
                const day = date.getDate();
                return (
                  <div key={i} className="readonly-cell day-label">
                    {days[i]+" "}
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

                      {slotsAtTime.map((slot, i) => (
                        <div
                          key={i}
                          className="readonly-task"
                          onClick={() => {
                            setSelectedSlot(slot);
                            setShowModal(true);
                          }}
                          style={{
                            height: `${
                              28 * parseFloat(slot.workTime || "1")
                            }px`,
                            position: "absolute",
                            top: `${i * 30}px`,
                            left: 0,
                            right: 0,
                            zIndex: 1,
                          }}
                        >
                          {slot.name}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <div className="task-panels">
          <div className="task-list-panel ">
            <div className="task-list-title">Upcoming Tasks</div>
            <ul className="task-list">
              {upcomingSlots.map((slot, idx) => (
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
              ))}
            </ul>
          </div>
          <div className="task-list-panel unplanned-panel">
            <div className="task-list-title">Unplanned Tasks</div>
            <ul className="task-list">
              {tasks
                .filter((t) => !t.slots || t.slots.length === 0)
                .map((task) => (
                  <li key={task.id} className="task-list-item unplanned-item">
                    <span className="task-name">{task.name}</span>
                    <span className="task-time">
                      {task.dueDate} {task.dueTime}
                    </span>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
