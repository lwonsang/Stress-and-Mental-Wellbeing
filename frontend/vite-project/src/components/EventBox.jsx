const EventBox = ({ event, onClick }) => {
  const hours = parseFloat(event.duration || 1);
  const height = `${28 * hours - 4}px`;

  return (
    <div
      className="event-box"
      onClick={onClick}
      style={{
        height,
        marginBottom: "4px",
        color: "#1a237e",
        borderLeft: "5px solid #7986cb",
        borderRadius: "6px",
        padding: "0 6px",
        fontSize: "0.75rem",
        lineHeight: "1.2",
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        cursor: "pointer",
        position: "relative",
        zIndex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      <div style={{ fontWeight: "600" }}>{event.name}</div>
    </div>
  );
};

export default EventBox;
