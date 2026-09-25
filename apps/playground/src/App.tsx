import { useState } from 'react';
import {
  Badge,
  Button,
  Group,
  NavLink,
  NumberInput,
  Paper,
  SegmentedControl,
  Select,
  Stack,
  Switch,
  Text,
  Title,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';
import { DataTable, type DataTableColumn } from '@scope/mantine-datatable-lite';
import { employees, type Employee } from './data';
import classes from './App.module.css';

const examples = [
  {
    id: 'basic',
    label: 'Basic table',
    description: 'Rows and columns with Mantine defaults.',
  },
  {
    id: 'appearance',
    label: 'Striped and rows hover',
    description: 'Try stripes, hover, and each table border.',
  },
  {
    id: 'spacing',
    label: 'Spacing and layout',
    description: 'Adjust cell spacing and table layout.',
  },
  {
    id: 'scroll',
    label: 'Scroll container',
    description: 'Explore minimum width, maximum height, and a sticky header.',
  },
  {
    id: 'colors',
    label: 'Theme colors',
    description: 'Use Mantine colors in light and dark themes.',
  },
  {
    id: 'columns',
    label: 'Columns and rendering',
    description: 'Set column width and alignment and render custom cells.',
  },
  {
    id: 'sorting',
    label: 'Sorting',
    description: 'Click a sort icon for ascending, descending, then the original order.',
  },
  {
    id: 'sortMenu',
    label: 'Sorting menu',
    description: 'Open the menu at the right of a header to choose a sort direction.',
  },
  {
    id: 'customSort',
    label: 'Custom sorting',
    description: 'Department uses a custom comparator based on department name length.',
  },
  {
    id: 'serverSort',
    label: 'Server-owned sorting',
    description: 'The table reports sort changes; the example supplies rows in the requested order.',
  },
] as const;

type ExampleId = (typeof examples)[number]['id'];

const baseColumns: DataTableColumn<Employee>[] = [
  { dataIndex: 'id', header: 'ID', width: 70 },
  { dataIndex: 'name', header: 'Name' },
  { dataIndex: 'department', header: 'Department' },
  { dataIndex: 'role', header: 'Role' },
  { dataIndex: 'salary', header: 'Salary' },
];

const sortingColumns: DataTableColumn<Employee>[] = [
  { dataIndex: 'name', header: 'Name', type: 'string', sortable: true },
  { dataIndex: 'age', header: 'Age', type: 'number', sortable: true },
  { dataIndex: 'joinDate', header: 'Joined', type: 'date', sortable: true, render: (row) => row.joinDate.toLocaleDateString() },
  { dataIndex: 'isActive', header: 'Active', type: 'boolean', sortable: true, render: (row) => row.isActive ? 'Yes' : 'No' },
];

const menuColumns: DataTableColumn<Employee>[] = sortingColumns.map((column) => ({
  ...column,
  showMenu: true,
})).concat({ dataIndex: 'department', header: 'Department', showMenu: true, menuOptions: ['filter', 'display'] });

const customSortColumns: DataTableColumn<Employee>[] = [
  { dataIndex: 'name', header: 'Name', sortable: true },
  {
    dataIndex: 'department',
    header: 'Department',
    sortable: true,
    defaultSortOrder: 'asc',
    sortFn: (a, b) => a.department.length - b.department.length,
  },
  { dataIndex: 'salary', header: 'Salary', type: 'number', sortable: true },
];

const serverColumns: DataTableColumn<Employee>[] = [
  { dataIndex: 'name', header: 'Name' },
  { dataIndex: 'salary', header: 'Salary', type: 'number', sortable: true, showMenu: true },
];

const spacingOptions = ['Default', 'xs', 'sm', 'md', 'lg', 'xl'];
const colorOptions = [
  { value: 'var(--mantine-color-blue-light)', label: 'Blue' },
  { value: 'var(--mantine-color-teal-light)', label: 'Teal' },
  { value: 'var(--mantine-color-grape-light)', label: 'Grape' },
  { value: 'var(--mantine-color-orange-light)', label: 'Orange' },
];

export function App() {
  const [active, setActive] = useState<ExampleId>('appearance');
  const [rowCount, setRowCount] = useState('6');
  const [striped, setStriped] = useState(false);
  const [hover, setHover] = useState(false);
  const [tableBorder, setTableBorder] = useState(false);
  const [columnBorders, setColumnBorders] = useState(false);
  const [rowBorders, setRowBorders] = useState(true);
  const [horizontalSpacing, setHorizontalSpacing] = useState('Default');
  const [verticalSpacing, setVerticalSpacing] = useState('Default');
  const [layout, setLayout] = useState<'auto' | 'fixed'>('auto');
  const [minWidth, setMinWidth] = useState('800');
  const [maxHeight, setMaxHeight] = useState('260');
  const [stickyHeader, setStickyHeader] = useState(true);
  const [stripedColor, setStripedColor] = useState(
    'var(--mantine-color-blue-light)',
  );
  const [hoverColor, setHoverColor] = useState(
    'var(--mantine-color-teal-light)',
  );
  const [borderColor, setBorderColor] = useState('Default');
  const [nameWidth, setNameWidth] = useState(190);
  const [salaryAlign, setSalaryAlign] = useState<'left' | 'center' | 'right'>(
    'right',
  );
  const [serverRows, setServerRows] = useState(() => employees.slice(0, 8));
  const [sortRequest, setSortRequest] = useState('No sort request yet');
  const colorScheme = useComputedColorScheme('light');
  const { setColorScheme } = useMantineColorScheme();

  const current = examples.find((example) => example.id === active)!;
  const columns: DataTableColumn<Employee>[] =
    active === 'sorting' ? sortingColumns :
    active === 'sortMenu' ? menuColumns :
    active === 'customSort' ? customSortColumns :
    active === 'serverSort' ? serverColumns :
    active === 'columns'
      ? [
          { dataIndex: 'name', header: 'Name', width: nameWidth },
          { dataIndex: 'department', header: 'Department' },
          {
            dataIndex: 'salary',
            header: 'Salary',
            align: salaryAlign,
            render: (row) => `$${row.salary.toLocaleString()}`,
          },
          {
            dataIndex: 'isActive',
            header: 'Status',
            render: (row) => (
              <Badge color={row.isActive ? 'teal' : 'gray'} variant='light'>
                {row.isActive ? 'Active' : 'Inactive'}
              </Badge>
            ),
          },
        ]
      : baseColumns;

  const controls = (() => {
    switch (active) {
      case 'basic':
        return (
          <SegmentedControl
            fullWidth
            data={['3', '6', '10']}
            value={rowCount}
            onChange={setRowCount}
            aria-label='Number of rows'
          />
        );
      case 'appearance':
        return (
          <Stack gap='md'>
            <Switch
              label='Striped'
              checked={striped}
              onChange={(event) => setStriped(event.currentTarget.checked)}
            />
            <Switch
              label='Highlight on hover'
              checked={hover}
              onChange={(event) => setHover(event.currentTarget.checked)}
            />
            <Switch
              label='With table border'
              checked={tableBorder}
              onChange={(event) => setTableBorder(event.currentTarget.checked)}
            />
            <Switch
              label='With column borders'
              checked={columnBorders}
              onChange={(event) =>
                setColumnBorders(event.currentTarget.checked)
              }
            />
            <Switch
              label='With row borders'
              checked={rowBorders}
              onChange={(event) => setRowBorders(event.currentTarget.checked)}
            />
          </Stack>
        );
      case 'spacing':
        return (
          <Stack gap='md'>
            <Select
              label='Horizontal spacing'
              data={spacingOptions}
              value={horizontalSpacing}
              onChange={(value) => setHorizontalSpacing(value ?? 'Default')}
              allowDeselect={false}
            />
            <Select
              label='Vertical spacing'
              data={spacingOptions}
              value={verticalSpacing}
              onChange={(value) => setVerticalSpacing(value ?? 'Default')}
              allowDeselect={false}
            />
            <SegmentedControl
              data={['auto', 'fixed']}
              value={layout}
              onChange={(value) => setLayout(value as 'auto' | 'fixed')}
              aria-label='Table layout'
            />
          </Stack>
        );
      case 'scroll':
        return (
          <Stack gap='md'>
            <Select
              label='Minimum width'
              data={[
                { value: '500', label: '500px' },
                { value: '800', label: '800px' },
                { value: '50rem', label: '50rem' },
                { value: '100%', label: '100%' },
              ]}
              value={minWidth}
              onChange={(value) => setMinWidth(value ?? '800')}
              allowDeselect={false}
            />
            <Select
              label='Maximum height'
              data={[
                { value: '200', label: '200px' },
                { value: '260', label: '260px' },
                { value: '20rem', label: '20rem' },
                { value: '50vh', label: '50vh' },
              ]}
              value={maxHeight}
              onChange={(value) => setMaxHeight(value ?? '260')}
              allowDeselect={false}
            />
            <Switch
              label='Sticky header'
              checked={stickyHeader}
              onChange={(event) => setStickyHeader(event.currentTarget.checked)}
            />
          </Stack>
        );
      case 'colors':
        return (
          <Stack gap='md'>
            <Button
              variant='light'
              onClick={() =>
                setColorScheme(colorScheme === 'light' ? 'dark' : 'light')
              }
            >
              Switch to {colorScheme === 'light' ? 'dark' : 'light'} theme
            </Button>
            <Select
              label='Stripe color'
              data={colorOptions}
              value={stripedColor}
              onChange={(value) =>
                setStripedColor(value ?? 'var(--mantine-color-blue-light)')
              }
              allowDeselect={false}
            />
            <Select
              label='Hover color'
              data={colorOptions}
              value={hoverColor}
              onChange={(value) =>
                setHoverColor(value ?? 'var(--mantine-color-teal-light)')
              }
              allowDeselect={false}
            />
            <Select
              label='Border color'
              data={[
                { value: 'Default', label: 'Theme default' },
                { value: 'blue.4', label: 'Blue' },
                { value: 'teal.4', label: 'Teal' },
                { value: 'grape.4', label: 'Grape' },
              ]}
              value={borderColor}
              onChange={(value) => setBorderColor(value ?? 'Default')}
              allowDeselect={false}
            />
          </Stack>
        );
      case 'columns':
        return (
          <Stack gap='md'>
            <NumberInput
              label='Name column width (px)'
              min={100}
              max={400}
              value={nameWidth}
              onChange={(value) =>
                typeof value === 'number' && setNameWidth(value)
              }
            />
            <SegmentedControl
              data={['left', 'center', 'right']}
              value={salaryAlign}
              onChange={(value) =>
                setSalaryAlign(value as 'left' | 'center' | 'right')
              }
              aria-label='Salary alignment'
            />
            <Text size='sm' c='dimmed'>
              Salary uses a render function. Status uses a Mantine Badge.
            </Text>
          </Stack>
        );
      case 'sorting':
        return <Text size='sm' c='dimmed'>Name, Age, Joined, and Active demonstrate string, number, date, and boolean sorting.</Text>;
      case 'sortMenu':
        return <Text size='sm' c='dimmed'>Each type has a sort menu. Department has a menu without sorting; its Filter and Display entries are reserved for later phases.</Text>;
      case 'customSort':
        return <Text size='sm' c='dimmed'>The initial sort uses department name length. Equal lengths preserve their original order.</Text>;
      case 'serverSort':
        return <Text size='sm' c='dimmed'>{sortRequest}. Changes are reported after 300 ms.</Text>;
    }
  })();

  return (
    <div className={classes.shell}>
      <main className={classes.content}>
        <Text size='sm' fw={700} c='blue'>
          DATATABLE PLAYGROUND
        </Text>
        <Title order={1} mt='xs'>
          {current.label}
        </Title>
        <Text c='dimmed' mt='xs' mb='xl'>
          {current.description}
        </Text>

        <Paper withBorder radius='md' className={classes.preview}>
          <div className={classes.previewGrid}>
            <div className={classes.tablePane}>
              <DataTable
                columns={columns}
                rows={
                  active === 'serverSort' ? serverRows :
                  active === 'scroll' || active === 'sorting' || active === 'sortMenu' || active === 'customSort'
                    ? employees
                    : employees.slice(
                        0,
                        active === 'basic' ? Number(rowCount) : 5,
                      )
                }
                pagination={active === 'serverSort' ? { currentPage: 1, pageSize: 8, totalItems: employees.length } : undefined}
                onChange={active === 'serverSort' ? ({ sorter }) => {
                  setSortRequest(sorter ? `Requested salary ${sorter.sortOrder}` : 'Requested original order');
                  const ordered = sorter ? [...employees].sort((a, b) => sorter.sortOrder === 'asc' ? a.salary - b.salary : b.salary - a.salary) : employees;
                  setServerRows(ordered.slice(0, 8));
                } : undefined}
                minWidth={active === 'sorting' || active === 'sortMenu' ? 660 : active === 'scroll' ? Number(minWidth) || minWidth : undefined}
                striped={
                  active === 'appearance'
                    ? striped
                    : active === 'colors'
                      ? true
                      : undefined
                }
                highlightOnHover={
                  active === 'appearance'
                    ? hover
                    : active === 'colors'
                      ? true
                      : undefined
                }
                withTableBorder={
                  active === 'appearance'
                    ? tableBorder
                    : active === 'colors'
                      ? true
                      : undefined
                }
                withColumnBorders={
                  active === 'appearance' ? columnBorders : undefined
                }
                withRowBorders={
                  active === 'appearance' ? rowBorders : undefined
                }
                horizontalSpacing={
                  active === 'spacing' && horizontalSpacing !== 'Default'
                    ? horizontalSpacing
                    : undefined
                }
                verticalSpacing={
                  active === 'spacing' && verticalSpacing !== 'Default'
                    ? verticalSpacing
                    : undefined
                }
                layout={active === 'spacing' ? layout : undefined}
                maxHeight={
                  active === 'scroll'
                    ? Number(maxHeight) || maxHeight
                    : undefined
                }
                stickyHeader={active === 'scroll' ? stickyHeader : undefined}
                stripedColor={active === 'colors' ? stripedColor : undefined}
                highlightOnHoverColor={
                  active === 'colors' ? hoverColor : undefined
                }
                borderColor={
                  active === 'colors' && borderColor !== 'Default'
                    ? borderColor
                    : undefined
                }
              />
            </div>
            <div className={classes.controls}>
              <Text fw={600} mb='lg'>
                Props
              </Text>
              {controls}
            </div>
          </div>
        </Paper>
        <Group mt='md' gap='xs'>
          <Badge variant='light' color='gray'>
            Mantine theme
          </Badge>
          <Text size='sm' c='dimmed'>
            Changes above update the table immediately.
          </Text>
        </Group>
      </main>

      <aside className={classes.sidebar} aria-label='Example navigation'>
        <Text fw={700} mb='md'>
          Table examples
        </Text>
        <Stack gap={2} className={classes.menu}>
          {examples.map((example) => (
            <NavLink
              key={example.id}
              label={example.label}
              active={active === example.id}
              onClick={() => setActive(example.id)}
              variant='light'
            />
          ))}
        </Stack>
      </aside>
    </div>
  );
}
