// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import type { TableChange } from 'mantine-datatable-lite';
import { useServerData } from './useServerData';

const first: TableChange = { pagination: { currentPage: 1, pageSize: 10 }, filters: [], columnSearch: [], searchQuery: '' };
const second: TableChange = { pagination: { currentPage: 2, pageSize: 10 }, filters: [], columnSearch: [], searchQuery: '' };
type Page = { rows: number[]; totalItems: number };

function deferred() {
  let resolve!: (value: Page) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<Page>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

test('aborts the old request and ignores its late response', async () => {
  const old = deferred();
  const fresh = deferred();
  const signals: AbortSignal[] = [];
  const fetchPage = vi.fn((_request: TableChange, signal: AbortSignal) => {
    signals.push(signal);
    return signals.length === 1 ? old.promise : fresh.promise;
  });
  const view = renderHook(({ request }) => useServerData(request, fetchPage), { initialProps: { request: first } });
  view.rerender({ request: second });
  expect(signals[0].aborted).toBe(true);
  await act(async () => { fresh.resolve({ rows: [20], totalItems: 20 }); });
  expect(view.result.current.rows).toEqual([20]);
  await act(async () => { old.resolve({ rows: [1], totalItems: 99 }); });
  expect(view.result.current.rows).toEqual([20]);
  expect(view.result.current.totalItems).toBe(20);
});

test('keeps the last page through an error and retries', async () => {
  const firstLoad = deferred();
  const failure = deferred();
  const retry = deferred();
  const loads = [firstLoad, failure, retry];
  const fetchPage = vi.fn(() => loads.shift()!.promise);
  const view = renderHook(({ request }) => useServerData(request, fetchPage), { initialProps: { request: first } });
  await act(async () => { firstLoad.resolve({ rows: [1], totalItems: 20 }); });
  view.rerender({ request: second });
  expect(view.result.current.rows).toEqual([1]);
  expect(view.result.current.loading).toBe(true);
  await act(async () => { failure.reject(new Error('Network down')); });
  expect(view.result.current.error).toBe('Network down');
  expect(view.result.current.rows).toEqual([1]);
  act(() => view.result.current.retry());
  await act(async () => { retry.resolve({ rows: [11], totalItems: 20 }); });
  expect(view.result.current.rows).toEqual([11]);
  expect(view.result.current.error).toBeUndefined();
});

test('ignores AbortError and does not refetch for a new callback identity', async () => {
  const fetchPage = vi.fn(() => Promise.reject(Object.assign(new Error('aborted'), { name: 'AbortError' })));
  const view = renderHook(({ callback }) => useServerData(first, callback), { initialProps: { callback: fetchPage } });
  await act(async () => {});
  expect(view.result.current.error).toBeUndefined();
  view.rerender({ callback: vi.fn(fetchPage) });
  expect(fetchPage).toHaveBeenCalledTimes(1);
});

test('aborts the in-flight request on unmount', () => {
  let signal!: AbortSignal;
  const view = renderHook(() => useServerData(first, (_request, currentSignal) => {
    signal = currentSignal;
    return new Promise<Page>(() => {});
  }));
  view.unmount();
  expect(signal.aborted).toBe(true);
});
