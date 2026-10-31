import type { OnChangeFn, PaginationState } from '@tanstack/react-table';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

type FilterPagingType<T> = {
  getInitialFilter: (params: URLSearchParams) => T;
  prefix?: string;
};

// Add prefix to avoid duplication when there are many duplicate keys in 1 page
export function useFilterPaging<T extends Record<string, any>>({ getInitialFilter, prefix }: FilterPagingType<T>) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filter, setFilter] = useState<T>(getInitialFilter(searchParams));

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

  /** 🔹 TanStack adapter (THIS is what you want) */
  const onPaginationChange: OnChangeFn<PaginationState> = useCallback((updater) => {
    setFilter((prev) => {
      const current: PaginationState = {
        pageIndex: Math.max(prev.page - 1, 0),
        pageSize: prev.size,
      };

      const next = typeof updater === 'function' ? updater(current) : updater;

      return {
        ...prev,
        page: next.pageIndex + 1, // convert back to 1-based
        per_page: next.pageSize,
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
