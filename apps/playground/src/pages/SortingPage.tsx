import { useState } from 'react';
import { SegmentedControl, Stack, Switch, Text } from '@mantine/core';
import { DataTable, type DataTableColumn } from '@scope/mantine-datatable-lite';
import { PlaygroundLayout } from '../components/PlaygroundLayout';
import { employees, type Employee } from '../data';

const scenarios = [
  { id: 'types', label: 'Sort by type', description: 'Sort strings, numbers, dates, and booleans.' },
  { id: 'menu', label: 'Sorting menu', description: 'Choose ascending, descending, or clear from a column menu.' },
  { id: 'menuOnly', label: 'Menu only', description: 'Sort from the menu without a dedicated sort icon.' },
  { id: 'custom', label: 'Custom sorting', description: 'Department starts sorted by name length with a custom comparator.' },
  { id: 'server', label: 'Server-owned sorting', description: 'The table reports changes while the example supplies sorted rows.' },
] as const;
type SortingScenario = (typeof scenarios)[number]['id'];

export function SortingPage() {
  const [active, setActive] = useState<SortingScenario>('types');
  const [showSortIcon, setShowSortIcon] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [tableBorder, setTableBorder] = useState(false);
  const [columnBorders, setColumnBorders] = useState(false);
  const [rowBorders, setRowBorders] = useState(true);
  const [rowCount, setRowCount] = useState('15');
  const [serverRows, setServerRows] = useState(() => employees.slice(0, 8));
  const [serverPagination, setServerPagination] = useState({ currentPage: 1, pageSize: 8, totalItems: employees.length });
  const [sortRequest, setSortRequest] = useState('No sort request yet');

  const menuOnly = active === 'menuOnly';
  const menuEnabled = menuOnly || active === 'menu' || active === 'server' || showMenu;
  const iconEnabled = !menuOnly && showSortIcon;
  const columns: DataTableColumn<Employee>[] = active === 'server' ? [
    { dataIndex: 'name', header: 'Name' },
    { dataIndex: 'salary', header: 'Salary', type: 'number', sortable: true, showMenu: menuEnabled, showSortIcon: iconEnabled },
  ] : active === 'custom' ? [
    { dataIndex: 'name', header: 'Name', sortable: true, showMenu: menuEnabled, showSortIcon: iconEnabled },
    { dataIndex: 'department', header: 'Department', sortable: true, showMenu: menuEnabled,
      showSortIcon: iconEnabled, defaultSortOrder: 'asc', sortFn: (a, b) => a.department.length - b.department.length },
    { dataIndex: 'salary', header: 'Salary', type: 'number', sortable: true, showMenu: menuEnabled, showSortIcon: iconEnabled },
  ] : [
    { dataIndex: 'name', header: 'Name', type: 'string', sortable: true, showMenu: menuEnabled, showSortIcon: iconEnabled },
    { dataIndex: 'age', header: 'Age', type: 'number', sortable: true, showMenu: menuEnabled, showSortIcon: iconEnabled },
    { dataIndex: 'joinDate', header: 'Joined', type: 'date', sortable: true, showMenu: menuEnabled,
      showSortIcon: iconEnabled, render: (row) => row.joinDate.toLocaleDateString() },
    { dataIndex: 'isActive', header: 'Active', type: 'boolean', sortable: true, showMenu: menuEnabled,
      showSortIcon: iconEnabled, render: (row) => row.isActive ? 'Yes' : 'No' },
  ];

  const controls = <Stack gap='md'>
    <Switch label='Show sort icons' checked={iconEnabled} disabled={menuOnly}
      onChange={(event) => setShowSortIcon(event.currentTarget.checked)} />
    <Switch label='Show column menus' checked={menuEnabled}
      disabled={menuOnly || active === 'menu' || active === 'server'}
      onChange={(event) => setShowMenu(event.currentTarget.checked)} />
    <Switch label='With table border' checked={tableBorder} onChange={(event) => setTableBorder(event.currentTarget.checked)} />
    <Switch label='With column borders' checked={columnBorders} onChange={(event) => setColumnBorders(event.currentTarget.checked)} />
    <Switch label='With row borders' checked={rowBorders} onChange={(event) => setRowBorders(event.currentTarget.checked)} />
    {active === 'server' ? <Text size='sm' c='dimmed'>{sortRequest}. Changes are reported after 300 ms.</Text>
      : <><Text size='sm' c='dimmed'>Rows shown</Text>
        <SegmentedControl fullWidth data={['8', '15', '30']} value={rowCount} onChange={setRowCount} /></>}
  </Stack>;

  return <PlaygroundLayout section='sorting' scenarios={scenarios} active={active} onSelect={setActive} controls={controls}>
    <DataTable key={active} columns={columns} rows={active === 'server' ? serverRows : employees.slice(0, Number(rowCount))}
      pagination={active === 'server' ? serverPagination : undefined}
      onChange={active === 'server' ? ({ sorter, pagination: next }) => {
        setSortRequest(sorter ? `Requested salary ${sorter.sortOrder}` : 'Requested original order');
        const ordered = sorter ? [...employees].sort((a, b) =>
          sorter.sortOrder === 'asc' ? a.salary - b.salary : b.salary - a.salary) : employees;
        const page = next ?? serverPagination;
        setServerPagination(page);
        setServerRows(ordered.slice((page.currentPage - 1) * page.pageSize, page.currentPage * page.pageSize));
      } : undefined}
      minWidth={660}
      withTableBorder={tableBorder} withColumnBorders={columnBorders} withRowBorders={rowBorders}
    />
  </PlaygroundLayout>;
}
