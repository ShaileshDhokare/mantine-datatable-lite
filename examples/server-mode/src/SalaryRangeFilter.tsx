import { Group, RangeSlider, Stack, Text } from '@mantine/core';
import type { FilterRenderContext } from 'mantine-datatable-lite';
import { formatSalary } from './format';

/** Lowest and highest salary in the demo data. */
const LIMITS: [number, number] = [45_000, 170_000];

function currentRange(value: FilterRenderContext['value']): [number, number] {
  if (value && !Array.isArray(value) && value.operator === 'between') {
    const [from, to] = value.value;
    if (typeof from === 'number' && typeof to === 'number') return [from, to];
  }
  return LIMITS;
}

/**
 * A custom filter UI through the column's `renderFilter`. The table adds the
 * Apply and Reset buttons and sends the value to the API as a `between` filter.
 */
export function SalaryRangeFilter({ value, onChange }: FilterRenderContext) {
  const range = currentRange(value);
  return (
    <Stack gap='sm' w={280} px={4} pt={4} pb='md'>
      <Group justify='space-between' gap='xs'>
        <Text size='xs' c='dimmed'>
          Salary range
        </Text>
        <Text size='xs' fw={500}>
          {formatSalary(range[0])} – {formatSalary(range[1])}
        </Text>
      </Group>
      <RangeSlider
        size='sm'
        min={LIMITS[0]}
        max={LIMITS[1]}
        step={5_000}
        minRange={5_000}
        value={range}
        // The range is shown above, so no floating thumb labels.
        label={null}
        thumbFromLabel='Minimum salary'
        thumbToLabel='Maximum salary'
        onChange={(next) =>
          // The full range is the same as no filter.
          onChange(
            next[0] === LIMITS[0] && next[1] === LIMITS[1]
              ? undefined
              : { operator: 'between', value: next },
          )
        }
      />
    </Stack>
  );
}
