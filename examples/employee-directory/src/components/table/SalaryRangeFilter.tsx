import { Group, RangeSlider, Stack, Text } from '@mantine/core';
import type { FilterRenderContext } from 'mantine-datatable-lite';
import { SALARY_RANGE, SALARY_STEP } from '../../constants/table';
import { formatSalary } from '../../utils/format';

function currentRange(value: FilterRenderContext['value']): [number, number] {
  if (value && !Array.isArray(value) && value.operator === 'between') {
    const [from, to] = value.value;
    if (typeof from === 'number' && typeof to === 'number') return [from, to];
  }
  return SALARY_RANGE;
}

/**
 * A custom filter UI through the column's `renderFilter`. The table adds the
 * Apply and Reset buttons, and the value is a standard `between` filter.
 */
export function SalaryRangeFilter({ value, onChange }: FilterRenderContext) {
  const range = currentRange(value);
  const [min, max] = SALARY_RANGE;

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
        min={min}
        max={max}
        step={SALARY_STEP}
        minRange={SALARY_STEP}
        value={range}
        // The range is shown above, so no floating thumb labels.
        label={null}
        thumbFromLabel='Minimum salary'
        thumbToLabel='Maximum salary'
        onChange={(next) =>
          // The full range is the same as no filter.
          onChange(
            next[0] === min && next[1] === max
              ? undefined
              : { operator: 'between', value: next },
          )
        }
      />
    </Stack>
  );
}
