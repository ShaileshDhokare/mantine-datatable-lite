import { Anchor } from '@mantine/core';
import { rowActionsColumn, type DataTableColumn } from 'mantine-datatable-lite';
import { RowActions } from '../../components/employees/RowActions';
import { StatusBadge } from '../../components/employees/StatusBadge';
import { SalaryRangeFilter } from '../../components/table/SalaryRangeFilter';
import { STATUS_FILTER_OPTIONS } from '../../constants/table';
import type { Employee, FilterOptions } from '../../types/employee';
import { formatDate, formatSalary } from '../../utils/format';

type ServerColumnActions = {
  onView: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
};

/**
 * Columns for the server-side table. In server mode the table never filters or
 * sorts rows itself: these options only shape the UI and the TableChange that
 * goes to the API.
 */
export function serverColumns(
  options: FilterOptions,
  actions: ServerColumnActions,
): DataTableColumn<Employee>[] {
  return [
    {
      dataIndex: 'name',
      header: 'Name',
      width: 200,
      pinned: 'left',
      sortable: true,
      searchable: true,
      showMenu: true,
    },
    {
      dataIndex: 'email',
      header: 'Email',
      width: 280,
      searchable: true,
      showMenu: true,
      menuOptions: ['search', 'pin', 'display'],
      // Clicking the link opens the mail app, not the row's drawer.
      stopRowClick: true,
      render: (row) => (
        <Anchor href={`mailto:${row.email}`} size='sm'>
          {row.email}
        </Anchor>
      ),
    },
    {
      dataIndex: 'department',
      header: 'Department',
      width: 180,
      sortable: true,
      filterable: true,
      // Server mode needs the complete list: one page cannot describe every value.
      filterOptions: options.departments,
      searchableFilter: true,
      showMenu: true,
    },
    {
      dataIndex: 'role',
      header: 'Role',
      width: 230,
      sortable: true,
      filterable: true,
      filterOptions: options.roles,
      searchableFilter: true,
      searchable: true,
      // Header buttons and the menu together.
      showMenu: true,
      showSortIcon: true,
      showFilterIcon: true,
    },
    {
      dataIndex: 'city',
      header: 'City',
      width: 140,
      sortable: true,
      filterable: true,
      filterOptions: options.cities,
    },
    {
      dataIndex: 'salary',
      header: 'Salary',
      type: 'number',
      width: 130,
      align: 'right',
      sortable: true,
      filterable: true,
      searchable: false,
      // A custom filter UI; the value is still a standard `between` filter.
      renderFilter: (context) => <SalaryRangeFilter {...context} />,
      render: (row) => formatSalary(row.salary),
    },
    {
      dataIndex: 'isActive',
      header: 'Status',
      type: 'boolean',
      width: 120,
      sortable: true,
      filterable: true,
      searchable: false,
      filterOptions: STATUS_FILTER_OPTIONS,
      render: (row) => <StatusBadge active={row.isActive} />,
    },
    {
      dataIndex: 'joinDate',
      header: 'Joined',
      type: 'date',
      width: 140,
      sortable: true,
      // Sent in the first request, so the API starts with the newest employees.
      defaultSortOrder: 'desc',
      filterable: true,
      searchable: false,
      showMenu: true,
      render: (row) => formatDate(row.joinDate),
    },
    rowActionsColumn<Employee>({
      width: 96,
      render: (row) => (
        <RowActions employee={row} onView={actions.onView} onDelete={actions.onDelete} />
      ),
    }),
  ];
}
