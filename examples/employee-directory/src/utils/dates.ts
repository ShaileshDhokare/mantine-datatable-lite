/** `YYYY-MM-DD` for a date's local calendar day. */
export function toCalendarDay(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Local midnight of a `YYYY-MM-DD` day. `new Date('2024-05-01')` would be UTC midnight. */
export function fromCalendarDay(day: string): Date {
  return new Date(`${day}T00:00:00`);
}
