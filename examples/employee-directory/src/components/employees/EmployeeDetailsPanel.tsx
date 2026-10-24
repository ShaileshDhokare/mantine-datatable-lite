import { Alert, Badge, Button, Group, Loader, SimpleGrid, Stack, Text } from '@mantine/core';
import type { ReactNode } from 'react';
import { useEmployeeDetails } from '../../hooks/useEmployeeDetails';
import type { Employee } from '../../types/employee';
import { formatDate, formatLocalTime, formatTenure } from '../../utils/format';

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

/**
 * Expanded row content. Fetched from GET /api/employees/:id/details the first
 * time the row opens, with a loader, an error with Retry, and a cache.
 */
export function EmployeeDetailsPanel({ employee }: { employee: Employee }) {
  const { details, error, retry } = useEmployeeDetails(employee.id);

  if (error) {
    return (
      <Alert variant='light' color='red' maw={720} py='xs'>
        <Group justify='space-between' gap='sm' wrap='nowrap'>
          <Text size='sm'>
            Could not load details for {employee.name}. {error}
          </Text>
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
