import { Alert, Box, Button, Group, Highlight, LoadingOverlay, Stack, Table, Text } from '@mantine/core';
import { useMemo, useRef } from 'react';
import { DataTableContext } from '../context/DataTableContext';
import { useTableState } from '../hooks/useTableState';
import { Icon } from '../icons/Icon';
import classes from '../styles/styles.module.css';
import type { DataTableProps } from '../types';
import { filterRows } from '../utils/filter/predicates';
import { sortRows } from '../utils/sort/sortRows';
import { searchRows } from '../utils/search/searchRows';
import { ColumnHeader } from './header/ColumnHeader';
import { TableToolbar } from './toolbar/TableToolbar';
import { TablePagination } from './footer/TablePagination';

export function DataTable<T>({
  columns,
  rows,
  borderColor,
  withTableBorder,
  withColumnBorders,
  withRowBorders,
  horizontalSpacing,
  verticalSpacing,
  striped,
  stripedColor,
  highlightOnHover,
  highlightOnHoverColor,
  stickyHeader,
  minWidth,
  maxHeight,
  layout,
  onChange,
  pagination,
  globalSearch,
  columnSelector,
  showTableStatePills,
  showReset,
  maxChips,
  debounceTime,
  emptyState,
  loading,
  loaderProps,
  error,
  onRetry,
}: DataTableProps<T>) {
  const tableState = useTableState({
    columns,
    onChange,
    pagination,
    debounceTime,
  });
  const rowKeys = useRef(new WeakMap<object, number>());
  const nextRowKey = useRef(0);
  const visibleColumns = columns.filter((column) => !tableState.hiddenColumns.includes(column.dataIndex));
  const filteredRows = useMemo(
    () => (pagination ? rows : filterRows(rows, columns, tableState.filters)),
    [rows, columns, tableState.filters, pagination],
  );
  const searchedRows = useMemo(
    () =>
      pagination
        ? filteredRows
        : searchRows(
            filteredRows,
            columns,
            tableState.columnSearch,
            tableState.searchQuery,
          ),
    [
      filteredRows,
      columns,
      tableState.columnSearch,
      tableState.searchQuery,
      pagination,
    ],
  );
  const visibleRows = useMemo(
    () =>
      pagination
        ? searchedRows
        : sortRows(searchedRows, columns, tableState.sorter),
    [searchedRows, columns, tableState.sorter, pagination],
  );

  function getRowKey(row: T, index: number) {
    if (typeof row !== 'object' || row === null) return index;
    let key = rowKeys.current.get(row);
    if (key === undefined) {
      key = nextRowKey.current++;
      rowKeys.current.set(row, key);
    }
    return key;
  }

  const table = (
    <Table
      className={classes.root}
      borderColor={borderColor}
      withTableBorder={withTableBorder}
      withColumnBorders={withColumnBorders}
      withRowBorders={withRowBorders}
      horizontalSpacing={horizontalSpacing}
      verticalSpacing={verticalSpacing}
      striped={striped}
      stripedColor={stripedColor}
      highlightOnHover={highlightOnHover}
      highlightOnHoverColor={highlightOnHoverColor}
      stickyHeader={stickyHeader}
      layout={layout}
    >
      <Table.Thead>
        <Table.Tr>
          {visibleColumns.map((column) => (
            <ColumnHeader
              key={column.dataIndex}
              column={column}
              rows={rows}
              serverMode={Boolean(pagination)}
              canHide={visibleColumns.length > 1 && Boolean(columnSelector || showTableStatePills || showReset)}
            />
          ))}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {visibleRows.length === 0 && (
          <Table.Tr>
            <Table.Td colSpan={Math.max(visibleColumns.length, 1)} ta='center' py='xl'>
              {emptyState ?? (
                <Stack align='center' gap='xs' py='md'>
                  <Icon
                    name='empty'
                    strokeWidth={1}
                    size={36}
                    color='var(--mantine-color-dimmed)'
                    aria-hidden='true'
                  />
                  <Text size='sm' c='dimmed'>
                    No records found
                  </Text>
                </Stack>
              )}
            </Table.Td>
          </Table.Tr>
        )}
        {visibleRows.map((row, index) => (
          <Table.Tr key={getRowKey(row, index)}>
            {visibleColumns.map((column) => {
              const value = (row as Record<string, unknown>)[column.dataIndex];
              const terms = [
                column.searchable !== false ? tableState.searchQuery : '',
                tableState.columnSearch.find(
                  (item) => item.searchField === column.dataIndex,
                )?.searchValue,
              ].filter((term): term is string => Boolean(term));
              return (
                <Table.Td key={column.dataIndex} ta={column.align}>
                  {column.render ? (
                    column.render(row, index)
                  ) : value == null ? null : terms.length ? (
                    <Highlight highlight={terms}>{String(value)}</Highlight>
                  ) : (
                    String(value)
                  )}
                </Table.Td>
              );
            })}
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );

  const tableContent = minWidth != null || maxHeight != null ? (
    <Table.ScrollContainer minWidth={minWidth ?? 0} maxHeight={maxHeight}>
      {table}
    </Table.ScrollContainer>
  ) : table;

  return (
    <DataTableContext.Provider value={tableState}>
      {(globalSearch || columnSelector || showTableStatePills || showReset) &&
        <TableToolbar columns={columns} globalSearch={globalSearch} columnSelector={columnSelector}
          showTableStatePills={showTableStatePills} showReset={showReset}
          debounceTime={debounceTime} maxChips={maxChips} />}
      {loading ? <Box pos='relative' aria-busy='true'>
        <LoadingOverlay visible zIndex={1000}
          overlayProps={{ radius: 'sm', blur: 2 }}
          loaderProps={{ type: 'bars', size: 'sm', ...loaderProps }} />
        {tableContent}
      </Box> : tableContent}
      {error && <Alert color='red' role='alert' mt='xs'>
        <Group justify='space-between' gap='sm'>
          <Text size='sm'>{error}</Text>
          {onRetry && <Button size='xs' variant='light' color='red' onClick={onRetry}>Retry</Button>}
        </Group>
      </Alert>}
      {pagination && (
        <TablePagination
          pagination={pagination}
          onChange={tableState.setPagination}
        />
      )}
    </DataTableContext.Provider>
  );
}
