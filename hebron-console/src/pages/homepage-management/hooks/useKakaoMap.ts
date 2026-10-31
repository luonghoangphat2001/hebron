import { loadKakaoMapSdk } from '@/utils/helper/kakao-map.helper';
import { useEffect, useState } from 'react';

export const useKakaoMap = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let mounted = true;

    loadKakaoMapSdk()
      .then(() => {
        if (mounted) {
          setIsLoaded(true);
        }
      })
      .catch(() => {
        if (mounted) {
          setHasError(true);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return {
    isLoaded,
    isLoading: !isLoaded && !hasError,
    hasError,
  };
};

export default useKakaoMap;
