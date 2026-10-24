import type { Pagination } from '../types';

export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

/** Normalizes the `pagination` prop; undefined when pagination is off. */
export function paginationConfig(
  pagination: Pagination | boolean | undefined,
): Pagination | undefined {
  if (!pagination) return undefined;
  return pagination === true ? {} : pagination;
}

/** Clamps a page to the available range and computes the shown item range. */
export function resolvePage(page: number, pageSize: number, total: number) {
  const size = pageSize > 0 ? pageSize : DEFAULT_PAGE_SIZE;
  const pageCount = Math.max(1, Math.ceil(total / size));
  const currentPage = Math.min(Math.max(1, Math.floor(page) || 1), pageCount);
  return {
    pageSize: size,
    pageCount,
    currentPage,
    from: total === 0 ? 0 : (currentPage - 1) * size + 1,
    to: Math.min(currentPage * size, total),
  };
}
