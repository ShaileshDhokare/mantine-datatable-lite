import type { ColumnType } from '../../types';
import { resolveColumnType } from './resolveColumnType';

const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base',
});

/** Compares two present values; sortRows handles null placement and direction. */
export function compareValues(
  left: unknown,
  right: unknown,
  type?: ColumnType,
): number {
  switch (resolveColumnType(left, right, type)) {
    case 'number': {
      const difference = Number(left) - Number(right);
      return Number.isNaN(difference) ? 0 : difference;
    }
    case 'date': {
      const leftTime =
        left instanceof Date
          ? left.getTime()
          : new Date(left as string | number).getTime();
      const rightTime =
        right instanceof Date
          ? right.getTime()
          : new Date(right as string | number).getTime();
      const difference = leftTime - rightTime;
      return Number.isNaN(difference) ? 0 : difference;
    }
    case 'boolean':
      return Number(left) - Number(right);
    case 'string':
      return collator.compare(String(left), String(right));
  }
}
