import { useState } from 'react';
import { SegmentedControl, Stack, Switch, Text } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { DataTable, type DataTableColumn } from 'mantine-datatable-lite';
import { useScenario } from '../useScenario';
import { PlaygroundLayout } from '../components/PlaygroundLayout';
import { employees, type Employee } from '../data';

const scenarios = [
  { id: 'string', label: 'String values', description: 'Select one or more departments. Option search is available when enabled.' },
  { id: 'boolean', label: 'Boolean values', description: 'Filter active and inactive employees with checkboxes.' },
  { id: 'number', label: 'Number operators', description: 'Filter salary with comparisons or inclusive Between bounds.' },
  { id: 'date', label: 'Date operators', description: "Filter join dates with the native date input or Mantine's date picker." },
  { id: 'menuString', label: 'String from menu', description: 'Filter string values from the column menu alone.' },
  { id: 'menuBoolean', label: 'Boolean from menu', description: 'Filter boolean values from the column menu alone.' },
  { id: 'menuNumber', label: 'Number from menu', description: 'Use number operators from the column menu alone.' },
  { id: 'menuDate', label: 'Date from menu', description: 'Use date operators from the column menu alone.' },
  { id: 'default', label: 'Defaults and options', description: 'Start with Engineering selected and a supplied option list.' },
  { id: 'multiple', label: 'Multiple filters', description: 'Combine department, salary, and status with AND.' },
  { id: 'custom', label: 'Custom predicate', description: 'Filter roles using a custom seniority predicate.' },
  { id: 'empty', label: 'No matching records', description: 'See the default empty state, then try custom content or Reset.' },
] as const;

export function FilteringPage() {
  const [active, setActive] = useScenario(scenarios);
  const [searchableFilter, setSearchableFilter] = useState(false);
  const [optionSource, setOptionSource] = useState('Derived');
  const [showFilterIcon, setShowFilterIcon] = useState(true);
  const [showSortIcon, setShowSortIcon] = useState(true);
  const [showMenu, setShowMenu] = useState(true);
  const [tableBorder, setTableBorder] = useState(false);
  const [columnBorders, setColumnBorders] = useState(false);
  const [rowBorders, setRowBorders] = useState(true);
  const [rowCount, setRowCount] = useState('30');
  const [customEmpty, setCustomEmpty] = useState(false);
  const [mantinePicker, setMantinePicker] = useState(true);

  const menuOnly = active.startsWith('menu');
  const filterIcon = !menuOnly && showFilterIcon;
  const sortIcon = !menuOnly && showSortIcon;
  const columnMenu = menuOnly || showMenu;
  const suppliedOptions = optionSource === 'Provided' || active === 'default';
  const shared = {
    sortable: true, filterable: true, showMenu: columnMenu,
    showSortIcon: sortIcon, showFilterIcon: filterIcon,
  };
  const name: DataTableColumn<Employee> = { dataIndex: 'name', header: 'Name' };
  const department: DataTableColumn<Employee> = {
    ...shared, dataIndex: 'department', header: 'Department', type: 'string', searchableFilter,
    filterOptions: suppliedOptions ? [
      { value: 'Engineering', label: 'Engineering' }, { value: 'Design', label: 'Design' },
      { value: 'Sales', label: 'Sales' }, { value: 'Marketing', label: 'Marketing' },
    ] : undefined,
    defaultFilterValue: active === 'default' ? ['Engineering'] : active === 'empty' ? ['No such department'] : undefined,
  };
  const salary: DataTableColumn<Employee> = {
    ...shared, dataIndex: 'salary', header: 'Salary', type: 'number',
    render: (row) => `$${row.salary.toLocaleString()}`,
  };
  const status: DataTableColumn<Employee> = {
    ...shared, dataIndex: 'isActive', header: 'Active', type: 'boolean', searchableFilter,
    filterOptions: suppliedOptions ? [
      { value: 'true', label: 'Active' }, { value: 'false', label: 'Inactive' },
    ] : undefined,
    render: (row) => row.isActive ? 'Yes' : 'No',
  };
  const joined: DataTableColumn<Employee> = {
    ...shared, dataIndex: 'joinDate', header: 'Joined', type: 'date',
    render: (row) => row.joinDate.toLocaleDateString(),
  };
  const custom: DataTableColumn<Employee> = {
    ...shared, dataIndex: 'role', header: 'Role', type: 'string', searchableFilter,
    filterOptions: [{ value: 'senior', label: 'Senior roles' }, { value: 'other', label: 'Other roles' }],
    filterFn: (row, value) => Array.isArray(value) && value.some((choice) =>
      choice === (/(senior|director|chief|manager)/i.test(row.role) ? 'senior' : 'other')),
  };

  const columns: DataTableColumn<Employee>[] = (() => {
    switch (active) {
      case 'string': case 'menuString': case 'default': case 'empty': return [name, department];
      case 'boolean': case 'menuBoolean': return [name, status];
      case 'number': case 'menuNumber': return [name, salary];
      case 'date': case 'menuDate': return [name, joined];
      case 'multiple': return [name, department, salary, status];
      case 'custom': return [name, custom];
    }
  })();

  const controls = <Stack gap='md'>
    <Switch label='Show filter icons' checked={filterIcon} disabled={menuOnly}
      onChange={(event) => setShowFilterIcon(event.currentTarget.checked)} />
    <Switch label='Show sort icons' checked={sortIcon} disabled={menuOnly}
      onChange={(event) => setShowSortIcon(event.currentTarget.checked)} />
    <Switch label='Show column menus' checked={columnMenu} disabled={menuOnly}
      onChange={(event) => setShowMenu(event.currentTarget.checked)} />
    <Switch label='Search filter options' checked={searchableFilter}
      onChange={(event) => setSearchableFilter(event.currentTarget.checked)} />
    <Text size='sm' fw={500}>Choice options</Text>
    <SegmentedControl fullWidth data={['Derived', 'Provided']} value={optionSource}
      onChange={setOptionSource} />
    <Switch label='With table border' checked={tableBorder}
      onChange={(event) => setTableBorder(event.currentTarget.checked)} />
    <Switch label='With column borders' checked={columnBorders}
      onChange={(event) => setColumnBorders(event.currentTarget.checked)} />
    <Switch label='With row borders' checked={rowBorders}
      onChange={(event) => setRowBorders(event.currentTarget.checked)} />
    <Text size='sm' fw={500}>Rows shown</Text>
    <SegmentedControl fullWidth data={['10', '30']} value={rowCount} onChange={setRowCount} />
    {(active === 'date' || active === 'menuDate') && <Switch label='Mantine date picker'
      description='Off uses the native date input.' checked={mantinePicker}
      onChange={(event) => setMantinePicker(event.currentTarget.checked)} />}
    {active === 'empty' && <Switch label='Custom empty state' checked={customEmpty}
      onChange={(event) => setCustomEmpty(event.currentTarget.checked)} />}
  </Stack>;

  return <PlaygroundLayout section='filtering' scenarios={scenarios} active={active}
    onSelect={setActive} controls={controls}>
    <DataTable key={active} columns={columns} rows={employees.slice(0, Number(rowCount))}
      minWidth={active === 'multiple' ? 900 : 560}
      withTableBorder={tableBorder} withColumnBorders={columnBorders} withRowBorders={rowBorders}
      emptyState={active === 'empty' && customEmpty ? <Text size='sm' c='grape'>No employees match this view</Text> : undefined}
      dateInput={mantinePicker ? DatePickerInput : undefined}
    />
  </PlaygroundLayout>;
}
