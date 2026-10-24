import { Alert, Button, Code, Group, Loader, Stack, Text } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { DataTable, type RowId } from 'mantine-datatable-lite';
import { useMemo, useState } from 'react';
import {
  deleteEmployees,
  fetchEmployee,
  fetchFilterOptions,
  setEmployeesActive,
} from '../../api/employees';
import {
  DeleteEmployeesModal,
  type DeleteTarget,
} from '../../components/employees/DeleteEmployeesModal';
import { EmployeeDetailsPanel } from '../../components/employees/EmployeeDetailsPanel';
import { EmployeeDrawer } from '../../components/employees/EmployeeDrawer';
import { NoEmployeesFound } from '../../components/employees/NoEmployeesFound';
import { TabIntro } from '../../components/layout/TabIntro';
import { TableStatePreview } from '../../components/table/TableStatePreview';
import { STORAGE_KEYS } from '../../constants/app';
import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  SERVER_TABLE_MIN_WIDTH,
  TABLE_MAX_HEIGHT,
} from '../../constants/table';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { useAsyncData } from '../../hooks/useAsyncData';
import type { Employee } from '../../types/employee';
import { formatCount } from '../../utils/format';
import { ServerBulkActions, type ServerAction } from './ServerBulkActions';
import { serverColumns } from './serverColumns';
import { useEmployeeQuery } from './useEmployeeQuery';

const employees = (count: number) => formatCount(count, 'employee');

/**
 * Server mode: the table reports every sort, filter, search and page change
 * through `onChange`, the API answers with one page, and the table shows it.
 */
export function ServerSideTable() {
  const query = useEmployeeQuery();
  const filterOptions = useAsyncData(fetchFilterOptions, []);
  const [selectedIds, setSelectedIds] = useState<RowId[]>([]);
  const [pendingDelete, setPendingDelete] = useState<DeleteTarget | null>(null);
  const { running, run } = useAsyncAction<ServerAction>();

  // The drawer loads the employee by ID, like a detail page would.
  const [viewingId, setViewingId] = useState<number | null>(null);
  const viewed = useAsyncData(
    viewingId === null ? null : (signal) => fetchEmployee(viewingId, signal),
    [viewingId],
  );

  const columns = useMemo(
    () =>
      filterOptions.data
        ? serverColumns(filterOptions.data, {
            onView: (employee) => setViewingId(employee.id),
            onDelete: (employee) => setPendingDelete({ ids: [employee.id], label: employee.name }),
          })
        : [],
    [filterOptions.data],
  );

  async function setActive(ids: RowId[], isActive: boolean, clearSelection: () => void) {
    const done = await run(isActive ? 'activate' : 'deactivate', async () => {
      const updated = await setEmployeesActive(ids, isActive);
      return `${employees(updated)} ${isActive ? 'activated' : 'deactivated'}.`;
    });
    if (done) {
      clearSelection();
      query.refresh();
    }
  }

  async function confirmDelete({ ids }: DeleteTarget) {
    const done = await run('delete', async () => `${employees(await deleteEmployees(ids))} deleted.`);
    if (done) {
      setSelectedIds((current) => current.filter((id) => !ids.includes(id)));
      query.refresh();
    }
    setPendingDelete(null);
  }

  // String filters in server mode need complete option lists before the table renders.
  if (filterOptions.error) {
    return (
      <Alert color='red' title='Could not reach the employee API'>
        <Stack gap='xs' align='flex-start'>
          <Text size='sm'>
            {filterOptions.error}. Start it with <Code>npm run dev</Code> in this folder.
          </Text>
          <Button size='xs' variant='light' color='red' onClick={filterOptions.reload}>
            Retry
          </Button>
        </Stack>
      </Alert>
    );
  }
  if (!filterOptions.data) {
    return (
      <Group justify='center' py='xl'>
        <Loader size='sm' />
      </Group>
    );
  }

  return (
    <Stack gap='md'>
      <TabIntro status={query.loaded ? `${employees(query.total)} matching` : 'Loading employees…'}>
        Every sort, filter, search and page change is one request to{' '}
        <Code>POST /api/employees/query</Code>. Kysely turns it into SQL, and SQLite
        returns one page.
      </TabIntro>

      <DataTable<Employee>
        aria-label='Employees, server-side'
        mode='server'
        rows={query.rows}
        columns={columns}
        onChange={query.setRequest}
        pagination={{
          currentPage: query.request?.pagination?.currentPage ?? 1,
          pageSize: query.request?.pagination?.pageSize ?? DEFAULT_PAGE_SIZE,
          totalItems: query.total,
          pageSizeOptions: PAGE_SIZE_OPTIONS,
        }}
        loading={query.loading}
        // Mantine's Loader picks its animation from `type` ('oval', 'bars' or 'dots').
        loaderProps={{ type: 'dots', size: 'md' }}
        error={query.error}
        onRetry={query.refresh}
        globalSearch
        columnSelector
        showTableStatePills
        showReset
        persistKey={STORAGE_KEYS.serverTableLayout}
        dateInput={DatePickerInput}
        emptyState={<NoEmployeesFound loaded={query.loaded} />}
        selection={{
          // Controlled, so a delete can drop the deleted IDs from the selection.
          selectedIds,
          onChange: ({ ids }) => setSelectedIds(ids),
          renderBulkActions: ({ ids, clear }) => (
            <ServerBulkActions
              running={running}
              onSetActive={(isActive) => setActive(ids, isActive, clear)}
              onDelete={() =>
                setPendingDelete({ ids, label: `${employees(ids.length)} (selected)` })
              }
            />
          ),
        }}
        expandable={{
          allowMultiple: true,
          // Fetched from GET /api/employees/:id/details when the row opens.
          render: (row) => <EmployeeDetailsPanel employee={row} />,
        }}
        onRowClick={(row) => setViewingId(row.id)}
        minWidth={SERVER_TABLE_MIN_WIDTH}
        maxHeight={TABLE_MAX_HEIGHT}
        stickyHeader
        striped
        highlightOnHover
        withTableBorder
      />

      <TableStatePreview
        title='Last request sent to POST /api/employees/query'
        change={query.request}
        placeholder='Waiting for the first request…'
      />

      <EmployeeDrawer
        opened={viewingId !== null}
        // Only the employee that was asked for, never the previous one while it loads.
        employee={viewed.data?.id === viewingId ? viewed.data : undefined}
        error={viewed.error}
        onClose={() => setViewingId(null)}
      />

      <DeleteEmployeesModal
        target={pendingDelete}
        deleting={running === 'delete'}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </Stack>
  );
}
