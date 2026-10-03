import type { DataTableColumn, FilterValue, TableChange } from '../types';
import { columnLabel } from './columnLabel';

const operatorLabels = {
  eq: '=',
  neq: '≠',
  gt: '>',
  gte: '≥',
  lt: '<',
  lte: '≤',
  between: 'between',
};

function displayValue(value: unknown) {
  if (value instanceof Date) return value.toLocaleDateString();
  return String(value);
}

function filterDescription<T>(value: FilterValue, column?: DataTableColumn<T>) {
  if (Array.isArray(value))
    return value.map((item) => {
      const option = column?.filterOptions?.find((choice) =>
        typeof choice === 'string'
          ? choice === String(item)
          : choice.value === String(item),
      );
      return option && typeof option !== 'string'
        ? option.label
        : displayValue(item);
    });
  if (value.operator === 'between' && Array.isArray(value.value))
    return [
      `between ${displayValue(value.value[0])} and ${displayValue(value.value[1])}`,
    ];
  return [`${operatorLabels[value.operator]} ${displayValue(value.value)}`];
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
  state: Pick<TableChange, 'sorter' | 'filters' | 'columnSearch' | 'searchQuery'> & {
    hiddenColumns: string[];
    setSort: (field: string, order: null) => void;
    setFilter: (field: string, value?: FilterValue) => void;
    setColumnSearch: (field: string, value: string) => void;
    setSearchQuery: (value: string, immediate?: boolean) => void;
    setColumnHidden: (field: string, hidden: boolean) => void;
  },
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
      'Sort by:',
      `${name(sorter.sortField)} ${sorter.sortOrder.toUpperCase()}`,
      () => state.setSort(sorter.sortField, null),
    );
  for (const filter of state.filters) {
    filterDescription(filter.value, columnByField.get(filter.field)).forEach(
      (description, index) =>
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
      `search:${search.searchField}`,
      `${name(search.searchField)}:`,
      search.searchValue,
      () => state.setColumnSearch(search.searchField, ''),
      true,
    );
  if (state.searchQuery)
    addPill(
      'global-search',
      'Search:',
      state.searchQuery,
      () => state.setSearchQuery('', true),
      true,
    );
  for (const field of state.hiddenColumns)
    addPill(`hidden:${field}`, 'Hidden:', name(field), () =>
      state.setColumnHidden(field, false),
    );
  return pills;
}
