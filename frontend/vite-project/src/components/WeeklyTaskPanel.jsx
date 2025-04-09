import React, { useRef, useState } from "react";
import "./WeeklyTaskPanel.css";

const WeeklyTaskPanel = ({
  tasks,
  setTasks,
  setSelectedTask,
  setShowModal,
  setIsEditing,
}) => {
  const draggingItemIndex = useRef(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [draggingTaskId, setDraggingTaskId] = useState(null);

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
    //setTasks((prev) => [...prev, newTask]);
  };

  const handleDragStart = (index) => {
    draggingItemIndex.current = index;
    setDraggingTaskId(tasks[index].id);
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
    setDraggingTaskId(null);
  };

  return (
    <div className="task-panel">
      <div className="task-panel-header">This Week's Tasks</div>

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
            <span className="task-icon">⠿</span>
            <span className="task-name">{task.name}</span>
            <span className="task-edit" onClick={() => handleEdit(task)}>
              edit ✎
            </span>
            <input type="checkbox" className="task-check" />
          </div>
        ))}
      </div>

      <div className="task-row placeholder" onClick={handleAddNew}>
        <span className="todo-placeholder">+ToDo</span>
      </div>

      <button className="generate-btn">Generate Schedule</button>
    </div>
  );
};

export default WeeklyTaskPanel;
