import type {
  DataTableColumn,
  DataTableLabels,
  FilterValue,
  TableChange,
} from '../types';
import { columnLabel } from './columnLabel';

const operatorSymbols = {
  eq: '=',
  neq: '≠',
  gt: '>',
  gte: '≥',
  lt: '<',
  lte: '≤',
} as const;

function displayValue(value: unknown, labels: DataTableLabels) {
  if (value instanceof Date) return value.toLocaleDateString();
  if (typeof value === 'boolean') return value ? labels.true : labels.false;
  return String(value);
}

function filterDescription<T>(
  value: FilterValue,
  labels: DataTableLabels,
  column?: DataTableColumn<T>,
) {
  if (Array.isArray(value))
    return value.map((item) => {
      const option = column?.filterOptions?.find((choice) =>
        typeof choice === 'string'
          ? choice === String(item)
          : choice.value === String(item),
      );
      return option && typeof option !== 'string'
        ? option.label
        : displayValue(item, labels);
    });
  if (value.operator === 'between' && Array.isArray(value.value))
    return [
      `${displayValue(value.value[0], labels)} – ${displayValue(value.value[1], labels)}`,
    ];
  if (value.operator === 'between') return [];
  return [
    `${operatorSymbols[value.operator]} ${displayValue(value.value, labels)}`,
  ];
}

export type StatePill = {
  key: string;
  label: string;
  fieldLabel: string;
  value: string;
  emphasizeValue?: boolean;
  remove: () => void;
};

export function describeState<T>(
  columns: DataTableColumn<T>[],
  state: Pick<
    TableChange,
    'sorter' | 'filters' | 'columnSearch' | 'searchQuery'
  > & {
    hiddenColumns: string[];
    setSort: (field: string, order: null) => void;
    setFilter: (field: string, value?: FilterValue) => void;
    setColumnSearch: (field: string, value: string) => void;
    setSearchQuery: (value: string) => void;
    setColumnHidden: (field: string, hidden: boolean) => void;
  },
  labels: DataTableLabels,
): StatePill[] {
  const columnByField = new Map(
    columns.map((column) => [column.dataIndex, column]),
  );
  const name = (field: string) => {
    const column = columnByField.get(field);
    return column ? columnLabel(column) : field;
  };
  const pills: StatePill[] = [];
  const addPill = (
    key: string,
    fieldLabel: string,
    value: string,
    remove: () => void,
    emphasizeValue = false,
  ) =>
    pills.push({
      key,
      label: `${fieldLabel} ${emphasizeValue ? `%${value}%` : value}`,
      fieldLabel,
      value,
      emphasizeValue,
      remove,
    });

  const sorter = state.sorter;
  if (sorter)
    addPill(
      'sort',
      labels.sortedBy,
      `${name(sorter.field)} ${sorter.order.toUpperCase()}`,
      () => state.setSort(sorter.field, null),
    );
  for (const filter of state.filters) {
    filterDescription(
      filter.value,
      labels,
      columnByField.get(filter.field),
    ).forEach((description, index) =>
      addPill(
        `filter:${filter.field}:${index}`,
        `${name(filter.field)}:`,
        description,
        () =>
          state.setFilter(
            filter.field,
            Array.isArray(filter.value)
              ? (filter.value.filter(
                  (_, itemIndex) => itemIndex !== index,
                ) as FilterValue)
              : undefined,
          ),
      ),
    );
  }
  for (const search of state.columnSearch)
    addPill(
      `search:${search.field}`,
      `${name(search.field)}:`,
      search.value,
      () => state.setColumnSearch(search.field, ''),
      true,
    );
  if (state.searchQuery)
    addPill(
      'global-search',
      labels.searchPill,
      state.searchQuery,
      () => state.setSearchQuery(''),
      true,
    );
  for (const field of state.hiddenColumns)
    addPill(`hidden:${field}`, labels.hiddenPill, name(field), () =>
      state.setColumnHidden(field, false),
    );
  return pills;
}
