import { Paper, Text, Button} from '@mantine/core';
import { IconPencil } from "@tabler/icons-react";
import { useState } from 'react';

export function DayCell({
  dayNumber,
  eventToDisplay = [],
  events = [],
  onAddClick,
  hasTasks,
  onEditClick,
  onDeleteEvent,
}) {
  const [hovered, setHovered] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  function formatYmd(dateObj) {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  return (
    <Paper
      withBorder
      shadow="xs"
      
      style={{
        aspectRatio: '1.707',
        backgroundColor: 'rgba(0, 85, 255, 0.44)',
        position: 'relative',
        overflow: 'hidden',
        padding: '8px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: 'pointer', 
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Text
        style={{
          fontSize: '1.5vw', 
          position: 'absolute',
          top: 8,
          left: 8,
        }}
      >
        {String(dayNumber).padStart(2, '0')}
      </Text>
      
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          padding: '0 4px',
        }}
      >
        {eventToDisplay.slice(0, 2).map((e, idx) => (
          <Text
            key={idx}
            size="sm"
            lineClamp={1}
            style={{ color: e.highlight ? 'red' : 'black', fontSize: '1.2vw'}}
          >
            {e.text}
          </Text>
        ))}
      </div>
      
      {hovered && (
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          <div style={{display: 'flex', gap: '8px',}}>
            <Button
              size="xs"
              onClick={() => {
                onAddClick(dayNumber);
              }}
            >
              Add
            </Button>
            
            <Button
              size="xs"
              onClick={() => { 
                setEditModalOpen(true)
              }}
            >
              <IconPencil size={22} />
            </Button>
            
          </div>
        </div>
      )}
      {hasTasks && (
        <div
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: '#e53935', 
            color: 'white',
            fontSize: '0.6rem',
            padding: '2px 6px',
            borderRadius: '12px',
            fontWeight: 'bold',
            lineHeight: 1,
          }}
        >
          Todo
        </div>
      )}
      
      {editModalOpen && (
        <div className="task-modal">
          <div className="task-modal-content"
            style={{
              maxHeight: "70vh",
              overflowY: "auto",
              paddingRight: "12px"
            }}
          >
            <h3>Edit Events</h3>

            {events.length === 0 && <p>No events yet.</p>}

            {events.map((event, index) => (
              <div key={event.id || index} style={{ marginBottom: "12px", borderBottom: "1px solid #ccc", paddingBottom: "8px" }}>
                <strong>{event.name}</strong>
                <p>
                  {formatYmd(event.startDate)} {event.startTime} — {formatYmd(event.endDate)} {event.endTime}
                </p>
                <p>Repeat: {event.repeat}</p>

                <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                  <button
                     onClick={() => {
                      setEditModalOpen(false);
                      setTimeout(() => {
                        onEditClick?.(event);
                      }, 0);
                    }}
                    style={{
                      backgroundColor: "#1976d2",
                      color: "white",
                      border: "none",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => {
                        onDeleteEvent?.(event.id);
                    }}
                    style={{
                      backgroundColor: "#e53935",
                      color: "white",
                      border: "none",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}

            <button
              className="modal-button close-btn"
              onClick={() => {
                setEditModalOpen(false);
              }}
              style={{ marginTop: "16px" }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </Paper>
  );
}
