import { Box, Group, Text, ActionIcon } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

export function MonthSwitcher({ month, year, onNext, onPrev }) {
  const iconStyle = {
    fill: '#1A00FF',
    filter: 'drop-shadow(0px 30px 4px rgba(0, 0, 0, 0.25))',
    width: 24,
    height: 24,
  };

  return (
    <Box style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
      <Group spacing="xl">
        <ActionIcon variant="subtle" onClick={onPrev}>
            <IconChevronLeft style={iconStyle} />
        </ActionIcon>

        <Text fw={700} size="lg">
            {month} {year}
        </Text>

        <ActionIcon variant="subtle" onClick={onNext}>
            <IconChevronRight style={iconStyle} />
        </ActionIcon>
      </Group>
    </Box>
  );
}
