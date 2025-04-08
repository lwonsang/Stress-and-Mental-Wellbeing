import React from "react";
import "./WeeklyView.css";

const TaskBox = ({ task, onClick }) => {
  const handleDragStart = (e) => {
    e.dataTransfer.setData("text/plain", JSON.stringify(task));
  };

  const hours = parseFloat(task.workTime);
  const height = `${28 * hours - 4}px`;

  return (
    <div
      className="task-box"
      draggable
      onDragStart={handleDragStart}
      onClick={() => onClick(task)}
      style={{ height }}
    >
      {task.name}
    </div>
  );
};

export default TaskBox;
