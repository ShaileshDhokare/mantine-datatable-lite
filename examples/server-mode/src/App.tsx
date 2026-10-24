import {
  ActionIcon,
  Alert,
  Box,
  Button,
  Code,
  Container,
  DataList,
  Group,
  Loader,
  Modal,
  Paper,
  Spoiler,
  Stack,
  Switch,
  Text,
  Title,
  useMantineColorScheme,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { DataTable, type RowId } from 'mantine-datatable-lite';
import { useEffect, useMemo, useState } from 'react';
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
import { EmployeeDrawer } from './EmployeeDrawer';
import { useEmployeeQuery } from './useEmployeeQuery';

type PendingDelete = { ids: RowId[]; label: string } | null;

const employees = (count: number) => `${count} ${count === 1 ? 'employee' : 'employees'}`;

export function App() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const query = useEmployeeQuery();
  const [options, setOptions] = useState<FilterOptions>();
  const [optionsError, setOptionsError] = useState<string>();
  const [selectedIds, setSelectedIds] = useState<RowId[]>([]);
  const [viewing, setViewing] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ color: string; text: string }>();
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

  /** Runs a mutation, reports the result, and refetches the current page. */
  async function mutate(action: () => Promise<string>, after?: () => void) {
    setBusy(true);
    try {
      setNotice({ color: 'teal', text: await action() });
      after?.();
      query.refresh();
    } catch (cause) {
      setNotice({ color: 'red', text: errorMessage(cause) });
    } finally {
      setBusy(false);
    }
  }

  if (optionsError) return <Alert color='red' m='xl'>{optionsError}. Is the API running?</Alert>;
  if (!options) return <Loader m='xl' />;

  return (
    <Container size='xl' py='lg'>
      <Stack gap='md'>
        <Group justify='space-between' align='flex-start'>
          <div>
            <Title order={2}>Employee directory</Title>
            <Text c='dimmed' size='sm'>
              mantine-datatable-lite in server mode: every sort, filter, search and page
              change becomes one request to an Express + SQLite API.
            </Text>
          </div>
          <Group gap='xs'>
            <Button
              variant='default'
              loading={busy}
              onClick={() =>
                mutate(
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
            <ActionIcon
              variant='default'
              size='lg'
              aria-label='Toggle color scheme'
              onClick={toggleColorScheme}
            >
              {colorScheme === 'dark' ? '☀' : '☾'}
            </ActionIcon>
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
          <Text size='sm' c='dimmed'>
            {employees(query.total)} matching
          </Text>
        </Group>

        {notice && (
          <Alert color={notice.color} withCloseButton onClose={() => setNotice(undefined)}>
            {notice.text}
          </Alert>
        )}

        <DataTable<Employee>
          key={tableKey}
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
          error={query.error}
          onRetry={query.refresh}
          globalSearch
          columnSelector
          showTableStatePills
          showReset
          persistKey='server-mode-example:employees'
          dateInput={DatePickerInput}
          labels={{ noRecords: 'No employees match these filters' }}
          selection={{
            selectedIds,
            onChange: ({ ids }) => setSelectedIds(ids),
            renderBulkActions: ({ ids, clear }) => (
              <Group gap='xs' wrap='nowrap'>
                <Button
                  size='xs'
                  variant='light'
                  loading={busy}
                  onClick={() =>
                    mutate(async () => `${employees(await setActive(ids, true))} activated.`, clear)
                  }
                >
                  Activate
                </Button>
                <Button
                  size='xs'
                  variant='light'
                  color='gray'
                  loading={busy}
                  onClick={() =>
                    mutate(async () => `${employees(await setActive(ids, false))} deactivated.`, clear)
                  }
                >
                  Deactivate
                </Button>
                <Button
                  size='xs'
                  variant='light'
                  color='red'
                  onClick={() =>
                    setPendingDelete({ ids, label: `${employees(ids.length)} (selected)` })
                  }
                >
                  Delete
                </Button>
              </Group>
            ),
          }}
          expandable={{
            allowMultiple: true,
            render: (row) => (
              <DataList orientation='horizontal' size='sm'>
                <DataList.Item>
                  <DataList.ItemLabel>Employee ID</DataList.ItemLabel>
                  <DataList.ItemValue>{row.id}</DataList.ItemValue>
                </DataList.Item>
                <DataList.Item>
                  <DataList.ItemLabel>Office</DataList.ItemLabel>
                  <DataList.ItemValue>{row.city}</DataList.ItemValue>
                </DataList.Item>
                <DataList.Item>
                  <DataList.ItemLabel>Tenure</DataList.ItemLabel>
                  <DataList.ItemValue>
                    {new Date().getFullYear() - row.joinDate.getFullYear()} years
                  </DataList.ItemValue>
                </DataList.Item>
              </DataList>
            ),
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
        onClose={() => setPendingDelete(null)}
        title='Delete employees?'
        centered
      >
        <Text size='sm'>Delete {pendingDelete?.label}? You can restore everything with Reset demo data.</Text>
        <Box mt='lg'>
          <Group justify='flex-end'>
            <Button variant='default' onClick={() => setPendingDelete(null)}>
              Cancel
            </Button>
            <Button
              color='red'
              loading={busy}
              onClick={() => {
                const ids = pendingDelete?.ids ?? [];
                setPendingDelete(null);
                mutate(
                  async () => `${employees(await deleteEmployees(ids))} deleted.`,
                  () => setSelectedIds((current) => current.filter((id) => !ids.includes(id))),
                );
              }}
            >
              Delete
            </Button>
          </Group>
        </Box>
      </Modal>
    </Container>
  );
}
