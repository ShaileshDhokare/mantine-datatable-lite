import { Table } from '@mantine/core';
import { useMemo, useRef } from 'react';
import { DataTableContext } from '../context/DataTableContext';
import { useTableState } from '../hooks/useTableState';
import classes from '../styles/styles.module.css';
import type { DataTableProps } from '../types';
import { sortRows } from '../utils/sortRows';
import { ColumnHeader } from './DataTable/ColumnHeader';

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
  debounceTime,
}: DataTableProps<T>) {
  const tableState = useTableState({ columns, onChange, pagination, debounceTime });
  const rowKeys = useRef(new WeakMap<object, number>());
  const nextRowKey = useRef(0);
  const visibleRows = useMemo(
    () => pagination ? rows : sortRows(rows, columns, tableState.sorter),
    [rows, columns, tableState.sorter, pagination],
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
          {columns.map((column) => <ColumnHeader key={column.dataIndex} column={column} />)}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {visibleRows.map((row, index) => (
          <Table.Tr key={getRowKey(row, index)}>
            {columns.map((column) => {
              const value = (row as Record<string, unknown>)[column.dataIndex];
              return (
                <Table.Td key={column.dataIndex} ta={column.align}>
                  {column.render
                    ? column.render(row, index)
                    : value == null
                      ? null
                      : String(value)}
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
      {minWidth != null || maxHeight != null ? (
        <Table.ScrollContainer minWidth={minWidth ?? 0} maxHeight={maxHeight}>
          {table}
        </Table.ScrollContainer>
      ) : table}
    </DataTableContext.Provider>
  );
}
