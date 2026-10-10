import { useState } from 'react';
import { SegmentedControl, Stack, Switch, Text } from '@mantine/core';
import { DataTable, type DataTableColumn } from 'mantine-datatable-lite';
import { useScenario } from '../useScenario';
import { PlaygroundLayout } from '../components/PlaygroundLayout';
import { employees, type Employee } from '../data';

const scenarios = [
  {
    id: 'column',
    label: 'Column search',
    description: 'Search employee names from the header icon.',
  },
  {
    id: 'menu',
    label: 'Search from menu',
    description: 'Use the column menu when the search icon is hidden.',
  },
  {
    id: 'global',
    label: 'Global search',
    description:
      'Expand the search action above the table and search across columns.',
  },
  {
    id: 'combined',
    label: 'Combined search',
    description: 'Combine a column search with global search and a filter.',
  },
  {
    id: 'default',
    label: 'Default search',
    description: 'Start with a name search already applied.',
  },
] as const;
type SearchScenario = (typeof scenarios)[number]['id'];

export function SearchingPage() {
  const [active, setActive] = useScenario(scenarios);
  const [showSearchIcon, setShowSearchIcon] = useState(true);
  const [showMenu, setShowMenu] = useState(true);
  const [rowCount, setRowCount] = useState('30');
  const menuOnly = active === 'menu';
  const name: DataTableColumn<Employee> = {
    dataIndex: 'name',
    header: 'Name',
    searchable: true,
    showSearchIcon: !menuOnly && showSearchIcon,
    showMenu: menuOnly || showMenu,
    defaultSearchValue: active === 'default' ? 'Olivia' : undefined,
  };
  const department: DataTableColumn<Employee> = {
    dataIndex: 'department',
    header: 'Department',
    searchable: active === 'combined',
    filterable: active === 'combined',
    showMenu: active === 'combined',
  };
  const role: DataTableColumn<Employee> = { dataIndex: 'role', header: 'Role' };
  const controls = (
    <Stack gap='md'>
      <Switch
        label='Show search icon'
        checked={!menuOnly && showSearchIcon}
        disabled={menuOnly}
        onChange={(event) => setShowSearchIcon(event.currentTarget.checked)}
      />
      <Switch
        label='Show column menu'
        checked={menuOnly || showMenu}
        disabled={menuOnly}
        onChange={(event) => setShowMenu(event.currentTarget.checked)}
      />
      <Text size='sm' fw={500}>
        Rows shown
      </Text>
      <SegmentedControl
        fullWidth
        data={['10', '30']}
        value={rowCount}
        onChange={setRowCount}
      />
    </Stack>
  );

  return (
    <PlaygroundLayout
      section='searching'
      scenarios={scenarios}
      active={active}
      onSelect={setActive}
      controls={controls}
    >
      <DataTable
        key={active}
        columns={[name, department, role]}
        rows={employees.slice(0, Number(rowCount))}
        minWidth={650}
        globalSearch={active === 'global' || active === 'combined'}
        withTableBorder
        withColumnBorders
        withRowBorders
      />
    </PlaygroundLayout>
  );
}
