import type { OnChangeFn, PaginationState } from '@tanstack/react-table';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

type FilterPagingType<T> = {
  getInitialFilter: (params: URLSearchParams) => T;
  prefix?: string;
};

// Strips `prefix_` from matching keys so getInitialFilter can read them by their plain name.
const unprefixParams = (params: URLSearchParams, prefix?: string): URLSearchParams => {
  if (!prefix) return params;
  const unprefixed = new URLSearchParams();
  params.forEach((value, key) => {
    if (key.startsWith(`${prefix}_`)) unprefixed.set(key.slice(prefix.length + 1), value);
  });
  return unprefixed;
};

// Add prefix to avoid duplication when there are many duplicate keys in 1 page
export function useFilterPaging<T extends Record<string, any>>({ getInitialFilter, prefix }: FilterPagingType<T>) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filter, setFilter] = useState<T>(getInitialFilter(unprefixParams(searchParams, prefix)));

  const pagination: PaginationState = useMemo(
    () => ({
      pageIndex: Math.max(filter.page - 1, 0),
      pageSize: filter.per_page,
    }),
    [filter.page, filter.per_page],
  );

  const handleFilterChange = useCallback((newFilter: Partial<T>) => {
    setFilter((prev) => ({ ...prev, ...newFilter, page: 1 }));
  }, []);

  // const handlePagingChange = useCallback((pageNumber: number, pageSize?: number) => {
  //   setFilter((prev) => ({ ...prev, page: pageNumber, size: pageSize || prev.size }));
  // }, []);

  /** 🔹 TanStack adapter (THIS is what you want) */
  const onPaginationChange: OnChangeFn<PaginationState> = useCallback((updater) => {
    setFilter((prev) => {
      const current: PaginationState = {
        pageIndex: Math.max(prev.page - 1, 0),
        pageSize: prev.per_page ?? prev.size,
      };

      const next = typeof updater === 'function' ? updater(current) : updater;

      return {
        ...prev,
        page: next.pageIndex + 1, // convert back to 1-based
        per_page: next.pageSize,
        ...(prev.size !== undefined ? { size: next.pageSize } : {}),
      };
    });
  }, []);

  useEffect(() => {
    setSearchParams((params) => {
      Object.entries(filter).forEach(([key, value]) => {
        const paramKey = prefix ? `${prefix}_${key}` : key;
        if (value !== undefined && value !== null && value !== '') {
          params.set(paramKey, String(value));
        } else {
          params.delete(paramKey);
        }
      });
      return params;
    });
  }, [filter, prefix, setSearchParams]);

  return { filter, pagination, handleFilterChange, onPaginationChange };
}
