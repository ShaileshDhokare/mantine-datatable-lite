import { Highlight, Stack, Table, Text } from '@mantine/core';
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
import { GlobalSearch } from './GlobalSearch';

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
  debounceTime,
  emptyState,
}: DataTableProps<T>) {
  const tableState = useTableState({
    columns,
    onChange,
    pagination,
    debounceTime,
  });
  const rowKeys = useRef(new WeakMap<object, number>());
  const nextRowKey = useRef(0);
  const filteredRows = useMemo(
    () => (pagination ? rows : filterRows(rows, columns, tableState.filters)),
    [rows, columns, tableState.filters, pagination],
  );
  const searchedRows = useMemo(
    () => pagination ? filteredRows : searchRows(filteredRows, columns, tableState.columnSearch, tableState.searchQuery),
    [filteredRows, columns, tableState.columnSearch, tableState.searchQuery, pagination],
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
          {columns.map((column) => (
            <ColumnHeader
              key={column.dataIndex}
              column={column}
              rows={rows}
              serverMode={Boolean(pagination)}
            />
          ))}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {visibleRows.length === 0 && (
          <Table.Tr>
            <Table.Td colSpan={Math.max(columns.length, 1)} ta='center' py='xl'>
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
            {columns.map((column) => {
              const value = (row as Record<string, unknown>)[column.dataIndex];
              const terms = [column.searchable !== false ? tableState.searchQuery : '',
                tableState.columnSearch.find((item) => item.searchField === column.dataIndex)?.searchValue].filter((term): term is string => Boolean(term));
              return (
                <Table.Td key={column.dataIndex} ta={column.align}>
                  {column.render
                    ? column.render(row, index)
                    : value == null
                      ? null
                      : terms.length ? <Highlight highlight={terms}>{String(value)}</Highlight> : String(value)}
                </Table.Td>
              );
            })}
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );

  return (
    <DataTableContext.Provider value={tableState}>
      {globalSearch && <GlobalSearch debounceTime={debounceTime} />}
      {minWidth != null || maxHeight != null ? (
        <Table.ScrollContainer minWidth={minWidth ?? 0} maxHeight={maxHeight}>
          {table}
        </Table.ScrollContainer>
      ) : (
        table
      )}
    </DataTableContext.Provider>
  );
}
