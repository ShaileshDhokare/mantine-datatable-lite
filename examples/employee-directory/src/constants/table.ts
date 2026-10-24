import type { FilterOption } from 'mantine-datatable-lite';

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
export const DEFAULT_PAGE_SIZE = 25;

/**
 * Height at which a table body scrolls, and widths at which tables scroll
 * sideways: about the sum of their column widths, so columns keep their widths.
 */
export const TABLE_MAX_HEIGHT = 560;
export const SERVER_TABLE_MIN_WIDTH = 1450;
export const CLIENT_TABLE_MIN_WIDTH = 1750;

/** Lowest and highest salary in the demo data, and the salary slider's step. */
export const SALARY_RANGE: [number, number] = [45_000, 170_000];
export const SALARY_STEP = 5_000;

/** Choices for the Status filter. Boolean filter values are 'true' and 'false'. */
export const STATUS_FILTER_OPTIONS: FilterOption[] = [
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];
