import type { Pagination, PaginationChange } from '../types';

export function resolvePagination(pagination: Pagination) {
  const pageSize =
    pagination.pageSize > 0
      ? pagination.pageSize
      : pagination.defaultPageSize || 10;
  const pageCount = Math.max(1, Math.ceil(pagination.totalItems / pageSize));
  const currentPage = Math.min(Math.max(1, pagination.currentPage), pageCount);
  const samePage = currentPage === pagination.currentPage;
  return {
    pageSize,
    pageCount,
    currentPage,
    from:
      pagination.totalItems === 0
        ? 0
        : samePage && pagination.from != null
          ? pagination.from
          : (currentPage - 1) * pageSize + 1,
    to:
      pagination.totalItems === 0
        ? 0
        : samePage && pagination.to != null
          ? pagination.to
          : Math.min(currentPage * pageSize, pagination.totalItems),
  };
}

export function paginationChange(pagination: Pagination): PaginationChange {
  const { currentPage, pageSize, from, to } = resolvePagination(pagination);
  return { currentPage, pageSize, from, to, totalItems: pagination.totalItems };
}
