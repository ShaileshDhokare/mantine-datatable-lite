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
import type { DataTableProps, RowId } from '../types';
import {
  CONTROL_COLUMN_WIDTH,
  useColumnLayout,
} from '../hooks/useColumnLayout';
import { rowPanelId, useRowIdentity } from '../hooks/useRowIdentity';
import { useSelection } from '../hooks/useSelection';
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
  persistKey,
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
    persistKey,
    debounceTime,
  });
  const expandConfig =
    typeof expandable === 'object'
      ? expandable
      : expandable && expandedRowRender
        ? { render: expandedRowRender }
        : undefined;
  const {
    tableRef,
    ordered: visibleColumns,
    offsets,
    left,
    right,
    expansionOffset,
  } = useColumnLayout(
    columns,
    tableState.hiddenColumns,
    tableState.pinned,
    Boolean(selection),
    Boolean(expandConfig),
  );
  const [localExpanded, setLocalExpanded] = useState<RowId[]>([]);
  const expandedIds = expandConfig?.expandedIds ?? localExpanded;
  const expandedSet = new Set(expandedIds);
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

  const rowEntries = useRowIdentity(
    visibleRows,
    idAccessor,
    Boolean(selection || expandConfig),
  );

  function toggleExpanded(id: RowId) {
    const next = expandedSet.has(id)
      ? expandedIds.filter((item) => item !== id)
      : expandConfig?.allowMultiple
        ? [...expandedIds, id]
        : [id];
    if (expandConfig?.expandedIds === undefined) setLocalExpanded(next);
    expandConfig?.onChange?.(next);
  }

  const query = {
    filters: tableState.filters,
    columnSearch: tableState.columnSearch,
    search: tableState.searchQuery,
  };
  const {
    selectedIds,
    selectedSet,
    pageIds,
    selectedOnPage,
    allPageSelected,
    snapshot,
    changeSelection,
    togglePage,
  } = useSelection(rowEntries, selection, query);
  const columnSearchByField = new Map(
    tableState.columnSearch.map((item) => [item.searchField, item.searchValue]),
  );
  const cellColumns = visibleColumns.map((column) => ({
    column,
    pin: offsets.get(column.dataIndex),
    terms: column.render
      ? []
      : [
          column.searchable !== false ? tableState.searchQuery : '',
          columnSearchByField.get(column.dataIndex),
        ].filter((term): term is string => Boolean(term)),
  }));

  const extraColumns =
    Number(Boolean(selection)) + Number(Boolean(expandConfig));
  const colSpan = Math.max(visibleColumns.length + extraColumns, 1);
  const standardToolbarRef = useRef<HTMLDivElement>(null);
  const bulkToolbarRef = useRef<HTMLDivElement>(null);
  const restoreToolbarFocus = useRef(false);
  const showStandardToolbar = Boolean(
    globalSearch || columnSelector || showTableStatePills || showReset,
  );
  const showBulkToolbar = Boolean(
    toolbar && selection && selectedIds.length > 1,
  );
  useEffect(() => {
    if (
      showBulkToolbar &&
      standardToolbarRef.current?.contains(document.activeElement)
    ) {
      bulkToolbarRef.current?.querySelector<HTMLElement>('button')?.focus();
    }
    if (!showBulkToolbar && restoreToolbarFocus.current) {
      restoreToolbarFocus.current = false;
      standardToolbarRef.current
        ?.querySelector<HTMLElement>('input, button')
        ?.focus();
    }
  }, [showBulkToolbar]);
  function clearSelection() {
    restoreToolbarFocus.current = true;
    changeSelection([]);
  }

  function pinProps(field: string) {
    const pin = offsets.get(field);
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
            '--dt-pin-offset': `${pin.offset}px`,
          } as CSSProperties,
        }
      : {};
  }

  const table = (
    <Table
      ref={tableRef}
      className={classes.root}
      style={
        { '--dt-control-width': `${CONTROL_COLUMN_WIDTH}px` } as CSSProperties
      }
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
      aria-busy={Boolean(loading)}
    >
      <Table.Thead>
        <Table.Tr>
          {selection && (
            <Table.Th
              data-control='selection'
              w={CONTROL_COLUMN_WIDTH}
              className={classes.controlCell}
              style={{ '--dt-pin-offset': '0px' } as CSSProperties}
            >
              <Checkbox
                aria-label='Select all rows on this page'
                size='sm'
                checked={allPageSelected}
                indeterminate={!allPageSelected && selectedOnPage > 0}
                disabled={!pageIds.size}
                onChange={togglePage}
              />
            </Table.Th>
          )}
          {expandConfig && (
            <Table.Th
              data-control='expansion'
              w={CONTROL_COLUMN_WIDTH}
              className={classes.controlCell}
              style={
                {
                  '--dt-pin-offset': `${expansionOffset}px`,
                } as CSSProperties
              }
              aria-label='Expand rows'
            />
          )}
          {cellColumns.map(({ column, pin }) => (
            <ColumnHeader
              key={column.dataIndex}
              column={column}
              rows={rows}
              serverMode={Boolean(pagination)}
              canHide={
                visibleColumns.length > 1 &&
                Boolean(columnSelector || showTableStatePills || showReset)
              }
              pin={pin}
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
        {rowEntries.map(({ row, id, key }, index) => {
          const expanded = id !== undefined && expandedSet.has(id);
          const panelId =
            id === undefined ? undefined : rowPanelId(panelPrefix, id);
          const selectable = id !== undefined && pageIds.has(id);
          const suppliedProps = rowProps?.(row, index) ?? {};
          return (
            <Fragment key={key}>
              <Table.Tr
                {...suppliedProps}
                data-selected={
                  (id !== undefined && selectedSet.has(id)) || undefined
                }
                onClick={(event) => {
                  suppliedProps.onClick?.(event);
                  if (event.defaultPrevented) return;
                  if (!window.getSelection?.()?.toString()) {
                    if (expandConfig?.trigger === 'row' && id !== undefined)
                      toggleExpanded(id);
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
                      aria-label={
                        id === undefined
                          ? `Select row ${index + 1} (invalid ID)`
                          : `Select row ${String(id)}`
                      }
                      checked={id !== undefined && selectedSet.has(id)}
                      disabled={!selectable}
                      onClick={(event) => event.stopPropagation()}
                      onChange={() => {
                        if (id === undefined) return;
                        changeSelection(
                          selectedSet.has(id)
                            ? selectedIds.filter((item) => item !== id)
                            : [...selectedIds, id],
                        );
                      }}
                    />
                  </Table.Td>
                )}
                {expandConfig && (
                  <Table.Td
                    className={classes.controlCell}
                    style={
                      {
                        '--dt-pin-offset': `${expansionOffset}px`,
                      } as CSSProperties
                    }
                  >
                    <ActionIcon
                      variant='transparent'
                      size='sm'
                      aria-label={`${expanded ? 'Collapse' : 'Expand'} row ${id === undefined ? `${index + 1} (invalid ID)` : String(id)}`}
                      disabled={id === undefined}
                      aria-expanded={expanded}
                      aria-controls={panelId}
                      onClick={(event) => {
                        event.stopPropagation();
                        if (id !== undefined) toggleExpanded(id);
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
                {cellColumns.map(({ column, terms }) => {
                  const value = (row as Record<string, unknown>)[
                    column.dataIndex
                  ];
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

  return (
    <DataTableContext.Provider value={tableState}>
      {(showStandardToolbar || showBulkToolbar) && (
        <Box pos='relative'>
          {showStandardToolbar && (
            <Box
              ref={standardToolbarRef}
              inert={showBulkToolbar}
              aria-hidden={showBulkToolbar || undefined}
            >
              <TableToolbar
                columns={columns}
                globalSearch={globalSearch}
                columnSelector={columnSelector}
                showTableStatePills={showTableStatePills}
                showReset={showReset}
                debounceTime={debounceTime}
                maxChips={maxChips}
                inactive={showBulkToolbar}
              />
            </Box>
          )}
          <Transition
            mounted={showBulkToolbar}
            transition='fade'
            duration={100}
          >
            {(styles) => (
              <Paper
                ref={bulkToolbarRef}
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
                      clear: clearSelection,
                    })}
                    <Tooltip label='Clear selection'>
                      <ActionIcon
                        variant='transparent'
                        size='lg'
                        aria-label='Clear selection'
                        onClick={clearSelection}
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
      <Box pos='relative' aria-busy={Boolean(loading)}>
        <LoadingOverlay
          visible={Boolean(loading)}
          zIndex={1000}
          overlayProps={{ radius: 'sm', blur: 2 }}
          loaderProps={{ type: 'bars', size: 'sm', ...loaderProps }}
        />
        {tableContent}
      </Box>
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
