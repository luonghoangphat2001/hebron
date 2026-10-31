import { useCallback, useEffect, useRef, useState } from 'react';

type UseInfiniteScrollOptions = {
  /** Callback fired when the sentinel element enters the viewport / scroll container */
  onLoadMore: () => void;
  /** Whether there is a next page available to load */
  hasMore?: boolean;
  /** Whether a fetch / load operation is currently in progress */
  isLoading?: boolean;
  /** Margin around the root element, e.g. '150px' to trigger before reaching bottom */
  rootMargin?: string;
  /** Threshold for intersection observer (0 to 1) */
  threshold?: number;
  /** Optional search query input value to debounce automatically */
  searchValue?: string;
  /** Debounce delay in ms (default: 400ms) */
  debounceDelay?: number;
  /** Optional callback fired when debounced search value updates */
  onSearchChange?: (debouncedValue: string) => void;
};

/**
 * Custom hook to manage infinite scroll pagination with built-in search debouncing using IntersectionObserver.
 * Attach the returned `sentinelRef` callback to a bottom trigger element in your scroll list.
 */
export const useInfiniteScroll = ({
  onLoadMore,
  hasMore = false,
  isLoading = false,
  rootMargin = '150px',
  threshold = 0,
  searchValue,
  debounceDelay = 800,
  onSearchChange,
}: UseInfiniteScrollOptions) => {
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Debounced search state
  const [debouncedSearch, setDebouncedSearch] = useState(searchValue ?? '');
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (searchValue === undefined) return;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue);
      onSearchChange?.(searchValue);
    }, debounceDelay);

    return () => clearTimeout(timer);
  }, [searchValue, debounceDelay, onSearchChange]);

  const sentinelRef = useCallback(
    (node: HTMLElement | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      if (!node || !hasMore || isLoading) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting && hasMore && !isLoading) {
            onLoadMore();
          }
        },
        {
          rootMargin,
          threshold,
        },
      );

      observerRef.current.observe(node);
    },
    [onLoadMore, hasMore, isLoading, rootMargin, threshold],
  );

  return {
    sentinelRef,
    debouncedSearch,
    setDebouncedSearch,
  };
};

export default useInfiniteScroll;
