import { Paper, Text, Button} from '@mantine/core';
import { useState } from 'react';

export function DayCell({ dayNumber, events = [], onAddClick, onDayClick, hasTasks }) {
  const [hovered, setHovered] = useState(false);
  const [modalOpened, setModalOpened] = useState(false);

  return (
    <Paper
      withBorder
      shadow="xs"
      onClick={() => onDayClick?.(dayNumber)}
      style={{
        aspectRatio: '1.707',
        backgroundColor: 'rgba(0, 85, 255, 0.44)',
        position: 'relative',
        overflow: 'hidden',
        padding: '8px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: 'pointer', // indicate it's clickable
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Text
        style={{
          fontSize: '1.5vw', // scales with screen width
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
        {events.slice(0, 2).map((e, idx) => (
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
          <Button
            size="xs"
            onClick={(e) => {
              e.stopPropagation(); 
              onAddClick(dayNumber);
            }}
          >
            Add
          </Button>
        </div>
      )}
      {hasTasks && (
        <div
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: '#e53935', // bright red
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
    </Paper>
  );
}
