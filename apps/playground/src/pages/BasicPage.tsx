import { useState } from 'react';
import { Badge, Button, NumberInput, SegmentedControl, Select, Stack, Switch, Text, useComputedColorScheme, useMantineColorScheme } from '@mantine/core';
import { DataTable, type DataTableColumn } from '@scope/mantine-datatable-lite';
import { PlaygroundLayout } from '../components/PlaygroundLayout';
import { employees, type Employee } from '../data';

const scenarios = [
  { id: 'basic', label: 'Basic table', description: 'Rows and columns with Mantine defaults.' },
  { id: 'appearance', label: 'Striped and rows hover', description: 'Try stripes, hover, and each table border.' },
  { id: 'spacing', label: 'Spacing and layout', description: 'Adjust cell spacing and table layout.' },
  { id: 'scroll', label: 'Scroll container', description: 'Explore minimum width, maximum height, and a sticky header.' },
  { id: 'colors', label: 'Theme colors', description: 'Use Mantine colors in light and dark themes.' },
  { id: 'columns', label: 'Columns and rendering', description: 'Set column width and alignment and render custom cells.' },
] as const;
type BasicScenario = (typeof scenarios)[number]['id'];

const baseColumns: DataTableColumn<Employee>[] = [
  { dataIndex: 'id', header: 'ID', width: 70 },
  { dataIndex: 'name', header: 'Name' },
  { dataIndex: 'department', header: 'Department' },
  { dataIndex: 'role', header: 'Role' },
  { dataIndex: 'salary', header: 'Salary' },
];
const spacingOptions = ['Default', 'xs', 'sm', 'md', 'lg', 'xl'];
const colorOptions = [
  { value: 'var(--mantine-color-blue-light)', label: 'Blue' },
  { value: 'var(--mantine-color-teal-light)', label: 'Teal' },
  { value: 'var(--mantine-color-grape-light)', label: 'Grape' },
  { value: 'var(--mantine-color-orange-light)', label: 'Orange' },
];

export function BasicPage() {
  const [active, setActive] = useState<BasicScenario>('basic');
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
  const [stripedColor, setStripedColor] = useState('var(--mantine-color-blue-light)');
  const [hoverColor, setHoverColor] = useState('var(--mantine-color-teal-light)');
  const [borderColor, setBorderColor] = useState('Default');
  const [nameWidth, setNameWidth] = useState(190);
  const [salaryAlign, setSalaryAlign] = useState<'left' | 'center' | 'right'>('right');
  const colorScheme = useComputedColorScheme('light');
  const { setColorScheme } = useMantineColorScheme();

  const columns: DataTableColumn<Employee>[] = active === 'columns' ? [
    { dataIndex: 'name', header: 'Name', width: nameWidth },
    { dataIndex: 'department', header: 'Department' },
    { dataIndex: 'salary', header: 'Salary', align: salaryAlign, render: (row) => `$${row.salary.toLocaleString()}` },
    { dataIndex: 'isActive', header: 'Status', render: (row) => (
      <Badge color={row.isActive ? 'teal' : 'gray'} variant='light'>{row.isActive ? 'Active' : 'Inactive'}</Badge>
    ) },
  ] : baseColumns;

  const controls = (() => {
    switch (active) {
      case 'basic': return <SegmentedControl fullWidth data={['3', '6', '10']} value={rowCount}
        onChange={setRowCount} aria-label='Number of rows' />;
      case 'appearance': return <Stack gap='md'>
        <Switch label='Striped' checked={striped} onChange={(event) => setStriped(event.currentTarget.checked)} />
        <Switch label='Highlight on hover' checked={hover} onChange={(event) => setHover(event.currentTarget.checked)} />
        <Switch label='With table border' checked={tableBorder} onChange={(event) => setTableBorder(event.currentTarget.checked)} />
        <Switch label='With column borders' checked={columnBorders} onChange={(event) => setColumnBorders(event.currentTarget.checked)} />
        <Switch label='With row borders' checked={rowBorders} onChange={(event) => setRowBorders(event.currentTarget.checked)} />
      </Stack>;
      case 'spacing': return <Stack gap='md'>
        <Select label='Horizontal spacing' data={spacingOptions} value={horizontalSpacing}
          onChange={(value) => setHorizontalSpacing(value ?? 'Default')} allowDeselect={false} />
        <Select label='Vertical spacing' data={spacingOptions} value={verticalSpacing}
          onChange={(value) => setVerticalSpacing(value ?? 'Default')} allowDeselect={false} />
        <SegmentedControl data={['auto', 'fixed']} value={layout}
          onChange={(value) => setLayout(value as 'auto' | 'fixed')} aria-label='Table layout' />
      </Stack>;
      case 'scroll': return <Stack gap='md'>
        <Select label='Minimum width' data={[{ value: '500', label: '500px' }, { value: '800', label: '800px' },
          { value: '50rem', label: '50rem' }, { value: '100%', label: '100%' }]}
          value={minWidth} onChange={(value) => setMinWidth(value ?? '800')} allowDeselect={false} />
        <Select label='Maximum height' data={[{ value: '200', label: '200px' }, { value: '260', label: '260px' },
          { value: '20rem', label: '20rem' }, { value: '50vh', label: '50vh' }]}
          value={maxHeight} onChange={(value) => setMaxHeight(value ?? '260')} allowDeselect={false} />
        <Switch label='Sticky header' checked={stickyHeader} onChange={(event) => setStickyHeader(event.currentTarget.checked)} />
      </Stack>;
      case 'colors': return <Stack gap='md'>
        <Button variant='light' onClick={() => setColorScheme(colorScheme === 'light' ? 'dark' : 'light')}>
          Switch to {colorScheme === 'light' ? 'dark' : 'light'} theme
        </Button>
        <Select label='Stripe color' data={colorOptions} value={stripedColor}
          onChange={(value) => setStripedColor(value ?? colorOptions[0].value)} allowDeselect={false} />
        <Select label='Hover color' data={colorOptions} value={hoverColor}
          onChange={(value) => setHoverColor(value ?? colorOptions[1].value)} allowDeselect={false} />
        <Select label='Border color' data={[
          { value: 'Default', label: 'Theme default' }, { value: 'blue.4', label: 'Blue' },
          { value: 'teal.4', label: 'Teal' }, { value: 'grape.4', label: 'Grape' },
        ]} value={borderColor} onChange={(value) => setBorderColor(value ?? 'Default')} allowDeselect={false} />
      </Stack>;
      case 'columns': return <Stack gap='md'>
        <NumberInput label='Name column width (px)' min={100} max={400} value={nameWidth}
          onChange={(value) => typeof value === 'number' && setNameWidth(value)} />
        <SegmentedControl data={['left', 'center', 'right']} value={salaryAlign}
          onChange={(value) => setSalaryAlign(value as 'left' | 'center' | 'right')}
          aria-label='Salary alignment' />
        <Text size='sm' c='dimmed'>Salary uses a render function. Status uses a Mantine Badge.</Text>
      </Stack>;
    }
  })();

  const rows = active === 'scroll' ? employees : employees.slice(0, active === 'basic' ? Number(rowCount) : 5);
  return <PlaygroundLayout section='basic' scenarios={scenarios} active={active} onSelect={setActive} controls={controls}>
    <DataTable key={active} columns={columns} rows={rows}
      minWidth={active === 'scroll' ? Number(minWidth) || minWidth : undefined}
      maxHeight={active === 'scroll' ? Number(maxHeight) || maxHeight : undefined}
      stickyHeader={active === 'scroll' ? stickyHeader : undefined}
      striped={active === 'appearance' ? striped : active === 'colors' ? true : undefined}
      highlightOnHover={active === 'appearance' ? hover : active === 'colors' ? true : undefined}
      withTableBorder={active === 'appearance' ? tableBorder : active === 'colors' ? true : undefined}
      withColumnBorders={active === 'appearance' ? columnBorders : undefined}
      withRowBorders={active === 'appearance' ? rowBorders : undefined}
      horizontalSpacing={active === 'spacing' && horizontalSpacing !== 'Default' ? horizontalSpacing : undefined}
      verticalSpacing={active === 'spacing' && verticalSpacing !== 'Default' ? verticalSpacing : undefined}
      layout={active === 'spacing' ? layout : undefined}
      stripedColor={active === 'colors' ? stripedColor : undefined}
      highlightOnHoverColor={active === 'colors' ? hoverColor : undefined}
      borderColor={active === 'colors' && borderColor !== 'Default' ? borderColor : undefined}
    />
  </PlaygroundLayout>;
}
