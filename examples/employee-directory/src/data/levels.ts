// Career levels, derived from job titles. The client-side table shows them in a
// computed column (`getValue`) that sorts by seniority (`sortFn`), not A to Z.

/** Most junior first: this is the Level column's sort order. */
export const LEVELS = ['Individual contributor', 'Senior', 'Lead', 'Manager', 'Director'] as const;
export type Level = (typeof LEVELS)[number];

/** The first matching rule wins. Product managers manage products, not people. */
const LEVEL_RULES: [pattern: RegExp, level: Level][] = [
  [/Director/, 'Director'],
  [/^(?!.*Product Manager).*Manager/, 'Manager'],
  [/Staff|Lead|Counsel/, 'Lead'],
  [/Senior/, 'Senior'],
];

export function levelOf(role: string): Level {
  return LEVEL_RULES.find(([pattern]) => pattern.test(role))?.[1] ?? 'Individual contributor';
}

/** 0 for the most junior level. */
export const levelRank = (role: string) => LEVELS.indexOf(levelOf(role));
