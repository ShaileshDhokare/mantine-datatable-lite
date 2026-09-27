import type { ColumnType } from '../../types';

export function resolveColumnType(left: unknown, right: unknown, declaredType?: ColumnType): ColumnType {
  if (declaredType) return declaredType;
  if (left instanceof Date && right instanceof Date) return 'date';
  if (typeof left === 'number' && typeof right === 'number') return 'number';
  if (typeof left === 'boolean' && typeof right === 'boolean') return 'boolean';
  return 'string';
}
