import { Alert, Badge, Button, Group, Loader, SimpleGrid, Stack, Text } from '@mantine/core';
import { useEffect, useState, type ReactNode } from 'react';
import {
  errorMessage,
  fetchEmployeeDetails,
  isCancel,
  type Employee,
  type EmployeeDetails,
} from './api';
import { formatDate, formatLocalTime, formatTenure } from './format';

// Details never change for an ID, so a row loads them once per session.
const cache = new Map<number, EmployeeDetails>();

type DetailsState = { details?: EmployeeDetails; error?: string };

/** Loads one employee's details; a newer attempt or unmounting aborts the request. */
function useEmployeeDetails(id: number) {
  const [state, setState] = useState<DetailsState>(() => ({ details: cache.get(id) }));
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (cache.has(id)) return;
    const controller = new AbortController();
    fetchEmployeeDetails(id, controller.signal)
      .then((details) => {
        cache.set(id, details);
        setState({ details });
      })
      .catch((cause: unknown) => {
        if (!isCancel(cause)) setState({ error: errorMessage(cause) });
      });
    return () => controller.abort();
  }, [id, attempt]);

  return {
    ...state,
    retry: () => {
      setState({});
      setAttempt((current) => current + 1);
    },
  };
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Stack gap={4} miw={0}>
      <Text size='xs' fw={600} c='dimmed' tt='uppercase' lts={0.4}>
        {label}
      </Text>
      {children}
    </Stack>
  );
}

/** Expanded row content: fetched from the API when the row opens. */
export function EmployeeDetailsPanel({ employee }: { employee: Employee }) {
  const { details, error, retry } = useEmployeeDetails(employee.id);

  if (error) {
    return (
      <Alert variant='light' color='red' maw={720} py='xs'>
        <Group justify='space-between' gap='sm' wrap='nowrap'>
          <Text size='sm'>Could not load details for {employee.name}. {error}</Text>
          <Button size='xs' variant='light' color='red' onClick={retry}>
            Retry
          </Button>
        </Group>
      </Alert>
    );
  }

  if (!details) {
    return (
      <Group gap='xs' py='xs' role='status'>
        <Loader size='xs' />
        <Text size='sm' c='dimmed'>
          Loading details for {employee.name}…
        </Text>
      </Group>
    );
  }

  return (
    <SimpleGrid cols={5} spacing='xl' py={4} maw={1200}>
      <Field label='Reports to'>
        {details.manager ? (
          <div>
            <Text size='sm' fw={500}>
              {details.manager.name}
            </Text>
            <Text size='xs' c='dimmed'>
              {details.manager.role}
            </Text>
          </div>
        ) : (
          <Text size='sm' c='dimmed'>
            No manager listed
          </Text>
        )}
      </Field>
      <Field label='Employment'>
        <div>
          <Text size='sm'>
            {details.employmentType} · {details.workMode}
          </Text>
          <Text size='xs' c='dimmed'>
            Since {formatDate(employee.joinDate)} ({formatTenure(employee.joinDate)})
          </Text>
        </div>
      </Field>
      <Field label='Office'>
        <div>
          <Text size='sm'>{employee.city}</Text>
          <Text size='xs' c='dimmed'>
            {formatLocalTime(details.timeZone)} local time
          </Text>
        </div>
      </Field>
      <Field label='Current projects'>
        <Stack gap={2}>
          {details.projects.map((project) => (
            <Text key={project} size='sm'>
              {project}
            </Text>
          ))}
        </Stack>
      </Field>
      <Field label='Skills'>
        <Group gap={6}>
          {details.skills.map((skill) => (
            <Badge key={skill} variant='default' radius='sm' tt='none' fw={500}>
              {skill}
            </Badge>
          ))}
        </Group>
      </Field>
    </SimpleGrid>
  );
}
