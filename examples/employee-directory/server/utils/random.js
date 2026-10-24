/**
 * Small seeded random number generator (mulberry32). The same seed always gives
 * the same sequence, so demo data is identical after every reset.
 *
 * @param {number} seed
 * @returns {() => number} Numbers from 0 (inclusive) to 1 (exclusive).
 */
export function createRandom(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * One random item.
 *
 * @template T
 * @param {readonly T[]} items
 * @param {() => number} random
 */
export function pickOne(items, random) {
  return items[Math.floor(random() * items.length)];
}

/**
 * `count` random items in random order (a Fisher-Yates shuffle, then the first `count`).
 *
 * @template T
 * @param {readonly T[]} items
 * @param {number} count
 * @param {() => number} random
 */
export function pickSome(items, count, random) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[other]] = [shuffled[other], shuffled[index]];
  }
  return shuffled.slice(0, count);
}
