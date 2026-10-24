import { Button, Code, Stack } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { DataTable, type TableChange } from 'mantine-datatable-lite';
import { useMemo, useState } from 'react';
import { fetchAllEmployees } from '../../api/employees';
import { EmployeeDetailsPanel } from '../../components/employees/EmployeeDetailsPanel';
import { EmployeeDrawer } from '../../components/employees/EmployeeDrawer';
import { NoEmployeesFound } from '../../components/employees/NoEmployeesFound';
import { TabIntro } from '../../components/layout/TabIntro';
import { TableStatePreview } from '../../components/table/TableStatePreview';
import { STORAGE_KEYS } from '../../constants/app';
import {
  CLIENT_TABLE_MIN_WIDTH,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  TABLE_MAX_HEIGHT,
} from '../../constants/table';
import { useAsyncData } from '../../hooks/useAsyncData';
import type { Employee } from '../../types/employee';
import { formatCount } from '../../utils/format';
import { ClientBulkActions } from './ClientBulkActions';
import { clientColumns } from './clientColumns';

/**
 * Client mode: every employee loads once, and the table sorts, filters, searches
 * and pages them in the browser. `onChange` still reports each change, but
 * nothing needs to be fetched.
 */
export function ClientSideTable() {
  const employees = useAsyncData(fetchAllEmployees, []);
  const [lastChange, setLastChange] = useState<TableChange | null>(null);
  const [viewing, setViewing] = useState<Employee>();
  const [drawerOpened, setDrawerOpened] = useState(false);

  const columns = useMemo(
    () =>
      clientColumns({
        onView: (employee) => {
          setViewing(employee);
          setDrawerOpened(true);
        },
      }),
    [],
  );

  const status = employees.error
    ? 'Could not load employees'
    : employees.data
      ? `${formatCount(employees.data.length, 'employee')} loaded`
      : 'Loading employees…';

  return (
    <Stack gap='md'>
      <TabIntro
        status={status}
        actions={
          <Button size='xs' variant='default' loading={employees.loading} onClick={employees.reload}>
            Reload
          </Button>
        }
      >
        Every employee loads once from <Code>GET /api/employees</Code>. The table sorts,
        filters, searches and pages them in the browser, and keeps its state when the rows
        reload.
      </TabIntro>

      <DataTable<Employee>
        aria-label='Employees, client-side'
        rows={employees.data ?? []}
        columns={columns}
        onChange={setLastChange}
        // Client mode: the starting page size; the table counts the rows.
        pagination={{ pageSize: DEFAULT_PAGE_SIZE, pageSizeOptions: PAGE_SIZE_OPTIONS }}
        loading={employees.loading}
        error={employees.error}
        onRetry={employees.reload}
        globalSearch
        columnSelector
        showTableStatePills
        showReset
        persistKey={STORAGE_KEYS.clientTableLayout}
        dateInput={DatePickerInput}
        emptyState={<NoEmployeesFound loaded={employees.data !== undefined} />}
        selection={{
          // Uncontrolled: the table keeps the selection itself.
          renderBulkActions: ({ loadedRows }) => <ClientBulkActions employees={loadedRows} />,
        }}
        expandable={{
          // Click anywhere on a row to open it; one row at a time.
          trigger: 'row',
          render: (row) => <EmployeeDetailsPanel employee={row} />,
        }}
        minWidth={CLIENT_TABLE_MIN_WIDTH}
        maxHeight={TABLE_MAX_HEIGHT}
        stickyHeader
        striped
        highlightOnHover
        withTableBorder
      />

      <TableStatePreview
        title='Table state from onChange'
        description='In client mode the table applies this itself. Nothing is sent to the API.'
        change={lastChange}
        placeholder='Sort, filter, search or change the page to see the table state.'
      />

      <EmployeeDrawer
        opened={drawerOpened}
        employee={viewing}
        onClose={() => setDrawerOpened(false)}
      />
    </Stack>
  );
}
