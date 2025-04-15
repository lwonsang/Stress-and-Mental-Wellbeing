import React, { useRef, useState } from "react";
import "./WeeklyTaskPanel.css";

const WeeklyTaskPanel = ({
  tasks,
  setTasks,
  setSelectedTask,
  setShowModal,
  setIsEditing,
  generateSchedule,
}) => {
  const draggingItemIndex = useRef(null);
  const originalOrderRef = useRef([]);

  const [dragOverIndex, setDragOverIndex] = useState(null);

  const handleEdit = (task) => {
    setSelectedTask(task);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleAddNew = () => {
    const newTask = {
      id: Date.now().toString(),
      name: "",
      duration: "",
      workTime: "",
      dueDate: "",
      dueTime: "",
      date: "",
      time: "",
    };
    setSelectedTask(newTask);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDragStart = (index) => {
    draggingItemIndex.current = index;
    originalOrderRef.current = tasks.map((t) => t.id);
  };

  const handleDragEnter = (index) => {
    if (index === draggingItemIndex.current) return;

    const updatedTasks = [...tasks];
    const draggedItem = updatedTasks.splice(draggingItemIndex.current, 1)[0];
    updatedTasks.splice(index, 0, draggedItem);
    draggingItemIndex.current = index;

    setTasks(updatedTasks);
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    setDragOverIndex(null);
    draggingItemIndex.current = null;

    const oldOrder = originalOrderRef.current;
    const newTasks = [...tasks];

    newTasks.forEach((task, newIndex) => {
      const oldIndex = oldOrder.indexOf(task.id);
      if (oldIndex !== newIndex) {
        task.slots = [];
      }
    });

    setTasks(newTasks);
    originalOrderRef.current = [];
  };

  return (
    <div className="task-panel">
      <div className="task-panel-header">This Week's Tasks</div>

      <div className="task-list-header">
        <span className="task-index">#</span>
        <span className="task-name">Name</span>
        <span className="task-check-label">Scheduled</span>
      </div>

      <div className="task-list" onDragOver={(e) => e.preventDefault()}>
        {tasks.map((task, index) => (
          <div
            key={task.id}
            className={`task-row ${index === dragOverIndex ? "drag-over" : ""}`}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragEnter={() => handleDragEnter(index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => e.preventDefault()}
          >
            <span className="task-index">{index + 1}</span>
            <span className="task-name">{task.name}</span>
            <span className="task-edit" onClick={() => handleEdit(task)}>
              ✎
            </span>
            <span
              className={`task-check ${
                task.slots?.length >=
                parseFloat(task.duration || "0") /
                  parseFloat(task.workTime || "1")
                  ? "green-check"
                  : "red-cross"
              }`}
            >
              {task.slots?.length >=
              parseFloat(task.duration || "0") /
                parseFloat(task.workTime || "1")
                ? "✅"
                : "❌"}
            </span>
          </div>
        ))}
      </div>

      <div className="task-row placeholder" onClick={handleAddNew}>
        <span className="todo-placeholder">+ToDo</span>
      </div>

      <button className="generate-btn" onClick={generateSchedule}>
        Generate Schedule
      </button>
    </div>
  );
};

export default WeeklyTaskPanel;
