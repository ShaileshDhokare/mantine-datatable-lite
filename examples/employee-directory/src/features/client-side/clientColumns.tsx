import { Text } from '@mantine/core';
import { rowActionsColumn, type DataTableColumn } from 'mantine-datatable-lite';
import { RowActions } from '../../components/employees/RowActions';
import { StatusBadge } from '../../components/employees/StatusBadge';
import { STATUS_FILTER_OPTIONS } from '../../constants/table';
import { LEVELS, levelOf, levelRank } from '../../data/levels';
import { REGIONS, regionOf } from '../../data/regions';
import type { Employee } from '../../types/employee';
import { formatDate, formatSalary } from '../../utils/format';

type ClientColumnActions = {
  onView: (employee: Employee) => void;
};

/**
 * Columns for the client-side table. The table sorts, filters and searches the
 * loaded rows itself, so these columns use options that only work in client
 * mode: filter choices taken from the rows, computed values, and custom sort
 * and filter functions.
 */
export function clientColumns(actions: ClientColumnActions): DataTableColumn<Employee>[] {
  return [
    {
      dataIndex: 'name',
      header: 'Name',
      width: 200,
      pinned: 'left',
      sortable: true,
      defaultSortOrder: 'asc',
      searchable: true,
      showMenu: true,
    },
    {
      // A default cell, so the global search highlights the matching text.
      dataIndex: 'email',
      header: 'Email',
      width: 260,
      searchable: true,
      showMenu: true,
      menuOptions: ['search', 'pin', 'display'],
    },
    {
      dataIndex: 'department',
      header: 'Department',
      width: 180,
      sortable: true,
      filterable: true,
      // No filterOptions: in client mode the table lists the values in the rows.
      searchableFilter: true,
      showMenu: true,
    },
    {
      dataIndex: 'role',
      header: 'Role',
      width: 220,
      sortable: true,
      searchable: true,
      showMenu: true,
    },
    {
      // A computed column: `getValue` feeds the cell, sorting, filtering and search.
      dataIndex: 'level',
      header: 'Level',
      width: 200,
      getValue: (row) => levelOf(row.role),
      sortable: true,
      // By seniority rather than alphabetically.
      sortFn: (a, b) => levelRank(a.role) - levelRank(b.role),
      filterable: true,
      filterOptions: [...LEVELS],
      showMenu: true,
    },
    {
      dataIndex: 'city',
      header: 'Office',
      width: 150,
      sortable: true,
      filterable: true,
      // Filter by region: the choices are regions, matched against each row's city.
      filterOptions: [...REGIONS],
      filterFn: (row, value) =>
        Array.isArray(value) && (value as string[]).includes(regionOf(row.city) ?? ''),
      render: (row) => (
        <div>
          <Text size='sm'>{row.city}</Text>
          <Text size='xs' c='dimmed'>
            {regionOf(row.city)}
          </Text>
        </div>
      ),
    },
    {
      // The built-in number filter: equals, greater than, between and so on.
      dataIndex: 'salary',
      header: 'Salary',
      type: 'number',
      width: 130,
      align: 'right',
      sortable: true,
      filterable: true,
      searchable: false,
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
      // Starts with active employees only, shown as a pill. The table's Reset
      // button clears it like any other filter.
      defaultFilterValue: [true],
      render: (row) => <StatusBadge active={row.isActive} />,
    },
    {
      dataIndex: 'joinDate',
      header: 'Joined',
      type: 'date',
      width: 140,
      sortable: true,
      filterable: true,
      searchable: false,
      showMenu: true,
      render: (row) => formatDate(row.joinDate),
    },
    rowActionsColumn<Employee>({
      width: 64,
      render: (row) => <RowActions employee={row} onView={actions.onView} />,
    }),
  ];
}
