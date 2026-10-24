// One set of formatters, so both tables, the drawer and expanded rows agree.

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const mediumDate = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' });

export const formatSalary = (value: number) => currency.format(value);

export const formatDate = (value: Date) => mediumDate.format(value);

/** "1 employee", "3 employees". */
export function formatCount(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

/** "4 years, 2 months" since `since`. */
export function formatTenure(since: Date, now = new Date()): string {
  let months =
    (now.getFullYear() - since.getFullYear()) * 12 + now.getMonth() - since.getMonth();
  if (now.getDate() < since.getDate()) months -= 1;
  if (months < 1) return 'Less than a month';
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return [years && formatCount(years, 'year'), rest && formatCount(rest, 'month')]
    .filter(Boolean)
    .join(', ');
}

/** Current time in an IANA time zone, e.g. "14:05 GMT+1". */
export function formatLocalTime(timeZone: string, now = new Date()): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(now);
}
