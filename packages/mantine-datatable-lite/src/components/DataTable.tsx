import {
  Box,
  Button,
  Checkbox,
  getThemeColor,
  LoadingOverlay,
  Stack,
  Table,
  Text,
  Transition,
  useMantineTheme,
  VisuallyHidden,
} from '@mantine/core';
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { DataTableConfigContext } from '../context/DataTableConfigContext';
import { DataTableContext } from '../context/DataTableContext';
import {
  CONTROL_COLUMN_WIDTH,
  useColumnLayout,
} from '../hooks/useColumnLayout';
import { rowPanelId, useRowIdentity } from '../hooks/useRowIdentity';
import { useSelection } from '../hooks/useSelection';
import { useTableState } from '../hooks/useTableState';
import { Icon } from '../icons/Icon';
import { mergeLabels } from '../labels';
import classes from '../styles/styles.module.css';
import type { DataTableProps, RowId } from '../types';
import { filterRows } from '../utils/filter/predicates';
import { paginationConfig, resolvePage } from '../utils/pagination';
import { searchRows } from '../utils/search/searchRows';
import { sortRows } from '../utils/sort/sortRows';
import { TableRow, type CellColumn } from './body/TableRow';
import { TablePagination } from './footer/TablePagination';
import { ColumnHeader } from './header/ColumnHeader';
import { HeaderPopoverScope } from './header/HeaderPopoverScope';
import { BulkActionBar } from './toolbar/BulkActionBar';
import { TableToolbar } from './toolbar/TableToolbar';

/** A full-width body row for the empty and error states. */
function BodyMessage({
  colSpan,
  children,
}: {
  colSpan: number;
  children: ReactNode;
}) {
  return (
    <Table.Tr>
      <Table.Td colSpan={colSpan} ta='center' py='xl' px={0}>
        <div className={classes.bodyMessage}>{children}</div>
      </Table.Td>
    </Table.Tr>
  );
}

/** Stable empty rows while an error is shown. */
const NO_ROWS: never[] = [];

export function DataTable<T>({
  columns,
  rows,
  mode = 'client',
  pagination: paginationProp,
  onChange,
  idAccessor,
  globalSearch,
  columnSelector,
  showTableStatePills,
  maxChips,
  showReset,
  debounceTime,
  selection,
  expandable,
  onRowClick,
  rowProps,
  loading,
  loaderProps,
  error,
  onRetry,
  emptyState,
  persistKey,
  minWidth,
  maxHeight,
  labels: labelOverrides,
  dateInput,
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
  layout,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}: DataTableProps<T>) {
  const server = mode === 'server';
  const scrolls = minWidth != null || maxHeight != null;
  const theme = useMantineTheme();
  const pagination = paginationConfig(paginationProp);
  const tableState = useTableState({
    columns,
    mode,
    pagination,
    onChange,
    persistKey,
  });
  const config = useMemo(
    () => ({ labels: mergeLabels(labelOverrides), dateInput }),
    [labelOverrides, dateInput],
  );
  const { labels } = config;

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
    Boolean(expandable),
  );

  // Client mode: filter → search → sort → page. Server mode: rows are the result.
  const { filters, columnSearch, searchQuery, sorter } = tableState;
  const filteredRows = useMemo(
    () => (server ? rows : filterRows(rows, columns, filters)),
    [server, rows, columns, filters],
  );
  const searchedRows = useMemo(
    () =>
      server
        ? filteredRows
        : searchRows(filteredRows, columns, columnSearch, searchQuery),
    [server, filteredRows, columns, columnSearch, searchQuery],
  );
  const sortedRows = useMemo(
    () => (server ? searchedRows : sortRows(searchedRows, columns, sorter)),
    [server, searchedRows, columns, sorter],
  );
  const totalItems = server
    ? (pagination?.totalItems ?? rows.length)
    : sortedRows.length;
  const page = resolvePage(tableState.page, tableState.pageSize, totalItems);
  const visibleRows =
    pagination && !server
      ? sortedRows.slice(
          (page.currentPage - 1) * page.pageSize,
          page.currentPage * page.pageSize,
        )
      : sortedRows;

  const missingTotal = server && pagination?.totalItems === undefined;
  useEffect(() => {
    if (missingTotal && process.env.NODE_ENV !== 'production')
      console.warn(
        '[DataTable] Server pagination needs pagination.totalItems.',
      );
  }, [missingTotal]);

  // An error replaces the rows, so selection and expansion see no rows either.
  const failed = Boolean(error);
  const rowEntries = useRowIdentity(
    failed ? (NO_ROWS as T[]) : visibleRows,
    idAccessor,
    Boolean(selection || expandable),
  );

  const [localExpanded, setLocalExpanded] = useState<RowId[]>([]);
  const expandedIds = expandable?.expandedIds ?? localExpanded;
  const expandedSet = new Set(expandedIds);
  const panelPrefix = useId().replace(/:/g, '');
  function toggleExpanded(id: RowId) {
    const next = expandedSet.has(id)
      ? expandedIds.filter((item) => item !== id)
      : expandable?.allowMultiple
        ? [...expandedIds, id]
        : [id];
    if (expandable?.expandedIds === undefined) setLocalExpanded(next);
    expandable?.onChange?.(next);
  }

  const {
    selectedIds,
    selectedSet,
    pageIds,
    selectedOnPage,
    allPageSelected,
    snapshot,
    changeSelection,
    togglePage,
  } = useSelection(
    rowEntries,
    selection,
    JSON.stringify([filters, columnSearch, searchQuery]),
  );

  const columnSearchByField = new Map(
    columnSearch.map((item) => [item.field, item.value]),
  );
  function pinProps(field: string): CellColumn<T>['pinProps'] {
    const pin = offsets.get(field);
    if (!pin) return {};
    return {
      'data-pinned': pin.side,
      'data-pin-edge':
        pin.side === 'left' && left[left.length - 1] === field
          ? 'left'
          : pin.side === 'right' && right[0] === field
            ? 'right'
            : undefined,
      className: classes.cell,
      style: { '--dt-pin-offset': `${pin.offset}px` } as CSSProperties,
    } as CellColumn<T>['pinProps'];
  }
  const cellColumns: CellColumn<T>[] = visibleColumns.map((column) => ({
    column,
    pinProps: pinProps(column.dataIndex),
    terms: column.render
      ? []
      : [
          column.searchable !== false ? searchQuery : '',
          columnSearchByField.get(column.dataIndex),
        ].filter((term): term is string => Boolean(term)),
  }));

  const colSpan = Math.max(
    visibleColumns.length +
      Number(Boolean(selection)) +
      Number(Boolean(expandable)),
    1,
  );

  // Toolbars: the bulk action bar covers the standard toolbar while rows are selected.
  const standardToolbarRef = useRef<HTMLDivElement>(null);
  const bulkToolbarRef = useRef<HTMLDivElement>(null);
  const restoreToolbarFocus = useRef(false);
  const showStandardToolbar = Boolean(
    globalSearch || columnSelector || showTableStatePills || showReset,
  );
  const showBulkToolbar = Boolean(
    selection?.renderBulkActions && selectedIds.length > 0,
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

  const table = (
    <Table
      ref={tableRef}
      className={classes.root}
      style={
        { '--dt-control-width': `${CONTROL_COLUMN_WIDTH}px` } as CSSProperties
      }
      borderColor={borderColor}
      withTableBorder={withTableBorder && !scrolls}
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
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-busy={Boolean(loading)}
    >
      <Table.Thead>
        <HeaderPopoverScope>
          <Table.Tr>
            {selection && (
              <Table.Th
                data-control='selection'
                w={CONTROL_COLUMN_WIDTH}
                className={classes.controlCell}
                style={{ '--dt-pin-offset': '0px' } as CSSProperties}
              >
                <Checkbox
                  aria-label={labels.selectAll}
                  size='sm'
                  checked={allPageSelected}
                  indeterminate={!allPageSelected && selectedOnPage > 0}
                  disabled={!pageIds.size}
                  onChange={togglePage}
                />
              </Table.Th>
            )}
            {expandable && (
              <Table.Th
                data-control='expansion'
                w={CONTROL_COLUMN_WIDTH}
                className={classes.controlCell}
                style={
                  {
                    '--dt-pin-offset': `${expansionOffset}px`,
                  } as CSSProperties
                }
              >
                {/* Header cells need text for screen readers; this column has no visible title. */}
                <VisuallyHidden>{labels.expandRow}</VisuallyHidden>
              </Table.Th>
            )}
            {cellColumns.map(({ column }) => (
              <ColumnHeader
                key={column.dataIndex}
                column={column}
                rows={rows}
                serverMode={server}
                canHide={
                  visibleColumns.length > 1 &&
                  Boolean(columnSelector || showTableStatePills || showReset)
                }
                pin={offsets.get(column.dataIndex)}
                stickyHeader={stickyHeader}
              />
            ))}
          </Table.Tr>
        </HeaderPopoverScope>
      </Table.Thead>
      <Table.Tbody>
        {failed && (
          <BodyMessage colSpan={colSpan}>
            <Stack align='center' gap='xs' py='md' role='alert'>
              <Icon
                name='error'
                strokeWidth={1.25}
                size={36}
                color='var(--mantine-color-error)'
              />
              <Text component='div' size='sm'>
                {error === true ? labels.loadError : error}
              </Text>
              {onRetry && (
                <Button size='xs' variant='default' mt={4} onClick={onRetry}>
                  {labels.retry}
                </Button>
              )}
            </Stack>
          </BodyMessage>
        )}
        {!failed && visibleRows.length === 0 && (
          <BodyMessage colSpan={colSpan}>
            {emptyState ?? (
              <Stack align='center' gap='xs' py='md'>
                <Icon
                  name='empty'
                  strokeWidth={1.25}
                  size={36}
                  color='var(--mantine-color-dimmed)'
                />
                <Text size='sm' c='dimmed'>
                  {labels.noRecords}
                </Text>
              </Stack>
            )}
          </BodyMessage>
        )}
        {rowEntries.map(({ row, id, key }, index) => (
          <TableRow
            key={key}
            row={row}
            index={index}
            id={id}
            cellColumns={cellColumns}
            colSpan={colSpan}
            rowProps={rowProps}
            onRowClick={onRowClick}
            selection={
              selection && {
                selected: id !== undefined && selectedSet.has(id),
                selectable: id !== undefined && pageIds.has(id),
                toggle: () =>
                  changeSelection(
                    selectedSet.has(id!)
                      ? selectedIds.filter((item) => item !== id)
                      : [...selectedIds, id!],
                  ),
              }
            }
            expansion={
              expandable && {
                expanded: id !== undefined && expandedSet.has(id),
                offset: expansionOffset,
                panelId:
                  id === undefined ? undefined : rowPanelId(panelPrefix, id),
                onRowClick: expandable.trigger === 'row',
                toggle: () => toggleExpanded(id!),
                render: () => expandable.render(row, index),
              }
            }
          />
        ))}
      </Table.Tbody>
    </Table>
  );

  // The outer border sits on the scroll frame, so it stays put while the table scrolls.
  // Side padding would expose scrolling cells beyond the right-pinned column, so only x is offset.
  const tableContent = scrolls ? (
    <Table.ScrollContainer
      minWidth={minWidth ?? 0}
      maxHeight={maxHeight}
      className={withTableBorder ? classes.frame : undefined}
      style={
        borderColor
          ? ({
              '--dt-border-color': getThemeColor(borderColor, theme),
            } as CSSProperties)
          : undefined
      }
      scrollAreaProps={{
        scrollbarSize: '8px',
        offsetScrollbars: 'x',
        classNames: { viewport: classes.viewport },
      }}
    >
      {table}
    </Table.ScrollContainer>
  ) : (
    table
  );

  return (
    <DataTableConfigContext.Provider value={config}>
      <DataTableContext.Provider value={tableState}>
        <Box className={classes.wrapper}>
          {(showStandardToolbar || showBulkToolbar) && (
            <Box className={classes.toolbars}>
              {showStandardToolbar && (
                <TableToolbar
                  ref={standardToolbarRef}
                  columns={columns}
                  globalSearch={globalSearch}
                  columnSelector={columnSelector}
                  showTableStatePills={showTableStatePills}
                  showReset={showReset}
                  debounceTime={debounceTime}
                  maxChips={maxChips}
                  inactive={showBulkToolbar}
                />
              )}
              <Transition
                mounted={showBulkToolbar}
                transition='fade'
                duration={100}
              >
                {(styles) => (
                  <BulkActionBar
                    ref={bulkToolbarRef}
                    count={selectedIds.length}
                    showCount={selection?.showSelectionCount !== false}
                    style={styles}
                    onClear={clearSelection}
                    actions={selection?.renderBulkActions?.({
                      ...snapshot(selectedIds),
                      clear: clearSelection,
                    })}
                  />
                )}
              </Transition>
            </Box>
          )}
          {selection && (
            // Always mounted, so screen readers announce the first selection too.
            <VisuallyHidden role='status'>
              {selectedIds.length
                ? labels.selectedCount(selectedIds.length)
                : ''}
            </VisuallyHidden>
          )}
          <Box pos='relative'>
            <LoadingOverlay
              visible={Boolean(loading)}
              overlayProps={{ radius: 'sm', blur: 2 }}
              loaderProps={{ type: 'bars', size: 'sm', ...loaderProps }}
            />
            {tableContent}
          </Box>
          {pagination && (
            <TablePagination
              page={page.currentPage}
              pageSize={page.pageSize}
              total={totalItems}
              pageSizeOptions={pagination.pageSizeOptions}
              onChange={tableState.setPagination}
            />
          )}
        </Box>
      </DataTableContext.Provider>
    </DataTableConfigContext.Provider>
  );
}
