import {
  ActionIcon,
  Alert,
  Box,
  Button,
  Code,
  Container,
  Group,
  Loader,
  Modal,
  Notification,
  Paper,
  Spoiler,
  Stack,
  Switch,
  Text,
  Title,
  Tooltip,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { DataTable, Icon, type RowId } from 'mantine-datatable-lite';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  deleteEmployees,
  errorMessage,
  fetchFilterOptions,
  resetDemoData,
  setActive,
  simulation,
  type Employee,
  type FilterOptions,
} from './api';
import { employeeColumns } from './columns';
import { EmployeeDetailsPanel } from './EmployeeDetailsPanel';
import { EmployeeDrawer } from './EmployeeDrawer';
import { useEmployeeQuery } from './useEmployeeQuery';

type PendingDelete = { ids: RowId[]; label: string } | null;
type Action = 'activate' | 'deactivate' | 'delete' | 'reset';
type Notice = { id: number; color: 'teal' | 'red'; text: string };

const employees = (count: number) =>
  `${count} ${count === 1 ? 'employee' : 'employees'}`;

function ThemeIcon({ dark }: { dark: boolean }) {
  return (
    <svg
      width={18}
      height={18}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={1.75}
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden
    >
      {dark ? (
        <>
          <circle cx='12' cy='12' r='4' />
          <path d='M12 2v2M12 20v2m-7.07-17.07 1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41' />
        </>
      ) : (
        <path d='M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z' />
      )}
    </svg>
  );
}

/** Success messages close themselves; errors stay until dismissed. */
function Toast({
  notice,
  onClose,
}: {
  notice: Notice | undefined;
  onClose: () => void;
}) {
  useEffect(() => {
    if (notice?.color !== 'teal') return;
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [notice, onClose]);
  if (!notice) return null;
  return (
    <Notification
      key={notice.id}
      color={notice.color}
      title={notice.color === 'red' ? 'Something went wrong' : 'Done'}
      withBorder
      onClose={onClose}
      pos='fixed'
      bottom={24}
      right={24}
      w={360}
      maw='calc(100vw - 48px)'
      style={{ zIndex: 400 }}
    >
      {notice.text}
    </Notification>
  );
}

export function App() {
  const { setColorScheme } = useMantineColorScheme();
  const scheme = useComputedColorScheme('light', {
    getInitialValueInEffect: true,
  });
  const query = useEmployeeQuery();
  const [options, setOptions] = useState<FilterOptions>();
  const [optionsError, setOptionsError] = useState<string>();
  const [selectedIds, setSelectedIds] = useState<RowId[]>([]);
  const [viewing, setViewing] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete>(null);
  const [running, setRunning] = useState<Action | null>(null);
  const [notice, setNotice] = useState<Notice>();
  const [slow, setSlow] = useState(simulation.slow);
  const [failing, setFailing] = useState(simulation.failing);
  // Remounting the table after a data reset also clears its sort, filters and page.
  const [tableKey, setTableKey] = useState(0);

  useEffect(() => {
    fetchFilterOptions()
      .then(setOptions)
      .catch((cause: unknown) => setOptionsError(errorMessage(cause)));
  }, [tableKey]);

  const columns = useMemo(
    () =>
      options
        ? employeeColumns(options, {
            onView: (employee) => setViewing(employee.id),
            onDelete: (employee) =>
              setPendingDelete({ ids: [employee.id], label: employee.name }),
          })
        : [],
    [options],
  );

  const closeNotice = useCallback(() => setNotice(undefined), []);
  const notify = (color: Notice['color'], text: string) =>
    setNotice({ id: Date.now(), color, text });

  /** Runs a mutation, reports the result, and refetches the current page. */
  async function mutate(
    action: Action,
    run: () => Promise<string>,
    after?: () => void,
  ) {
    setRunning(action);
    try {
      notify('teal', await run());
      after?.();
      query.refresh();
    } catch (cause) {
      notify('red', errorMessage(cause));
    } finally {
      setRunning(null);
    }
  }

  if (optionsError)
    return (
      <Container size='sm' py='xl'>
        <Alert color='red' title='Could not reach the employee API'>
          {optionsError}. Start it with <Code>npm run dev</Code> in this folder.
        </Alert>
      </Container>
    );
  if (!options)
    return (
      <Group justify='center' py='xl'>
        <Loader size='sm' />
      </Group>
    );

  return (
    <Container component='main' size='xl' py='lg'>
      <Stack gap='md'>
        <Group justify='space-between' align='flex-start' gap='sm'>
          <Box flex='1 1 320px'>
            <Title id='employees-title' order={1} size='h2'>
              Employee directory
            </Title>
            <Text c='dimmed' size='sm'>
              mantine-datatable-lite in server mode: every sort, filter, search
              and page change becomes one request to an Express + SQLite API.
            </Text>
          </Box>
          <Group gap='xs' wrap='nowrap'>
            <Button
              variant='default'
              loading={running === 'reset'}
              disabled={running !== null && running !== 'reset'}
              onClick={() =>
                mutate(
                  'reset',
                  async () => {
                    await resetDemoData();
                    return 'Demo data restored.';
                  },
                  () => {
                    setSelectedIds([]);
                    setTableKey((key) => key + 1);
                  },
                )
              }
            >
              Reset demo data
            </Button>
            <Tooltip
              label={scheme === 'dark' ? 'Light mode' : 'Dark mode'}
              withArrow
            >
              <ActionIcon
                variant='default'
                size={36}
                aria-label={
                  scheme === 'dark'
                    ? 'Switch to light mode'
                    : 'Switch to dark mode'
                }
                onClick={() =>
                  setColorScheme(scheme === 'dark' ? 'light' : 'dark')
                }
              >
                <ThemeIcon dark={scheme === 'dark'} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>

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
          <Text size='sm' c='dimmed' aria-live='polite'>
            {query.loaded
              ? `${employees(query.total)} matching`
              : 'Loading employees…'}
          </Text>
        </Group>

        <DataTable<Employee>
          key={tableKey}
          aria-labelledby='employees-title'
          mode='server'
          rows={query.rows}
          columns={columns}
          onChange={query.setRequest}
          pagination={{
            currentPage: query.request?.pagination?.currentPage ?? 1,
            pageSize: query.request?.pagination?.pageSize ?? 25,
            totalItems: query.total,
            pageSizeOptions: [10, 25, 50, 100],
          }}
          loading={query.loading}
          loaderProps={{ variant: 'dots' }}
          error={query.error}
          onRetry={query.refresh}
          globalSearch
          columnSelector
          showTableStatePills
          showReset
          persistKey='server-mode-example:employees'
          dateInput={DatePickerInput}
          emptyState={
            <Stack align='center' gap={4} py='md'>
              <Icon
                name='search'
                size={28}
                strokeWidth={1.5}
                color='var(--mantine-color-dimmed)'
              />
              <Text fw={500}>No employees match these filters</Text>
              <Text size='sm' c='dimmed'>
                Remove a filter or clear the search to see more people.
              </Text>
            </Stack>
          }
          selection={{
            selectedIds,
            onChange: ({ ids }) => setSelectedIds(ids),
            renderBulkActions: ({ ids, clear }) => (
              <Group gap='xs' wrap='nowrap'>
                <Button
                  size='xs'
                  variant='light'
                  loading={running === 'activate'}
                  disabled={running !== null && running !== 'activate'}
                  onClick={() =>
                    mutate(
                      'activate',
                      async () =>
                        `${employees(await setActive(ids, true))} activated.`,
                      clear,
                    )
                  }
                >
                  Activate
                </Button>
                <Button
                  size='xs'
                  variant='light'
                  color='gray'
                  loading={running === 'deactivate'}
                  disabled={running !== null && running !== 'deactivate'}
                  onClick={() =>
                    mutate(
                      'deactivate',
                      async () =>
                        `${employees(await setActive(ids, false))} deactivated.`,
                      clear,
                    )
                  }
                >
                  Deactivate
                </Button>
                <Button
                  size='xs'
                  variant='light'
                  color='red'
                  disabled={running !== null}
                  onClick={() =>
                    setPendingDelete({
                      ids,
                      label: `${employees(ids.length)} (selected)`,
                    })
                  }
                >
                  Delete
                </Button>
              </Group>
            ),
          }}
          expandable={{
            allowMultiple: true,
            // Fetched from GET /api/employees/:id/details when the row opens.
            render: (row) => <EmployeeDetailsPanel employee={row} />,
          }}
          onRowClick={(row) => setViewing(row.id)}
          minWidth={1450}
          maxHeight={560}
          stickyHeader
          striped
          highlightOnHover
          withTableBorder
        />

        <Paper withBorder p='md' radius='sm'>
          <Text fw={600} size='sm' mb='xs'>
            Last request sent to POST /api/employees/query
          </Text>
          <Spoiler maxHeight={120} showLabel='Show all' hideLabel='Hide'>
            <Code block>
              {query.request
                ? JSON.stringify(query.request, null, 2)
                : 'Waiting for the first request…'}
            </Code>
          </Spoiler>
        </Paper>
      </Stack>

      <EmployeeDrawer employeeId={viewing} onClose={() => setViewing(null)} />

      <Modal
        opened={pendingDelete !== null}
        onClose={() => running !== 'delete' && setPendingDelete(null)}
        title={<Text fw={600}>Delete employees?</Text>}
        centered
      >
        <Text size='sm'>
          Delete {pendingDelete?.label}? You can restore everything with Reset
          demo data.
        </Text>
        <Group justify='flex-end' mt='lg'>
          <Button
            variant='default'
            disabled={running === 'delete'}
            onClick={() => setPendingDelete(null)}
          >
            Cancel
          </Button>
          <Button
            color='red'
            loading={running === 'delete'}
            onClick={async () => {
              const ids = pendingDelete?.ids ?? [];
              await mutate(
                'delete',
                async () => `${employees(await deleteEmployees(ids))} deleted.`,
                () =>
                  setSelectedIds((current) =>
                    current.filter((id) => !ids.includes(id)),
                  ),
              );
              setPendingDelete(null);
            }}
          >
            Delete
          </Button>
        </Group>
      </Modal>

      <Toast notice={notice} onClose={closeNotice} />
    </Container>
  );
}
