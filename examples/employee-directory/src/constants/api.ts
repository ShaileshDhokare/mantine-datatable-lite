/** Vite's dev server proxies this path to the Express API (see vite.config.ts). */
export const API_BASE_URL = '/api';

/** Response delay the example API adds, in milliseconds: normally, and with "slow network" on. */
export const RESPONSE_DELAY_MS = { normal: 250, slow: 1500 } as const;
