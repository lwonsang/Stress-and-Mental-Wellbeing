import { Paper, Text, Button } from '@mantine/core';
import { useState } from 'react';

export function DayCell({ dayNumber, events = [] }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Paper
      withBorder
      shadow="xs"
      style={{
        aspectRatio: '1.707',
        backgroundColor: 'rgba(0, 85, 255, 0.44)', // #0055FF at 44% opacity
        position: 'relative',
        overflow: 'hidden',
        padding: '8px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Date in corner */}
      <Text size="lg" weight={700} style={{ position: 'absolute', top: 8, left: 8 }}>
        {String(dayNumber).padStart(2, '0')}
      </Text>

      {/* Event preview */}
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
            style={{ color: e.highlight ? 'red' : 'black' }}
          >
            {e.text}
          </Text>
        ))}
      </div>

      {/* Hover button */}
      {hovered && (
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          <Button size="xs" variant="white">
            Add
          </Button>
        </div>
      )}
    </Paper>
  );
}
