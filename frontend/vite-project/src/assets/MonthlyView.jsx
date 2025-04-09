import { useState } from 'react';
import { Box, Grid, Text } from '@mantine/core';
import { DayCell } from './DayCell';
import { MonthSwitcher } from './Monthswitch';

const months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];


const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const getCalendarCells = (startDayIndex = 2, totalDays = 30) => {
  const cells = [];

  for (let i = 0; i < startDayIndex; i++) {
    cells.push(<Grid.Col span={1} key={`empty-${i}`} />);
  }

  for (let day = 1; day <= totalDays; day++) {
    cells.push(
      <Grid.Col span={1} key={day}>
        <DayCell dayNumber={day} events={[{ text: 'X Event', highlight: true }, { text: 'xxx' }]} />
      </Grid.Col>
    );
  }

  return cells;
};

export default function Calendar() {

  const [date, setDate] = useState(new Date());

  const handlePrev = () => {
    setDate((prev) => {
      const d = new Date(prev);
      d.setMonth(prev.getMonth() - 1);
      return d;
    });
  };

  const handleNext = () => {
    setDate((prev) => {
      const d = new Date(prev);
      d.setMonth(prev.getMonth() + 1);
      return d;
    });
  };

  return (
    <>
      <MonthSwitcher 
        month={months[date.getMonth()]}
        year={date.getFullYear()}
        onPrev={handlePrev}
        onNext={handleNext}
      />
      <Box style={{ width: '100%', padding: '1rem' }}>
        <div style={{ padding: 16 }}>
          <Grid columns={7} gutter="xs">
            {daysOfWeek.map((day) => (
              <Grid.Col span={1} key={day}>
                <Text align="center" fw={700}>
                  {day}
                </Text>
              </Grid.Col>
            ))}
          </Grid>
          
          <Grid columns={7} gutter="xs">
            {getCalendarCells()}
          </Grid>
        </div>
      </Box>
    </>
  );
}