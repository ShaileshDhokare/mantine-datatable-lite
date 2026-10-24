import { Group, Switch } from '@mantine/core';
import { useState } from 'react';
import { simulation } from '../../api/http';

/**
 * Demo switches for every API request: a slow network shows the loading states,
 * and server errors show the error and Retry states of the tables and expanded rows.
 */
export function SimulationControls() {
  const [slow, setSlow] = useState(simulation.slow);
  const [failing, setFailing] = useState(simulation.failing);

  return (
    <Group gap='xl'>
      <Switch
        label='Simulate a slow network'
        checked={slow}
        onChange={(event) => {
          simulation.slow = event.currentTarget.checked;
          setSlow(simulation.slow);
        }}
      />
      <Switch
        label='Simulate server errors'
        checked={failing}
        onChange={(event) => {
          simulation.failing = event.currentTarget.checked;
          setFailing(simulation.failing);
        }}
      />
    </Group>
  );
}
