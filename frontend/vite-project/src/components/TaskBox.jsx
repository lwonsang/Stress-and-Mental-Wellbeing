const TaskBox = ({ task, slot, onClick }) => {
  const handleDragStart = (e) => {
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({ taskId: task.id, slot })
    );
  };

  const hours = parseFloat(task.workTime);
  const height = Math.max(15, 28 * hours - 4) + "px";

  return (
    <div
      className="task-box"
      draggable
      onDragStart={handleDragStart}
      onClick={() => onClick(task, slot)}
      style={{
        height,
        marginBottom: "4px",
        backgroundColor: "#3f51b5",
        color: "white",
        borderRadius: "8px",
        padding: "4px 8px",
        fontSize: "0.85rem",
        boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
        cursor: "pointer",
        position: "relative",
        zIndex: 2,
        overflow: "hidden",
      }}
    >
      <div style={{ fontSize: "1rem", marginRight: "4px" }}>{task.name}</div>
      {slot && (
        <div style={{ fontSize: "0.7rem", opacity: 0.8 }}>{slot.time}</div>
      )}
    </div>
  );
};
export default TaskBox;
