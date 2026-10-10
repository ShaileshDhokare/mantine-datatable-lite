import { useMemo, useState } from 'react';
import {
  ActionIcon,
  Badge,
  Button,
  DataList,
  Select,
  Stack,
  Switch,
  Text,
  Tooltip,
} from '@mantine/core';
import {
  DataTable,
  Icon,
  type ColumnSearch,
  type DataTableColumn,
  type Filter,
  type RowId,
  type Sorter,
} from 'mantine-datatable-lite';
import { PlaygroundLayout } from '../components/PlaygroundLayout';
import { employees, type Employee } from '../data';
import { queryEmployees } from '../queryEmployees';

const scenarios = [
  {
    id: 'combined',
    label: 'Complete table',
    description:
      'Sort, filter, search, pin, expand, select, and page through 100 employees in one table.',
  },
] as const;

const departmentOptions = [
  ...new Set(employees.map((employee) => employee.department)),
].sort();

type TableState = {
  page: number;
  pageSize: number;
  sorter?: Sorter;
  filters: Filter[];
  columnSearch: ColumnSearch[];
  searchQuery: string;
};

function initialState(): TableState {
  return {
    page: 1,
    pageSize: 10,
    filters: [],
    columnSearch: [],
    searchQuery: '',
  };
}

export function AdvancedPage() {
  const [state, setState] = useState<TableState>(initialState);
  const [resetKey, setResetKey] = useState(0);
  const [showMenu, setShowMenu] = useState(true);
  const [showSortIcon, setShowSortIcon] = useState(true);
  const [showFilterIcon, setShowFilterIcon] = useState(true);
  const [showSearchIcon, setShowSearchIcon] = useState(true);
  const [searchableFilter, setSearchableFilter] = useState(true);
  const [striped, setStriped] = useState(true);
  const [highlightOnHover, setHighlightOnHover] = useState(true);
  const [columnBorders, setColumnBorders] = useState(false);
  const [rowBorders, setRowBorders] = useState(true);
  const [constrainHeight, setConstrainHeight] = useState(true);
  const [pageSizeChoices, setPageSizeChoices] = useState('default');
  const [selectedIds, setSelectedIds] = useState<RowId[]>([]);

  function resetTable() {
    setState(initialState());
    setResetKey((key) => key + 1);
    setSelectedIds([]);
  }

  const columns: DataTableColumn<Employee>[] = [
    {
      dataIndex: 'name',
      header: 'Name',
      sortable: true,
      searchable: true,
      showMenu,
      showSortIcon,
      showSearchIcon,
      width: 170,
      sticky: 'left',
    },
    {
      dataIndex: 'email',
      header: 'Email',
      searchable: true,
      showMenu,
      showSearchIcon,
      width: 240,
    },
    {
      dataIndex: 'department',
      header: 'Department',
      sortable: true,
      filterable: true,
      searchable: true,
      filterOptions: departmentOptions,
      searchableFilter,
      showMenu,
      showSortIcon,
      showFilterIcon,
      showSearchIcon,
      width: 150,
    },
    {
      dataIndex: 'role',
      header: 'Role',
      sortable: true,
      searchable: true,
      showMenu,
      showSortIcon,
      showSearchIcon,
      width: 190,
    },
    {
      dataIndex: 'salary',
      header: 'Salary',
      type: 'number',
      sortable: true,
      filterable: true,
      searchable: false,
      showMenu,
      showSortIcon,
      showFilterIcon,
      align: 'right',
      width: 120,
      render: (employee) => `$${employee.salary.toLocaleString()}`,
    },
    {
      dataIndex: 'isActive',
      header: 'Status',
      type: 'boolean',
      sortable: true,
      filterable: true,
      searchable: false,
      filterOptions: [
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' },
      ],
      showMenu,
      showSortIcon,
      showFilterIcon,
      render: (employee) => (
        <Badge variant='light' color={employee.isActive ? 'teal' : 'gray'}>
          {employee.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      dataIndex: 'joinDate',
      header: 'Joined',
      type: 'date',
      sortable: true,
      filterable: true,
      searchable: false,
      showMenu,
      showSortIcon,
      showFilterIcon,
      width: 120,
      sticky: 'right',
      render: (employee) => employee.joinDate.toLocaleDateString(),
    },
  ];

  const matched = useMemo(() => queryEmployees(employees, state), [state]);
  const rows = matched.slice(
    (state.page - 1) * state.pageSize,
    state.page * state.pageSize,
  );
  const options =
    pageSizeChoices === 'fixed'
      ? false
      : pageSizeChoices === 'compact'
        ? [5, 10, 20]
        : undefined;

  const controls = (
    <Stack gap='sm'>
      <Text size='sm' c='dimmed'>
        {matched.length} of {employees.length} employees match · page{' '}
        {state.page}
      </Text>
      <Button variant='light' size='xs' onClick={resetTable}>
        Reset table state
      </Button>
      <Select
        label='Page size choices'
        data={[
          { value: 'default', label: '10, 20, 50, 100' },
          { value: 'compact', label: '5, 10, 20' },
          { value: 'fixed', label: 'Fixed size' },
        ]}
        value={pageSizeChoices}
        onChange={(value) => setPageSizeChoices(value ?? 'default')}
        allowDeselect={false}
      />
      <Switch
        label='Column menus'
        checked={showMenu}
        onChange={(event) => setShowMenu(event.currentTarget.checked)}
      />
      <Switch
        label='Sort icons'
        checked={showSortIcon}
        onChange={(event) => setShowSortIcon(event.currentTarget.checked)}
      />
      <Switch
        label='Filter icons'
        checked={showFilterIcon}
        onChange={(event) => setShowFilterIcon(event.currentTarget.checked)}
      />
      <Switch
        label='Search icons'
        checked={showSearchIcon}
        onChange={(event) => setShowSearchIcon(event.currentTarget.checked)}
      />
      <Switch
        label='Search filter choices'
        checked={searchableFilter}
        onChange={(event) => setSearchableFilter(event.currentTarget.checked)}
      />
      <Switch
        label='Striped rows'
        checked={striped}
        onChange={(event) => setStriped(event.currentTarget.checked)}
      />
      <Switch
        label='Highlight on hover'
        checked={highlightOnHover}
        onChange={(event) => setHighlightOnHover(event.currentTarget.checked)}
      />
      <Switch
        label='Column borders'
        checked={columnBorders}
        onChange={(event) => setColumnBorders(event.currentTarget.checked)}
      />
      <Switch
        label='Row borders'
        checked={rowBorders}
        onChange={(event) => setRowBorders(event.currentTarget.checked)}
      />
      <Switch
        label='Constrain height'
        checked={constrainHeight}
        onChange={(event) => setConstrainHeight(event.currentTarget.checked)}
      />
    </Stack>
  );

  return (
    <PlaygroundLayout
      section='advanced'
      scenarios={scenarios}
      active='combined'
      onSelect={resetTable}
      controls={controls}
    >
      <DataTable
        key={resetKey}
        columns={columns}
        rows={rows}
        globalSearch
        columnSelector
        showTableStatePills
        showReset
        toolbar
        selection={{
          selectedIds,
          onChange: ({ ids }) => setSelectedIds(ids),
          renderBulkActions: () => (
            <Tooltip label='Log all selected employees'>
              <ActionIcon
                variant='transparent'
                size='lg'
                aria-label='Log all selected employees'
                onClick={() =>
                  console.log(
                    employees.filter((employee) =>
                      selectedIds.includes(employee.id),
                    ),
                  )
                }
              >
                <Icon name='show' size={20} />
              </ActionIcon>
            </Tooltip>
          ),
        }}
        expandable={{
          allowMultiple: true,
          render: (employee) => (
            <DataList size='sm' orientation='horizontal'>
              <DataList.Item>
                <DataList.ItemLabel>Employee ID</DataList.ItemLabel>
                <DataList.ItemValue>{employee.id}</DataList.ItemValue>
              </DataList.Item>
              <DataList.Item>
                <DataList.ItemLabel>Email</DataList.ItemLabel>
                <DataList.ItemValue>{employee.email}</DataList.ItemValue>
              </DataList.Item>
              <DataList.Item>
                <DataList.ItemLabel>Age</DataList.ItemLabel>
                <DataList.ItemValue>{employee.age}</DataList.ItemValue>
              </DataList.Item>
            </DataList>
          ),
        }}
        pagination={{
          currentPage: state.page,
          pageSize: state.pageSize,
          totalItems: matched.length,
          pageSizeOptions: options,
        }}
        onChange={({
          pagination,
          sorter,
          filters,
          columnSearch,
          searchQuery,
        }) =>
          setState({
            page: pagination?.currentPage ?? 1,
            pageSize: pagination?.pageSize ?? state.pageSize,
            sorter,
            filters: filters ?? [],
            columnSearch: columnSearch ?? [],
            searchQuery: searchQuery ?? '',
          })
        }
        minWidth={1250}
        maxHeight={constrainHeight ? 420 : undefined}
        stickyHeader={constrainHeight}
        striped={striped}
        highlightOnHover={highlightOnHover}
        withTableBorder
        withColumnBorders={columnBorders}
        withRowBorders={rowBorders}
      />
    </PlaygroundLayout>
  );
}
