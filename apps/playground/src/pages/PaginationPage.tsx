import { useState } from 'react';
import { Stack, Switch, Text } from '@mantine/core';
import { DataTable, type DataTableColumn, type Pagination } from 'mantine-datatable-lite';
import { useScenario } from '../useScenario';
import { PlaygroundLayout } from '../components/PlaygroundLayout';
import { employees, type Employee } from '../data';

const scenarios = [
  { id: 'default', label: 'Default sizes', description: 'Navigate pages and choose 10, 20, 50, or 100 rows per page.' },
  { id: 'custom', label: 'Custom sizes', description: 'Use a supplied list of page sizes, including the current size.' },
  { id: 'fixed', label: 'Fixed size', description: 'Navigate pages without a size selector.' },
  { id: 'clamp', label: 'Shrinking total', description: 'Reduce the record count while on the last page to see clamping.' },
  { id: 'empty', label: 'No records', description: 'Keep the footer visible with disabled page controls.' },
] as const;
type PaginationScenario = (typeof scenarios)[number]['id'];

const columns: DataTableColumn<Employee>[] = [
  { dataIndex: 'name', header: 'Name' },
  { dataIndex: 'department', header: 'Department' },
  { dataIndex: 'role', header: 'Role' },
];

function initialPage(scenario: PaginationScenario) {
  return { currentPage: scenario === 'clamp' ? 3 : 1, pageSize: scenario === 'custom' ? 8 : 10 };
}

export function PaginationPage() {
  const [active, setActive] = useScenario(scenarios);
  const [page, setPage] = useState(initialPage(active));
  const [shrink, setShrink] = useState(false);
  const source = active === 'empty' ? [] : employees.slice(0, active === 'clamp' && shrink ? 12 : 30);
  const pagination: Pagination = {
    ...page,
    totalItems: source.length,
    pageSizeOptions: active === 'fixed' ? false : active === 'custom' ? [8, 12, 25] : undefined,
  };
  const rows = source.slice((page.currentPage - 1) * page.pageSize, page.currentPage * page.pageSize);

  return (
    <PlaygroundLayout section='pagination' scenarios={scenarios} active={active}
      onSelect={(scenario) => { setActive(scenario); setPage(initialPage(scenario)); setShrink(false); }}
      controls={<Stack gap='md'>
        <Text size='sm' c='dimmed'>Page {page.currentPage}, {page.pageSize} rows per page</Text>
        {active === 'clamp' && <Switch label='Reduce to 12 records' checked={shrink}
          onChange={(event) => setShrink(event.currentTarget.checked)} />}
      </Stack>}>
      <DataTable key={active} columns={columns} rows={rows} pagination={pagination}
        onChange={({ pagination: next }) => {
          if (next) setPage({ currentPage: next.currentPage, pageSize: next.pageSize });
        }}
        minWidth={600} withTableBorder withRowBorders />
    </PlaygroundLayout>
  );
}
