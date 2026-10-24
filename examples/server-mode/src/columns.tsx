import { ActionIcon, Anchor, Badge, Group, Tooltip } from '@mantine/core';
import { Icon, rowActionsColumn, type DataTableColumn } from 'mantine-datatable-lite';
import type { Employee, FilterOptions } from './api';

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

type RowActions = {
  onView: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
};

/**
 * Column definitions. In server mode the table never filters or sorts locally:
 * every option below only shapes the UI and the TableChange sent to the API.
 */
export function employeeColumns(
  options: FilterOptions,
  actions: RowActions,
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
      render: (row) => (
        <Anchor href={`mailto:${row.email}`} size='sm' onClick={(event) => event.stopPropagation()}>
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
      render: (row) => currency.format(row.salary),
    },
    {
      dataIndex: 'isActive',
      header: 'Status',
      type: 'boolean',
      width: 120,
      sortable: true,
      filterable: true,
      searchable: false,
      filterOptions: [
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' },
      ],
      render: (row) => (
        <Badge variant='light' color={row.isActive ? 'teal' : 'gray'}>
          {row.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      dataIndex: 'joinDate',
      header: 'Joined',
      type: 'date',
      width: 140,
      sortable: true,
      defaultSortOrder: 'desc',
      filterable: true,
      searchable: false,
      showMenu: true,
      render: (row) => row.joinDate.toLocaleDateString(),
    },
    rowActionsColumn<Employee>({
      width: 96,
      render: (row) => (
        <Group gap={4} wrap='nowrap'>
          <Tooltip label='View details'>
            <ActionIcon
              variant='subtle'
              aria-label={`View ${row.name}`}
              onClick={() => actions.onView(row)}
            >
              <Icon name='show' size={18} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label='Delete'>
            <ActionIcon
              variant='subtle'
              color='red'
              aria-label={`Delete ${row.name}`}
              onClick={() => actions.onDelete(row)}
            >
              <Icon name='delete' size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      ),
    }),
  ];
}
