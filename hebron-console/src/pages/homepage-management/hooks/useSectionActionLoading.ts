import { useCallback, useState } from 'react';

export type LoadingState<T = string | number> = {
  isLoading: boolean;
  id: T | null;
};

export const useSectionActionLoading = <T extends string | number = string | number>() => {
  const [loadingState, setLoadingState] = useState<LoadingState<T>>({
    isLoading: false,
    id: null,
  });

  const runWithLoading = useCallback(async (id: T, fn: () => Promise<any> | void) => {
    try {
      setLoadingState({ isLoading: true, id });
      await fn();
    } finally {
      setLoadingState({ isLoading: false, id: null });
    }
  }, []);

  const isLoadingTarget = useCallback((id: T) => loadingState.isLoading && loadingState.id === id, [loadingState]);

  return {
    loadingState,
    isLoading: loadingState.isLoading,
    loadingId: loadingState.id,
    isLoadingTarget,
    runWithLoading,
  };
};

export default useSectionActionLoading;
