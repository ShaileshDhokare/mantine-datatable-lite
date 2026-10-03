import {
  ActionIcon,
  Alert,
  Box,
  Button,
  Checkbox,
  Group,
  Highlight,
  LoadingOverlay,
  Paper,
  Stack,
  Table,
  Text,
  Tooltip,
  Transition,
} from '@mantine/core';
import {
  Fragment,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { DataTableContext } from '../context/DataTableContext';
import { useTableState } from '../hooks/useTableState';
import { Icon } from '../icons/Icon';
import classes from '../styles/styles.module.css';
import type { DataTableProps, RowId, SelectionSnapshot } from '../types';
import { useColumnLayout } from '../hooks/useColumnLayout';
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
  toolbar,
  toolbarActions,
  maxChips,
  debounceTime,
  emptyState,
  loading,
  loaderProps,
  error,
  onRetry,
  idAccessor,
  selection,
  expandable,
  expandedRowRender,
  onRowClick,
  rowProps,
}: DataTableProps<T>) {
  const tableState = useTableState({
    columns,
    onChange,
    pagination,
    debounceTime,
  });
  const rowKeys = useRef(new WeakMap<object, number>());
  const nextRowKey = useRef(0);
  const {
    tableRef,
    ordered: visibleColumns,
    offsets,
    left,
    right,
  } = useColumnLayout(columns, tableState.hiddenColumns, tableState.pinned);
  const expandConfig =
    typeof expandable === 'object'
      ? expandable
      : expandable && expandedRowRender
        ? { render: expandedRowRender }
        : undefined;
  const [localExpanded, setLocalExpanded] = useState<RowId[]>([]);
  const expandedIds = expandConfig?.expandedIds ?? localExpanded;
  const panelPrefix = useId().replace(/:/g, '');
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

  function getRowId(row: T, index: number): RowId {
    const id =
      typeof idAccessor === 'function'
        ? idAccessor(row)
        : (row as Record<string, unknown>)[String(idAccessor ?? 'id')];
    return typeof id === 'number' || typeof id === 'string'
      ? id
      : getRowKey(row, index);
  }

  function toggleExpanded(id: RowId) {
    const next = expandedIds.includes(id)
      ? expandedIds.filter((item) => item !== id)
      : expandConfig?.allowMultiple
        ? [...expandedIds, id]
        : [id];
    if (expandConfig?.expandedIds === undefined) setLocalExpanded(next);
    expandConfig?.onChange?.(next);
  }

  const selectedIds = selection?.selectedIds ?? [];
  const selectedSet = new Set(selectedIds);
  const selectableRows = selection
    ? visibleRows.filter((row) => selection.isSelectable?.(row) ?? true)
    : [];
  const selectedOnPage = selectableRows.filter((row, index) =>
    selectedSet.has(getRowId(row, index)),
  );
  const allPageSelected =
    selectableRows.length > 0 &&
    selectedOnPage.length === selectableRows.length;
  const query = {
    filters: tableState.filters,
    columnSearch: tableState.columnSearch,
    search: tableState.searchQuery,
  };
  function snapshot(ids: RowId[]): SelectionSnapshot<T> {
    const set = new Set(ids);
    return {
      kind: 'include',
      ids,
      loadedRows: visibleRows.filter((row, index) =>
        set.has(getRowId(row, index)),
      ),
      count: ids.length,
      query,
    };
  }
  function changeSelection(ids: RowId[]) {
    selection?.onChange(snapshot(ids));
  }
  const querySignature = JSON.stringify(query);
  const previousQuery = useRef(querySignature);
  useEffect(() => {
    if (previousQuery.current !== querySignature) {
      previousQuery.current = querySignature;
      if (selectedIds.length) changeSelection([]);
    }
  }, [querySignature]);

  const extraColumns =
    Number(Boolean(selection)) + Number(Boolean(expandConfig));
  const colSpan = Math.max(visibleColumns.length + extraColumns, 1);

  function pinProps(field: string) {
    const pin = offsets[field];
    return pin
      ? {
          'data-pinned': pin.side,
          'data-pin-edge':
            pin.side === 'left' && left[left.length - 1] === field
              ? 'left'
              : pin.side === 'right' && right[0] === field
                ? 'right'
                : undefined,
          className: classes.cell,
          style: {
            '--dt-pin-offset': `${pin.side === 'left' ? pin.offset + extraColumns * 48 : pin.offset}px`,
          } as CSSProperties,
        }
      : {};
  }

  const table = (
    <Table
      ref={tableRef}
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
          {selection && (
            <Table.Th
              w={48}
              className={classes.controlCell}
              style={{ '--dt-pin-offset': '0px' } as CSSProperties}
            >
              <Checkbox
                aria-label='Select all rows on this page'
                size='sm'
                checked={allPageSelected}
                indeterminate={!allPageSelected && selectedOnPage.length > 0}
                disabled={!selectableRows.length}
                onChange={() => {
                  const pageIds = selectableRows.map((row, index) =>
                    getRowId(row, index),
                  );
                  changeSelection(
                    allPageSelected
                      ? selectedIds.filter((id) => !pageIds.includes(id))
                      : [...new Set([...selectedIds, ...pageIds])],
                  );
                }}
              />
            </Table.Th>
          )}
          {expandConfig && (
            <Table.Th
              w={48}
              className={classes.controlCell}
              style={
                {
                  '--dt-pin-offset': selection ? '48px' : '0px',
                } as CSSProperties
              }
              aria-label='Expand rows'
            />
          )}
          {visibleColumns.map((column) => (
            <ColumnHeader
              key={column.dataIndex}
              column={column}
              rows={rows}
              serverMode={Boolean(pagination)}
              canHide={
                visibleColumns.length > 1 &&
                Boolean(columnSelector || showTableStatePills || showReset)
              }
              pin={
                offsets[column.dataIndex]
                  ? {
                      ...offsets[column.dataIndex],
                      offset:
                        offsets[column.dataIndex].offset +
                        (offsets[column.dataIndex].side === 'left'
                          ? extraColumns * 48
                          : 0),
                    }
                  : undefined
              }
              stickyHeader={stickyHeader}
            />
          ))}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {visibleRows.length === 0 && (
          <Table.Tr>
            <Table.Td colSpan={colSpan} ta='center' py='xl'>
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
        {visibleRows.map((row, index) => {
          const id = getRowId(row, index);
          const expanded = expandedIds.includes(id);
          const panelId = `${panelPrefix}-panel-${String(id).replace(/[^a-zA-Z0-9_-]/g, '-')}`;
          const selectable = selection?.isSelectable?.(row) ?? true;
          const suppliedProps = rowProps?.(row, index) ?? {};
          return (
            <Fragment key={id}>
              <Table.Tr
                {...suppliedProps}
                data-selected={selectedSet.has(id) || undefined}
                onClick={(event) => {
                  suppliedProps.onClick?.(event);
                  if (event.defaultPrevented) return;
                  if (!window.getSelection?.()?.toString()) {
                    if (expandConfig?.trigger === 'row') toggleExpanded(id);
                    onRowClick?.(row, index, event);
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
                      aria-label={`Select row ${String(id)}`}
                      checked={selectedSet.has(id)}
                      disabled={!selectable}
                      onClick={(event) => event.stopPropagation()}
                      onChange={() =>
                        changeSelection(
                          selectedSet.has(id)
                            ? selectedIds.filter((item) => item !== id)
                            : [...selectedIds, id],
                        )
                      }
                    />
                  </Table.Td>
                )}
                {expandConfig && (
                  <Table.Td
                    className={classes.controlCell}
                    style={
                      {
                        '--dt-pin-offset': selection ? '48px' : '0px',
                      } as CSSProperties
                    }
                  >
                    <ActionIcon
                      variant='transparent'
                      size='sm'
                      aria-label={`${expanded ? 'Collapse' : 'Expand'} row ${String(id)}`}
                      aria-expanded={expanded}
                      aria-controls={panelId}
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleExpanded(id);
                      }}
                      color='var(--mantine-color-gray-6)'
                    >
                      <Icon
                        name={expanded ? 'collapse' : 'expand'}
                        strokeWidth={1.25}
                        size={18}
                      />
                    </ActionIcon>
                  </Table.Td>
                )}
                {visibleColumns.map((column) => {
                  const value = (row as Record<string, unknown>)[
                    column.dataIndex
                  ];
                  const terms = [
                    column.searchable !== false ? tableState.searchQuery : '',
                    tableState.columnSearch.find(
                      (item) => item.searchField === column.dataIndex,
                    )?.searchValue,
                  ].filter((term): term is string => Boolean(term));
                  return (
                    <Table.Td
                      key={column.dataIndex}
                      ta={column.align}
                      {...pinProps(column.dataIndex)}
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
              {expandConfig && expanded && (
                <Table.Tr id={panelId} className={classes.expandPanel}>
                  <Table.Td colSpan={colSpan}>
                    {expandConfig.render(row, index)}
                  </Table.Td>
                </Table.Tr>
              )}
            </Fragment>
          );
        })}
      </Table.Tbody>
    </Table>
  );

  const tableContent =
    minWidth != null || maxHeight != null ? (
      <Table.ScrollContainer minWidth={minWidth ?? 0} maxHeight={maxHeight}>
        {table}
      </Table.ScrollContainer>
    ) : (
      table
    );
  const showStandardToolbar = Boolean(
    globalSearch || columnSelector || showTableStatePills || showReset,
  );
  const showBulkToolbar = Boolean(
    toolbar && selection && selectedIds.length > 1,
  );

  return (
    <DataTableContext.Provider value={tableState}>
      {(showStandardToolbar || showBulkToolbar) && (
        <Box pos='relative'>
          {showStandardToolbar && (
            <TableToolbar
              columns={columns}
              globalSearch={globalSearch}
              columnSelector={columnSelector}
              showTableStatePills={showTableStatePills}
              showReset={showReset}
              debounceTime={debounceTime}
              maxChips={maxChips}
            />
          )}
          <Transition
            mounted={showBulkToolbar}
            transition='fade'
            duration={100}
          >
            {(styles) => (
              <Paper
                shadow='xs'
                className={showStandardToolbar ? classes.bulkBar : undefined}
                style={styles}
              >
                <Group
                  justify='space-between'
                  align='center'
                  gap='lg'
                  p={4}
                  wrap='nowrap'
                >
                  {selection?.showSelectionCount !== false && (
                    <Text fw={600} size='sm' ml='xs'>
                      {selectedIds.length} rows selected
                    </Text>
                  )}
                  <Group gap='xs' wrap='nowrap'>
                    {toolbarActions?.map((action, index) => (
                      <Fragment key={index}>{action}</Fragment>
                    ))}
                    {selection?.renderBulkActions?.({
                      ...snapshot(selectedIds),
                      clear: () => changeSelection([]),
                    })}
                    <Tooltip label='Clear selection'>
                      <ActionIcon
                        variant='transparent'
                        size='lg'
                        aria-label='Clear selection'
                        onClick={() => changeSelection([])}
                      >
                        <Icon name='clear' size={20} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Group>
              </Paper>
            )}
          </Transition>
        </Box>
      )}
      {loading ? (
        <Box pos='relative' aria-busy='true'>
          <LoadingOverlay
            visible
            zIndex={1000}
            overlayProps={{ radius: 'sm', blur: 2 }}
            loaderProps={{ type: 'bars', size: 'sm', ...loaderProps }}
          />
          {tableContent}
        </Box>
      ) : (
        tableContent
      )}
      {error && (
        <Alert color='red' role='alert' mt='xs'>
          <Group justify='space-between' gap='sm'>
            <Text size='sm'>{error}</Text>
            {onRetry && (
              <Button size='xs' variant='light' color='red' onClick={onRetry}>
                Retry
              </Button>
            )}
          </Group>
        </Alert>
      )}
      {pagination && (
        <TablePagination
          pagination={pagination}
          onChange={tableState.setPagination}
        />
      )}
    </DataTableContext.Provider>
  );
}
