// Turns the table's TableChange request into a parameterized SQL query.
// Field names come from the client, so only whitelisted columns ever reach SQL.

/** Table field → SQL column and value type. `search: true` joins global search. */
const fields = {
  name: { column: 'name', type: 'string', search: true },
  email: { column: 'email', type: 'string', search: true },
  department: { column: 'department', type: 'string', search: true },
  role: { column: 'role', type: 'string', search: true },
  city: { column: 'city', type: 'string', search: true },
  salary: { column: 'salary', type: 'number' },
  isActive: { column: 'is_active', type: 'boolean' },
  joinDate: { column: 'join_date', type: 'date' },
};

const operators = { eq: '=', neq: '<>', gt: '>', gte: '>=', lt: '<', lte: '<=' };
const MAX_PAGE_SIZE = 100;

export class BadRequest extends Error {}

function field(name) {
  const definition = Object.hasOwn(fields, name) ? fields[name] : undefined;
  if (!definition) throw new BadRequest(`Unknown field "${name}"`);
  return definition;
}

/** LIKE pattern for a literal substring. */
function contains(term) {
  return `%${term.replace(/[\\%_]/g, (character) => `\\${character}`)}%`;
}

function isDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function comparable(type, value) {
  if (type === 'number' && typeof value === 'number' && Number.isFinite(value)) return value;
  if (type === 'date' && isDate(value)) return value;
  throw new BadRequest(`Invalid ${type} filter value`);
}

function filterClause({ field: name, value }, params) {
  const { column, type } = field(name);

  // String and boolean filters: a list of accepted values.
  if (Array.isArray(value)) {
    if (value.length === 0) return null;
    if (type === 'boolean') {
      if (!value.every((item) => typeof item === 'boolean')) throw new BadRequest('Invalid boolean filter');
      params.push(...value.map((item) => (item ? 1 : 0)));
    } else if (type === 'string') {
      if (!value.every((item) => typeof item === 'string')) throw new BadRequest('Invalid choice filter');
      params.push(...value);
    } else {
      throw new BadRequest(`"${name}" does not accept choice filters`);
    }
    return `${column} IN (${value.map(() => '?').join(', ')})`;
  }

  // Number and date filters: { operator, value }. Dates arrive as YYYY-MM-DD.
  if (type !== 'number' && type !== 'date') throw new BadRequest(`"${name}" does not accept operator filters`);
  if (value?.operator === 'between') {
    if (!Array.isArray(value.value) || value.value.length !== 2) throw new BadRequest('Between needs two bounds');
    // Accept reversed bounds; numbers and YYYY-MM-DD strings both compare with < and >.
    const [low, high] = value.value
      .map((bound) => comparable(type, bound))
      .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    params.push(low, high);
    return `${column} BETWEEN ? AND ?`;
  }
  const sqlOperator = operators[value?.operator];
  if (!sqlOperator) throw new BadRequest('Unknown filter operator');
  params.push(comparable(type, value.value));
  return `${column} ${sqlOperator} ?`;
}

/**
 * @param {import('mantine-datatable-lite').TableChange} request
 * @returns {{ where: string, params: unknown[], orderBy: string, limit: number, offset: number }}
 */
export function buildQuery(request) {
  const conditions = [];
  const params = [];

  for (const filter of request.filters ?? []) {
    const clause = filterClause(filter, params);
    if (clause) conditions.push(clause);
  }

  for (const { field: name, value } of request.columnSearch ?? []) {
    const { column } = field(name);
    conditions.push(`${column} LIKE ? ESCAPE '\\'`);
    params.push(contains(String(value)));
  }

  const search = String(request.searchQuery ?? '').trim();
  if (search) {
    const searchable = Object.values(fields).filter((definition) => definition.search);
    conditions.push(`(${searchable.map(({ column }) => `${column} LIKE ? ESCAPE '\\'`).join(' OR ')})`);
    params.push(...searchable.map(() => contains(search)));
  }

  // Sort, with id as a tiebreaker so pages never shuffle between requests.
  let orderBy = 'id ASC';
  if (request.sorter) {
    const { column, type } = field(request.sorter.field);
    const direction = request.sorter.order === 'desc' ? 'DESC' : 'ASC';
    orderBy = `${column}${type === 'string' ? ' COLLATE NOCASE' : ''} ${direction}, id ASC`;
  }

  const pageSize = Math.min(Math.max(1, Math.floor(request.pagination?.pageSize ?? 10)), MAX_PAGE_SIZE);
  const page = Math.max(1, Math.floor(request.pagination?.currentPage ?? 1));

  return {
    where: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '',
    params,
    orderBy,
    limit: pageSize,
    offset: (page - 1) * pageSize,
  };
}
