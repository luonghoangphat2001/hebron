import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

type Parser<T> = (params: URLSearchParams) => T;

export function getTemplateErrorMessage(error: unknown, fallback = 'Unable to load data.') {
  const candidate = error as { response?: { data?: { message?: string } }; message?: string };
  return candidate?.response?.data?.message || candidate?.message || fallback;
}

export function useTemplateListState<T extends Record<string, unknown>>(parse: Parser<T>) {
  const [searchParams, setSearchParams] = useSearchParams();
  const state = useMemo(() => parse(searchParams), [parse, searchParams]);

  const update = useCallback(
    (patch: Partial<T>, resetPage = true) => {
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        Object.entries({ ...patch, ...(resetPage && !('page' in patch) ? { page: 1 } : {}) }).forEach(([key, value]) => {
          if (value === undefined || value === null || value === '') next.delete(key);
          else next.set(key, String(value));
        });
        return next;
      });
    },
    [setSearchParams],
  );

  const reset = useCallback(
    (defaults: Partial<T>) => {
      const next = new URLSearchParams();
      Object.entries(defaults).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') next.set(key, String(value));
      });
      setSearchParams(next);
    },
    [setSearchParams],
  );

  return { state, update, reset };
}
