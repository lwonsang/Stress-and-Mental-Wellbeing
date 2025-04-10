import { Modal, Select, TextInput, Button, Box, Title, Group} from '@mantine/core';
import { TimeInput } from '@mantine/dates'

export default function AddEventModal({ opened, onClose, selectedDay}) {
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
          label="Task Type:"
          placeholder="Open dropdown menu..."
          data={['Classes', 'Club activities', 'Extracurriculars', 'Other']}
          mt="xs"
        />
        <TextInput
          label="Task Name:"
          placeholder="Insert task name here..."
          mt="sm"
        />
        <TimeInput
          label="Start Time:"
          placeholder="Select time"
          mt="sm"
          format="12"
        />

        <TimeInput
          label="End Time:"
          placeholder="Select time"
          mt="sm"
          format="12"
        />
        <Select
          label="Repeats:"
          placeholder="Open dropdown menu..."
          data={['Monthly', 'Weekly', 'Daily', 'Never']}
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
          >
            Create
          </Button>
        </Group>
      </Box>
    </Modal>
  );
}