import axios from 'axios';
import { API_BASE_URL, RESPONSE_DELAY_MS } from '../constants/api';

/** Demo switches, sent as headers that the example API understands. */
export const simulation = { slow: false, failing: false };

export const http = axios.create({ baseURL: API_BASE_URL });

http.interceptors.request.use((config) => {
  const delay = simulation.slow ? RESPONSE_DELAY_MS.slow : RESPONSE_DELAY_MS.normal;
  config.headers.set('X-Simulate-Delay', String(delay));
  if (simulation.failing) config.headers.set('X-Simulate-Error', '1');
  return config;
});

/** The API's error message, or a generic one. */
export function errorMessage(error: unknown): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? error.message;
  }
  return 'Something went wrong';
}

/** True for requests cancelled with an AbortSignal. */
export function isCancel(error: unknown): boolean {
  return axios.isCancel(error);
}
