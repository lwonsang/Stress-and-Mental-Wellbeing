import React, { useEffect, useState } from "react";
import "./Home.css";
import Header from "./Header";

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

const Home = ({ goToWeekly, goToMonthly}) => {
  const [tasks, setTasks] = useState([]);
  const [weekStart] = useState(getStartOfWeek());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("tasks");
    if (!stored) {
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
      setTasks(defaultTasks);
      localStorage.setItem("tasks", JSON.stringify(defaultTasks));
    } else {
      setTasks(JSON.parse(stored));
    }
  }, []);

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
              {dateList.map((_, i) => (
                <div key={i} className="readonly-cell day-label">m 
                  {days[i]}
                </div>
              ))}
            </div>

            {hours.map((hour, hIdx) => (
              <div key={hIdx} className="readonly-row">
                <div className="readonly-cell time-label">{hour}</div>

                {dateList.map((date, dIdx) => {
                  const slotsAtTime = allSlots.filter(
                    (s) => s.date === date && s.time === hour
                  );
                  return (
                    <div
                      key={dIdx}
                      className="readonly-cell task-slot"
                      style={{ position: "relative" }}
                    >
                      {slotsAtTime.map((slot, i) => (
                        <div
                          key={i}
                          className="readonly-task"
                          onClick={() => {
                            setSelectedSlot(slot);
                            setShowModal(true);
                          }}
                          style={{
                            height: `${28 * parseFloat(slot.workTime || "1")}px`,
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

        <div className="task-list-panel">
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
      </div>

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
              <strong>Due:</strong> {selectedSlot.dueDate} {selectedSlot.dueTime}
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
