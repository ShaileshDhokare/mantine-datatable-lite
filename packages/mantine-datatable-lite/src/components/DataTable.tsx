import type { ReactNode } from 'react';
import { Table } from '@mantine/core';
import classes from '../styles/styles.module.css';

export interface DataTableColumn<T> {
  dataIndex: Extract<keyof T, string> | (string & {});
  header: ReactNode;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows?: T[];
}

export function DataTable<T>({ columns, rows }: DataTableProps<T>) {
  return (
    <Table className={classes.root}>
      <Table.Thead>
        <Table.Tr>
          {columns.map((column) => (
            <Table.Th key={column.dataIndex}>{column.header}</Table.Th>
          ))}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody />
    </Table>
  );
}
