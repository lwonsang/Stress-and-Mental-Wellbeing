import { useState } from 'react';
import { Box, Grid, Text } from '@mantine/core';
import { DayCell } from './DayCell';
import { MonthSwitcher } from './Monthswitch';
import Header from './Header'
import AddEventModal from './AddEventModal';

const months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];


const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function expandEvents(events, currentMonth, currentYear) { 
  //Ideally (if there is nothing wrong), calling this will generate a list of events containing event name, start&end time
  const expanded = [];

  for (const event of events) {
    const { startDate, endDate, startTime, endTime, name, repeat } = event;

    const start = new Date(startDate);
    const end = new Date(endDate);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const date = new Date(d);

      if (date.getMonth() !== currentMonth || date.getFullYear() !== currentYear) continue;

      const isMatch =
        repeat === 'Daily' ||
        (repeat === 'Weekly' && date.getDay() === start.getDay()) ||
        (repeat === 'Monthly' && date.getDate() === start.getDate()) ||
        (repeat === 'Never' && date.toDateString() === start.toDateString());

      if (isMatch) {
        expanded.push({
          date,           
          name,
          startTime,      
          endTime
        });
      }
    }
  }

  return expanded;
}


const getCalendarCells = (startDayIndex = 2, totalDays = 30, onAddClick, events = []) => {
  const cells = [];

  for (let i = 0; i < startDayIndex; i++) {
    cells.push(<Grid.Col span={1} key={`empty-${i}`} />);
  }

  for (let day = 1; day <= totalDays; day++) {
    const dayEvents = events.filter(e => e.date.getDate() === day);
    const eventDisplay = dayEvents.length > 0
      ? [
          { text: dayEvents[0].name, highlight: true },
          { text: `${dayEvents[0].startTime} - ${dayEvents[0].endTime}` }
        ]
      : [{ text: 'X Event', highlight: true }, { text: 'xxx' }];

    cells.push(
      <Grid.Col span={1} key={day}>
        <DayCell
          dayNumber={day}
          events={eventDisplay}
          onAddClick={onAddClick}
        />
      </Grid.Col>
    );
  }

  return cells;
};

const Calendar = ({ goHome }) => {

  const [date, setDate] = useState(new Date());
  const [modalOpened, setModalOpened] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [events, setEvents] = useState([]);
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const visibleEvents = expandEvents(events, date.getMonth(), date.getFullYear());


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

  const openModalForDay = (day) => {
    console.log('Opening modal for day', day);
    setSelectedDay(day);
    setModalOpened(true);
  };
  

  return (
    <>
      <Header title="Project Name?" showHome={true} onHomeClick={goHome} />
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
          {getCalendarCells(firstDayOfMonth.getDay(), daysInMonth, openModalForDay, visibleEvents)}
          </Grid>
        </div>
      </Box>
      <AddEventModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        selectedDay={selectedDay}
        onCreate={(newEvent) => setEvents((prev) => [...prev, newEvent])}
      />
    </>
  );
}

export default Calendar;