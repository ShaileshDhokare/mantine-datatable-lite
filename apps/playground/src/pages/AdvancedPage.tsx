import { useMemo, useState } from 'react';
import { Badge, Button, Select, Stack, Switch, Text } from '@mantine/core';
import {
  DataTable,
  type ColumnSearch,
  type DataTableColumn,
  type Filter,
  type NumericOperator,
  type Sorter,
} from '@scope/mantine-datatable-lite';
import { PlaygroundLayout } from '../components/PlaygroundLayout';
import { employees, type Employee } from '../data';

const scenarios = [{
  id: 'combined',
  label: 'Complete table',
  description: 'Sort, filter, search, and page through 100 employees in one table.',
}] as const;

const departmentOptions = [...new Set(employees.map((employee) => employee.department))].sort();
const globalSearchFields: (keyof Employee)[] = ['name', 'email', 'department', 'role'];

type TableState = {
  page: number;
  pageSize: number;
  sorter?: Sorter;
  filters: Filter[];
  columnSearch: ColumnSearch[];
  searchQuery: string;
};

function initialState(): TableState {
  return { page: 1, pageSize: 10, filters: [], columnSearch: [], searchQuery: '' };
}

function matchesRange(actual: number, operator: NumericOperator, value: number | [number, number]) {
  if (operator === 'between') {
    return Array.isArray(value) && actual >= Math.min(...value) && actual <= Math.max(...value);
  }
  if (Array.isArray(value)) return false;
  switch (operator) {
    case 'eq': return actual === value;
    case 'neq': return actual !== value;
    case 'gt': return actual > value;
    case 'gte': return actual >= value;
    case 'lt': return actual < value;
    case 'lte': return actual <= value;
  }
}

function matchesFilter(employee: Employee, filter: Filter) {
  const actual = employee[filter.field as keyof Employee];
  if (Array.isArray(filter.value)) return filter.value.some((choice) => choice === actual);
  const numeric = actual instanceof Date ? actual.getTime() : Number(actual);
  const raw = filter.value.value;
  const asNumber = (value: number | Date) => value instanceof Date ? value.getTime() : value;
  const bound = Array.isArray(raw) ? raw.map(asNumber) as [number, number] : asNumber(raw);
  return matchesRange(numeric, filter.value.operator, bound);
}

function sortEmployees(rows: Employee[], sorter?: Sorter) {
  if (!sorter) return rows;
  const field = sorter.sortField as keyof Employee;
  return [...rows].sort((a, b) => {
    const left = a[field];
    const right = b[field];
    const result = left instanceof Date && right instanceof Date
      ? left.getTime() - right.getTime()
      : typeof left === 'number' && typeof right === 'number'
        ? left - right
        : typeof left === 'boolean' && typeof right === 'boolean'
          ? Number(left) - Number(right)
          : String(left).localeCompare(String(right), undefined, { numeric: true, sensitivity: 'base' });
    return sorter.sortOrder === 'asc' ? result : -result;
  });
}

function applyRequest(state: TableState) {
  const globalTerm = state.searchQuery.toLocaleLowerCase();
  const filtered = employees.filter((employee) =>
    state.filters.every((filter) => matchesFilter(employee, filter)) &&
    state.columnSearch.every(({ searchField, searchValue }) =>
      String(employee[searchField as keyof Employee] ?? '').toLocaleLowerCase().includes(searchValue.toLocaleLowerCase())) &&
    (!globalTerm || globalSearchFields.some((field) =>
      String(employee[field]).toLocaleLowerCase().includes(globalTerm))),
  );
  return sortEmployees(filtered, state.sorter);
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

  function resetTable() {
    setState(initialState());
    setResetKey((key) => key + 1);
  }

  const columns: DataTableColumn<Employee>[] = [
    { dataIndex: 'name', header: 'Name', sortable: true, searchable: true, showMenu,
      showSortIcon, showSearchIcon, width: 170 },
    { dataIndex: 'email', header: 'Email', searchable: true, showMenu, showSearchIcon, width: 240 },
    { dataIndex: 'department', header: 'Department', sortable: true, filterable: true,
      searchable: true, filterOptions: departmentOptions, searchableFilter, showMenu,
      showSortIcon, showFilterIcon, showSearchIcon, width: 150 },
    { dataIndex: 'role', header: 'Role', sortable: true, searchable: true, showMenu,
      showSortIcon, showSearchIcon, width: 190 },
    { dataIndex: 'salary', header: 'Salary', type: 'number', sortable: true, filterable: true,
      searchable: false, showMenu, showSortIcon, showFilterIcon, align: 'right', width: 120,
      render: (employee) => `$${employee.salary.toLocaleString()}` },
    { dataIndex: 'isActive', header: 'Status', type: 'boolean', sortable: true, filterable: true,
      searchable: false, filterOptions: [{ value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' }], showMenu, showSortIcon, showFilterIcon,
      render: (employee) => <Badge variant='light' color={employee.isActive ? 'teal' : 'gray'}>
        {employee.isActive ? 'Active' : 'Inactive'}
      </Badge> },
    { dataIndex: 'joinDate', header: 'Joined', type: 'date', sortable: true, filterable: true,
      searchable: false, showMenu, showSortIcon, showFilterIcon, width: 120,
      render: (employee) => employee.joinDate.toLocaleDateString() },
  ];

  const matched = useMemo(() => applyRequest(state), [state]);
  const rows = matched.slice((state.page - 1) * state.pageSize, state.page * state.pageSize);
  const options = pageSizeChoices === 'fixed' ? false : pageSizeChoices === 'compact' ? [5, 10, 20] : undefined;

  const controls = <Stack gap='sm'>
    <Text size='sm' c='dimmed'>{matched.length} of {employees.length} employees match · page {state.page}</Text>
    <Button variant='light' size='xs' onClick={resetTable}>
      Reset table state
    </Button>
    <Select label='Page size choices' data={[
      { value: 'default', label: '10, 20, 50, 100' },
      { value: 'compact', label: '5, 10, 20' },
      { value: 'fixed', label: 'Fixed size' },
    ]} value={pageSizeChoices} onChange={(value) => setPageSizeChoices(value ?? 'default')} allowDeselect={false} />
    <Switch label='Column menus' checked={showMenu} onChange={(event) => setShowMenu(event.currentTarget.checked)} />
    <Switch label='Sort icons' checked={showSortIcon} onChange={(event) => setShowSortIcon(event.currentTarget.checked)} />
    <Switch label='Filter icons' checked={showFilterIcon} onChange={(event) => setShowFilterIcon(event.currentTarget.checked)} />
    <Switch label='Search icons' checked={showSearchIcon} onChange={(event) => setShowSearchIcon(event.currentTarget.checked)} />
    <Switch label='Search filter choices' checked={searchableFilter}
      onChange={(event) => setSearchableFilter(event.currentTarget.checked)} />
    <Switch label='Striped rows' checked={striped} onChange={(event) => setStriped(event.currentTarget.checked)} />
    <Switch label='Highlight on hover' checked={highlightOnHover}
      onChange={(event) => setHighlightOnHover(event.currentTarget.checked)} />
    <Switch label='Column borders' checked={columnBorders}
      onChange={(event) => setColumnBorders(event.currentTarget.checked)} />
    <Switch label='Row borders' checked={rowBorders} onChange={(event) => setRowBorders(event.currentTarget.checked)} />
    <Switch label='Constrain height' checked={constrainHeight}
      onChange={(event) => setConstrainHeight(event.currentTarget.checked)} />
  </Stack>;

  return <PlaygroundLayout section='advanced' scenarios={scenarios} active='combined'
    onSelect={resetTable} controls={controls}>
    <DataTable key={resetKey} columns={columns} rows={rows} globalSearch
      columnSelector showTableStatePills showReset
      pagination={{ currentPage: state.page, pageSize: state.pageSize, totalItems: matched.length,
        pageSizeOptions: options }}
      onChange={({ pagination, sorter, filters, columnSearch, searchQuery }) => setState({
        page: pagination?.currentPage ?? 1,
        pageSize: pagination?.pageSize ?? state.pageSize,
        sorter,
        filters: filters ?? [],
        columnSearch: columnSearch ?? [],
        searchQuery: searchQuery ?? '',
      })}
      minWidth={1150} maxHeight={constrainHeight ? 420 : undefined}
      stickyHeader={constrainHeight} striped={striped} highlightOnHover={highlightOnHover}
      withTableBorder withColumnBorders={columnBorders} withRowBorders={rowBorders} />
  </PlaygroundLayout>;
}
