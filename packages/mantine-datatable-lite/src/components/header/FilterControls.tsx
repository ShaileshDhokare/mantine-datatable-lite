import {
  Box,
  Button,
  Checkbox,
  Divider,
  Group,
  NumberInput,
  ScrollArea,
  Select,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useEffect, useMemo, useState } from 'react';
import { useDataTableConfig } from '../../context/DataTableConfigContext';
import { useDataTableContext } from '../../context/DataTableContext';
import { Icon } from '../../icons/Icon';
import type {
  DataTableColumn,
  DateInputProps,
  FilterValue,
  NumericOperator,
} from '../../types';
import { columnLabel } from '../../utils/columnLabel';
import { filterChoices } from '../../utils/filter/filterChoices';

const operatorOrder: NumericOperator[] = [
  'eq',
  'neq',
  'gt',
  'gte',
  'lt',
  'lte',
  'between',
];

type Draft = {
  operator: NumericOperator;
  first: string | number | null;
  second: string | number | null;
};

function asInput(value: unknown, date: boolean): string | number | null {
  if (date)
    return value instanceof Date && !Number.isNaN(value.getTime())
      ? `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
      : null;
  return typeof value === 'number' ? value : null;
}

function initialDraft(value: FilterValue | undefined, date: boolean): Draft {
  if (!value || Array.isArray(value))
    return { operator: 'eq', first: null, second: null };
  const bounds = Array.isArray(value.value) ? value.value : [value.value];
  return {
    operator: value.operator,
    first: asInput(bounds[0], date),
    second: asInput(bounds[1], date),
  };
}

function dateValue(value: string | number | null): Date | null {
  if (typeof value !== 'string' || !value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function NativeDateInput({
  value,
  onChange,
  size,
  placeholder,
  'aria-label': ariaLabel,
}: DateInputProps) {
  return (
    <TextInput
      size={size}
      placeholder={placeholder}
      aria-label={ariaLabel}
      type='date'
      value={value ?? ''}
      onChange={(event) => onChange(event.currentTarget.value || null)}
    />
  );
}

export function FilterControls<T>({
  column,
  rows,
  serverMode,
  onDone,
}: {
  column: DataTableColumn<T>;
  rows: T[];
  serverMode: boolean;
  onDone: () => void;
}) {
  const { filters, setFilter } = useDataTableContext();
  const { labels, dateInput: DateInput = NativeDateInput } =
    useDataTableConfig();
  const name = columnLabel(column);
  const filterWord = labels.filter.toLocaleLowerCase();
  const applied = filters.find(
    (filter) => filter.field === column.dataIndex,
  )?.value;
  const date = column.type === 'date';
  const choice =
    column.type === 'string' || column.type === 'boolean' || !column.type;
  // Drafts start from the applied value; the controls remount each time they open.
  const [selected, setSelected] = useState<string[]>(() =>
    Array.isArray(applied) ? applied.map(String) : [],
  );
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState<Draft>(() => initialDraft(applied, date));
  const [customValue, setCustomValue] = useState<FilterValue | undefined>(
    applied,
  );
  const options = useMemo(
    () => (choice ? filterChoices(rows, column, labels, !serverMode) : []),
    [choice, rows, column, labels, serverMode],
  );

  const missingServerOptions =
    serverMode && choice && column.type !== 'boolean' && !column.filterOptions;
  useEffect(() => {
    if (missingServerOptions && process.env.NODE_ENV !== 'production')
      console.warn(
        `[DataTable] Column "${column.dataIndex}" needs filterOptions in server mode.`,
      );
  }, [missingServerOptions, column.dataIndex]);

  function commit(value?: FilterValue) {
    setFilter(column.dataIndex, value);
    onDone();
  }

  function apply() {
    if (column.renderFilter) {
      commit(customValue);
      return;
    }
    if (choice) {
      commit(
        column.type === 'boolean'
          ? selected.map((item) => item === 'true')
          : selected,
      );
      return;
    }
    const first = date
      ? dateValue(draft.first)
      : draft.first === null || draft.first === ''
        ? null
        : Number(draft.first);
    const second = date
      ? dateValue(draft.second)
      : draft.second === null || draft.second === ''
        ? null
        : Number(draft.second);
    if (
      first === null ||
      (typeof first === 'number' && !Number.isFinite(first))
    ) {
      onDone();
      return;
    }
    if (draft.operator === 'between') {
      if (first instanceof Date && second instanceof Date)
        commit({ operator: 'between', value: [first, second] });
      else if (
        typeof first === 'number' &&
        typeof second === 'number' &&
        Number.isFinite(second)
      )
        commit({ operator: 'between', value: [first, second] });
      else onDone();
    } else if (first instanceof Date) {
      commit({ operator: draft.operator, value: first });
    } else {
      commit({ operator: draft.operator, value: first });
    }
  }

  const visibleOptions = options.filter((option) =>
    option.label.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
  );
  const input = (
    value: string | number | null,
    onChange: (next: string | number | null) => void,
    label: string,
  ) =>
    date ? (
      <DateInput
        size='xs'
        aria-label={`${name} ${filterWord} ${label.toLocaleLowerCase()}`}
        placeholder={label}
        value={typeof value === 'string' ? value : null}
        onChange={(next) => onChange(next)}
        popoverProps={{ withinPortal: false }}
      />
    ) : (
      <NumberInput
        size='xs'
        aria-label={`${name} ${filterWord} ${label.toLocaleLowerCase()}`}
        placeholder={label}
        value={value ?? ''}
        onChange={(next) => onChange(next === '' ? null : next)}
      />
    );

  return (
    <Box
      onKeyDown={(event) => {
        if (
          event.key === 'Enter' &&
          event.target instanceof HTMLInputElement &&
          event.target.type !== 'checkbox' &&
          event.target.getAttribute('role') !== 'combobox'
        )
          apply();
      }}
    >
      <Box p='6'>
        {column.renderFilter ? (
          column.renderFilter({
            value: customValue,
            onChange: setCustomValue,
            apply,
            reset: () => commit(),
          })
        ) : choice ? (
          <Stack gap='xs'>
            {column.searchableFilter === true && (
              <TextInput
                size='xs'
                placeholder={labels.searchOptions}
                aria-label={labels.searchOptions}
                leftSection={<Icon name='search' size={14} />}
                value={query}
                onChange={(event) => setQuery(event.currentTarget.value)}
              />
            )}
            <ScrollArea.Autosize mah={220}>
              <Checkbox.Group value={selected} onChange={setSelected}>
                <Stack gap={2}>
                  {visibleOptions.length ? (
                    visibleOptions.map((option) => (
                      <Checkbox
                        key={option.value}
                        value={option.value}
                        label={option.label}
                        size='xs'
                        px={6}
                        py={3}
                      />
                    ))
                  ) : (
                    <Text size='xs' c='dimmed' p='xs'>
                      {labels.noOptions}
                    </Text>
                  )}
                </Stack>
              </Checkbox.Group>
            </ScrollArea.Autosize>
          </Stack>
        ) : (
          <Stack gap='xs'>
            <Select
              size='xs'
              aria-label={`${name} ${filterWord} operator`}
              data={operatorOrder.map((operator) => ({
                value: operator,
                label: labels.operators[operator],
              }))}
              value={draft.operator}
              checkIconPosition='right'
              allowDeselect={false}
              comboboxProps={{ withinPortal: false }}
              onChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  operator: (value ?? 'eq') as NumericOperator,
                }))
              }
            />
            {input(
              draft.first,
              (first) => setDraft((current) => ({ ...current, first })),
              draft.operator === 'between' ? labels.from : labels.value,
            )}
            {draft.operator === 'between' &&
              input(
                draft.second,
                (second) => setDraft((current) => ({ ...current, second })),
                labels.to,
              )}
          </Stack>
        )}
      </Box>
      <Divider />
      <Group justify='space-between' p={6}>
        <Button size='xs' variant='subtle' onClick={() => commit()}>
          {labels.reset}
        </Button>
        <Button size='xs' onClick={apply}>
          {labels.apply}
        </Button>
      </Group>
    </Box>
  );
}
