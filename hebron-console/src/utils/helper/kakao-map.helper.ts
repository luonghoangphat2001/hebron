let kakaoSdkPromise: Promise<any> | null = null;

const getKakao = (): any => {
  if (typeof window === 'undefined') return undefined;
  return (window as any).kakao;
};

/**
 * Singleton loader for Kakao Maps JavaScript SDK
 * Based on official documentation: https://apis.map.kakao.com/web/guide/
 */
export const loadKakaoMapSdk = (appKey = import.meta.env.VITE_KAKAO_MAP_API_KEY): Promise<any> => {
  if (typeof window === 'undefined') return Promise.reject(new Error('Window is not defined'));

  const kakao = getKakao();
  if (kakao?.maps?.load) {
    return new Promise((resolve) => {
      kakao.maps.load(() => resolve(kakao.maps));
    });
  }

  if (kakaoSdkPromise) return kakaoSdkPromise;

  kakaoSdkPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById('kakao-map-sdk') as HTMLScriptElement | null;

    const onScriptLoaded = () => {
      const loadedKakao = getKakao();
      if (loadedKakao?.maps) {
        loadedKakao.maps.load(() => resolve(loadedKakao.maps));
      } else {
        reject(new Error('Kakao Maps SDK failed to initialize'));
      }
    };

    if (existingScript) {
      const currentKakao = getKakao();
      if (currentKakao?.maps) {
        currentKakao.maps.load(() => resolve(currentKakao.maps));
      } else {
        existingScript.addEventListener('load', onScriptLoaded);
        existingScript.addEventListener('error', (err) => reject(err));
      }
      return;
    }

    if (!appKey) {
      reject(new Error('VITE_KAKAO_MAP_API_KEY is missing'));
      return;
    }

    const script = document.createElement('script');
    script.id = 'kakao-map-sdk';
    script.type = 'text/javascript';
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false&libraries=services,clusterer`;
    script.async = true;

    script.onload = onScriptLoaded;
    script.onerror = (err) => {
      kakaoSdkPromise = null;
      reject(err);
    };

    document.head.appendChild(script);
  });

  return kakaoSdkPromise;
};

/**
 * Build Kakao Map navigation URL
 */
export const buildKakaoMapUrl = (placeName: string, latitude?: number, longitude?: number, address?: string): string => {
  const encodedName = encodeURIComponent(placeName?.trim() || '헤브론');
  if (latitude !== undefined && longitude !== undefined) {
    return `https://map.kakao.com/link/map/${encodedName},${latitude},${longitude}`;
  }
  return `https://map.kakao.com/link/search/${encodeURIComponent(address?.trim() || '헤브론')}`;
};

/**
 * Build Kakao Map directions (길찾기) URL
 */
export const buildKakaoMapDirectionsUrl = (placeName: string, latitude?: number, longitude?: number): string => {
  const encodedName = encodeURIComponent(placeName?.trim() || '헤브론');
  if (latitude !== undefined && longitude !== undefined) {
    return `https://map.kakao.com/link/to/${encodedName},${latitude},${longitude}`;
  }
  return `https://map.kakao.com/link/search/${encodedName}`;
};
