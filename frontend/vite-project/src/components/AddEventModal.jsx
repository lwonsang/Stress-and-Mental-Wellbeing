import { useState } from "react";
import { useEffect } from "react";
import {
  Modal,
  Select,
  TextInput,
  Button,
  Box,
  Title,
  Group,
} from "@mantine/core";
import { TimeInput } from "@mantine/dates";

export default function AddEventModal({
  opened,
  onClose,
  selectedDay,
  onCreate,
  initialEvent,
}) {
  const [eventType, setEventType] = useState("");
  const [eventName, setEventName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [repeat, setRepeat] = useState("");

  useEffect(() => {
    if (initialEvent) {
      setEventName(initialEvent.name || "");
      setStartDate(formatDate(initialEvent.startDate));
      setEndDate(formatDate(initialEvent.endDate));
      setStartTime(initialEvent.startTime || "");
      setEndTime(initialEvent.endTime || "");
      setRepeat(initialEvent.repeat || "");
      setEventType(""); 
    } else if (selectedDay instanceof Date && !isNaN(selectedDay)) {
      const todayStr = selectedDay.toISOString().split("T")[0];
      setStartDate(todayStr);
      setEndDate(todayStr);
    }
  }, [initialEvent, selectedDay]);

  const formatDate = (date) =>
    date instanceof Date ? date.toISOString().split("T")[0] : "";  

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      withCloseButton={false}
      size="sm"
      withinPortal={false}
      classNames={{
        content: "addevent-modal-content",
      }}
    >
      <Title order={3} align="center" style={{ fontWeight: "bold", marginBottom: "1rem" }}>
        {initialEvent ? "Edit Event" : "Create New Event"}
      </Title>


      <Box>
        <Select
          label="Event Type:"
          placeholder="Open dropdown menu..."
          data={["Classes", "Club activities", "Extracurriculars", "Other"]}
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

        <TextInput
          label="Start Date:"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.currentTarget.value)}
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

        <TextInput
          label="End repeat after:"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.currentTarget.value)}
          mt="sm"
        />

        <Select
          label="Repeats:"
          placeholder="Open dropdown menu..."
          data={["Monthly", "Weekly", "Daily", "Never"]}
          value={repeat}
          onChange={setRepeat}
          mt="sm"
        />
        <Group mt="xl" grow>
          <Button
            variant="outline"
            color="dark"
            style={{
              backgroundColor: "#798592",
              fontWeight: "bold",
              fontSize: "1.1rem",
            }}
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            color="green"
            style={{
              backgroundColor: "#35B200",
              fontWeight: "bold",
              fontSize: "1.1rem",
            }}
            onClick={() => {
              if (!eventType || !startDate || !startTime || !endTime || !repeat) {
                alert("Please fill out all fields.");
                return;
              }
              
              const finalEndDate = endDate || "2025-05-01";

              const eventData = {
                name: eventName || eventType,
                startDate: new Date(startDate + "T00:00"),
                endDate: new Date(finalEndDate + "T00:00"),
                startTime,
                endTime,
                repeat,
                ...(initialEvent?.id && { id: initialEvent.id })
              };
              onCreate(eventData);
              onClose();
            }}
          >
            {initialEvent ? "Update" : "Create"}
          </Button>
        </Group>
      </Box>
    </Modal>
  );
}
