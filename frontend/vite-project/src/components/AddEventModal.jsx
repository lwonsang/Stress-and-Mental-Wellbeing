import { useState } from 'react';
import { Modal, Select, TextInput, Button, Box, Title, Group} from '@mantine/core';
import { TimeInput } from '@mantine/dates'
import { DateInput } from '@mantine/dates';

export default function AddEventModal({ opened, onClose, selectedDay, onCreate }) {
  const [eventType, setEventType] = useState('');
  const [eventName, setEventName] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [repeat, setRepeat] = useState('');

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      withCloseButton={false}
      size="sm"
      withinPortal={false}
      classNames={{
        content: 'addevent-modal-content'
      }}
    >
      <Title order={3} align="center" style={{ fontWeight: 'bold', marginBottom: '1rem' }}>
        Create New Event:
      </Title>

      <Box>
        <Select
          label="Event Type:"
          placeholder="Open dropdown menu..."
          data={['Classes', 'Club activities', 'Extracurriculars', 'Other']}
          value={eventType}
          onChange={setEventType}
          mt="xs"
        />
        <TextInput
          label="Event Name:"
          placeholder="Insert Event name here..."
          mt="sm"
          value={eventName}
          onChange={(e) => setEventName(e.currentTarget.value)}
        />
        <DateInput
          label="Start Date:"
          value={startDate}
          onChange={setStartDate}
          mt="sm"
        />
        <TimeInput
          label="Start Time:"
          value={startTime}
          onChange={(event) => setStartTime(event.currentTarget.value)}
          mt="sm"
          format="24"
        />

        <TimeInput
          label="End Time:"
          value={endTime}
          onChange={(event) => setEndTime(event.currentTarget.value)}
          mt="sm"
          format="24"
        />
        <DateInput
          label="End Date:"
          value={endDate}
          onChange={setEndDate}
          mt="sm"
        />
        <Select
          label="Repeats:"
          placeholder="Open dropdown menu..."
          data={['Monthly', 'Weekly', 'Daily', 'Never']}
          value={repeat}
          onChange={setRepeat}
          mt="sm"
        />
        <Group mt="xl" grow>
          <Button
            variant="outline"
            color="dark"
            style={{
              backgroundColor: '#798592',
              fontWeight: 'bold',
              fontSize: '1.1rem'
            }}
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            color="green"
            style={{
              backgroundColor: '#35B200',
              fontWeight: 'bold',
              fontSize: '1.1rem'
            }}
            onClick={() => {
              onCreate({
                name: eventName || eventType,
                startDate,
                endDate,
                startTime,
                endTime,
                repeat
              });
              onClose();
              console.log("Add event: ", eventName, eventType, startTime, endTime, startDate, endDate, repeat)
            }} >
            Create
          </Button>
        </Group>
      </Box>
    </Modal>
  );
}