import { ActionIcon, Checkbox, Highlight, Table } from '@mantine/core';
import type {
  ComponentProps,
  CSSProperties,
  MouseEvent,
  ReactNode,
} from 'react';
import { useDataTableConfig } from '../../context/DataTableConfigContext';
import { Icon } from '../../icons/Icon';
import classes from '../../styles/styles.module.css';
import type { DataTableColumn, RowId } from '../../types';
import { columnValue } from '../../utils/columnValue';

export type CellColumn<T> = {
  column: DataTableColumn<T>;
  /** Search terms to highlight in default cells. */
  terms: string[];
  pinProps: ComponentProps<typeof Table.Td>;
};

export function TableRow<T>({
  row,
  index,
  id,
  cellColumns,
  colSpan,
  rowProps,
  onRowClick,
  selection,
  expansion,
}: {
  row: T;
  index: number;
  id: RowId | undefined;
  cellColumns: CellColumn<T>[];
  colSpan: number;
  rowProps?: (row: T, index: number) => ComponentProps<'tr'>;
  onRowClick?: (
    row: T,
    index: number,
    event: MouseEvent<HTMLTableRowElement>,
  ) => void;
  selection?: {
    selected: boolean;
    selectable: boolean;
    toggle: () => void;
  };
  expansion?: {
    expanded: boolean;
    offset: number;
    panelId: string | undefined;
    onRowClick: boolean;
    toggle: () => void;
    render: () => ReactNode;
  };
}) {
  const { labels } = useDataTableConfig();
  const supplied = rowProps?.(row, index) ?? {};
  const rowName = id === undefined ? `${index + 1} (invalid ID)` : String(id);
  const clickable = Boolean(onRowClick || expansion?.onRowClick);

  return (
    <>
      <Table.Tr
        tabIndex={clickable ? 0 : undefined}
        {...supplied}
        data-selected={selection?.selected || undefined}
        onClick={(event) => {
          supplied.onClick?.(event);
          if (event.defaultPrevented) return;
          if (window.getSelection?.()?.toString()) return;
          if (expansion?.onRowClick && id !== undefined) expansion.toggle();
          onRowClick?.(row, index, event);
        }}
        onKeyDown={(event) => {
          supplied.onKeyDown?.(event);
          if (
            clickable &&
            !event.defaultPrevented &&
            event.target === event.currentTarget &&
            (event.key === 'Enter' || event.key === ' ')
          ) {
            event.preventDefault();
            event.currentTarget.click();
          }
        }}
      >
        {selection && (
          <Table.Td
            className={classes.controlCell}
            style={{ '--dt-pin-offset': '0px' } as CSSProperties}
          >
            <Checkbox
              size='sm'
              aria-label={`${labels.selectRow} ${rowName}`}
              checked={selection.selected}
              disabled={!selection.selectable}
              onClick={(event) => event.stopPropagation()}
              onChange={() => {
                if (id !== undefined) selection.toggle();
              }}
            />
          </Table.Td>
        )}
        {expansion && (
          <Table.Td
            className={classes.controlCell}
            style={
              { '--dt-pin-offset': `${expansion.offset}px` } as CSSProperties
            }
          >
            <ActionIcon
              variant='transparent'
              size='sm'
              aria-label={`${expansion.expanded ? labels.collapseRow : labels.expandRow} ${rowName}`}
              disabled={id === undefined}
              aria-expanded={expansion.expanded}
              aria-controls={expansion.panelId}
              onClick={(event) => {
                event.stopPropagation();
                if (id !== undefined) expansion.toggle();
              }}
              color='var(--mantine-color-dimmed)'
            >
              <Icon
                name={expansion.expanded ? 'collapse' : 'expand'}
                strokeWidth={1.25}
                size={18}
              />
            </ActionIcon>
          </Table.Td>
        )}
        {cellColumns.map(({ column, terms, pinProps }) => {
          const value = column.render ? undefined : columnValue(column, row);
          return (
            <Table.Td
              key={column.dataIndex}
              ta={column.align}
              {...pinProps}
              onClick={
                column.stopRowClick
                  ? (event) => event.stopPropagation()
                  : undefined
              }
            >
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
      {expansion?.expanded && (
        <Table.Tr id={expansion.panelId} className={classes.expandPanel}>
          <Table.Td colSpan={colSpan}>{expansion.render()}</Table.Td>
        </Table.Tr>
      )}
    </>
  );
}
