// Applies a mantine-datatable-lite `TableChange` to a Kysely select query.
//
//   filters       -> WHERE column IN (...), column >= ?, column BETWEEN ? AND ?
//   columnSearch  -> WHERE column LIKE '%text%'
//   searchQuery   -> WHERE (name LIKE ... OR email LIKE ... OR ...)
//   sorter        -> ORDER BY column, id
//   pagination    -> LIMIT / OFFSET
//
// Field names come from the browser, so only fields in the `FieldMap` reach SQL,
// and every value is sent as a bound parameter.
import { sql } from 'kysely';
import { BadRequest } from './errors.js';
import { parseList } from './validation.js';

/**
 * @typedef {'string' | 'number' | 'boolean' | 'date'} FieldType
 * @typedef {{ type: FieldType, column?: string, globalSearch?: boolean }} FieldDefinition
 * @typedef {Record<string, FieldDefinition>} FieldMap
 * @typedef {import('mantine-datatable-lite').TableChange} TableChange
 */

const OPERATORS = { eq: '=', neq: '<>', gt: '>', gte: '>=', lt: '<', lte: '<=' };
const CALENDAR_DAY = /^\d{4}-\d{2}-\d{2}$/;

/** The column for a table field, or a 400 error for fields that are not listed. */
function columnOf(fields, field) {
  const definition = Object.hasOwn(fields, field) ? fields[field] : undefined;
  if (!definition) throw new BadRequest(`Unknown field "${field}"`);
  return { column: definition.column ?? field, type: definition.type };
}

/** `column LIKE '%term%'`, with the term's own `%`, `_` and `\` matched literally. */
function contains(eb, column, term) {
  const pattern = `%${term.replace(/[\\%_]/g, (character) => `\\${character}`)}%`;
  return sql`${eb.ref(column)} like ${pattern} escape '\\'`;
}

/** A number or `YYYY-MM-DD` date from a filter, checked against the field's type. */
function comparable(type, value) {
  if (type === 'number' && typeof value === 'number' && Number.isFinite(value)) return value;
  if (type === 'date' && typeof value === 'string' && CALENDAR_DAY.test(value)) return value;
  throw new BadRequest(`Invalid ${type} filter value`);
}

/** One filter as a condition, or null for an empty choice list. */
function filterCondition(eb, fields, filter) {
  if (typeof filter !== 'object' || filter === null) throw new BadRequest('Invalid filter');
  const { field, value } = filter;
  const { column, type } = columnOf(fields, field);

  // String and boolean filters: the list of accepted values.
  if (Array.isArray(value)) {
    if (value.length === 0) return null;
    if (type === 'string' && value.every((item) => typeof item === 'string')) {
      return eb(column, 'in', value);
    }
    if (type === 'boolean' && value.every((item) => typeof item === 'boolean')) {
      // SQLite stores booleans as 1 and 0.
      return eb(column, 'in', value.map((item) => (item ? 1 : 0)));
    }
    throw new BadRequest(`Invalid choice filter for "${field}"`);
  }

  // Number and date filters: { operator, value }. Dates arrive as YYYY-MM-DD.
  if (type !== 'number' && type !== 'date') {
    throw new BadRequest(`"${field}" does not accept operator filters`);
  }
  if (value?.operator === 'between') {
    if (!Array.isArray(value.value) || value.value.length !== 2) {
      throw new BadRequest('A between filter needs two bounds');
    }
    // Accept reversed bounds. Numbers and YYYY-MM-DD strings both order with < and >.
    const [low, high] = value.value
      .map((bound) => comparable(type, bound))
      .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    return eb.between(column, low, high);
  }
  const operator = OPERATORS[value?.operator];
  if (!operator) throw new BadRequest('Unknown filter operator');
  return eb(column, operator, comparable(type, value.value));
}

/**
 * WHERE: filters, column searches and the global search, combined with AND.
 *
 * @template {import('kysely').SelectQueryBuilder<any, any, any>} Query
 * @param {Query} query
 * @param {TableChange} request
 * @param {FieldMap} fields
 * @returns {Query}
 */
export function applyFilters(query, request, fields) {
  const filters = parseList(request.filters, 'filters');
  const columnSearch = parseList(request.columnSearch, 'columnSearch');
  const term = String(request.searchQuery ?? '').trim();

  return query.where((eb) => {
    const conditions = filters.map((filter) => filterCondition(eb, fields, filter));

    for (const search of columnSearch) {
      if (typeof search !== 'object' || search === null) throw new BadRequest('Invalid column search');
      conditions.push(contains(eb, columnOf(fields, search.field).column, String(search.value)));
    }

    if (term) {
      const searchable = Object.entries(fields).filter(([, definition]) => definition.globalSearch);
      conditions.push(eb.or(searchable.map(([field]) => contains(eb, columnOf(fields, field).column, term))));
    }

    // An empty AND is always true, so a request without filters matches every row.
    return eb.and(conditions.filter(Boolean));
  });
}

/**
 * ORDER BY the table's sort, then `tiebreaker`, so rows never move between pages.
 * Text sorts ignore case.
 *
 * @template {import('kysely').SelectQueryBuilder<any, any, any>} Query
 * @param {Query} query
 * @param {TableChange} request
 * @param {FieldMap} fields
 * @param {string} [tiebreaker]
 * @returns {Query}
 */
export function applySort(query, request, fields, tiebreaker = 'id') {
  let sorted = query;
  if (request.sorter) {
    const { column, type } = columnOf(fields, request.sorter.field);
    sorted = sorted.orderBy(column, (order) => {
      const directed = request.sorter.order === 'desc' ? order.desc() : order.asc();
      return type === 'string' ? directed.collate('nocase') : directed;
    });
  }
  return sorted.orderBy(tiebreaker);
}

/**
 * LIMIT and OFFSET for the requested page. The page size is capped at `maxPageSize`.
 *
 * @param {TableChange} request
 * @param {{ defaultPageSize: number, maxPageSize: number }} limits
 */
export function getPage(request, { defaultPageSize, maxPageSize }) {
  const wholeNumber = (value, fallback) => Math.floor(Number(value)) || fallback;
  const pageSize = Math.min(Math.max(1, wholeNumber(request.pagination?.pageSize, defaultPageSize)), maxPageSize);
  const page = Math.max(1, wholeNumber(request.pagination?.currentPage, 1));
  return { limit: pageSize, offset: (page - 1) * pageSize };
}
