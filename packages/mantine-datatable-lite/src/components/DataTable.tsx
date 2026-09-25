import { Table } from '@mantine/core';
import type { DataTableProps } from '../types';
import classes from '../styles/styles.module.css';

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
}: DataTableProps<T>) {
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
            <Table.Th key={column.dataIndex} w={column.width} ta={column.align}>
              {column.header}
            </Table.Th>
          ))}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {rows.map((row, index) => (
          <Table.Tr key={index}>
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

  return minWidth != null || maxHeight != null ? (
    <Table.ScrollContainer minWidth={minWidth ?? 0} maxHeight={maxHeight}>
      {table}
    </Table.ScrollContainer>
  ) : (
    table
  );
}
