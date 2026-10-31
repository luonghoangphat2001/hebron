import { cn } from '@/lib/utils';
import { BRAND_CONTACT_MAP_LOCATION } from '@/utils/constants/brand-contact-form.constant';
import { useEffect, useRef, useState } from 'react';

type KakaoMapsSdk = {
  maps: {
    load: (callback: () => void) => void;
    LatLng: new (lat: number, lng: number) => object;
    Map: new (container: HTMLElement, options: { center: object; level: number }) => object;
    Marker: new (options: { position: object }) => { setMap: (map: object | null) => void };
  };
};

type KakaoMapProps = {
  className?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  mapImageUrl?: string | null;
};

const KAKAO_MAP_SCRIPT_ID = 'kakao-map-sdk';

const getKakaoMapsSdk = () => (window as Window & { kakao?: KakaoMapsSdk }).kakao;

const KakaoMap = ({ className, address, latitude, longitude, mapImageUrl }: KakaoMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const appKey = import.meta.env.VITE_KAKAO_MAP_APP_KEY;

  const lat = latitude ?? BRAND_CONTACT_MAP_LOCATION.latitude;
  const lng = longitude ?? BRAND_CONTACT_MAP_LOCATION.longitude;
  const displayAddress = address || BRAND_CONTACT_MAP_LOCATION.address;

  useEffect(() => {
    if (!appKey || !mapRef.current) return;

    const initMap = () => {
      const kakao = getKakaoMapsSdk();
      if (!mapRef.current || !kakao?.maps) return;

      kakao.maps.load(() => {
        if (!mapRef.current || !kakao.maps) return;

        const center = new kakao.maps.LatLng(lat, lng);
        const map = new kakao.maps.Map(mapRef.current, {
          center,
          level: 3,
        });
        const marker = new kakao.maps.Marker({ position: center });
        marker.setMap(map);
        setIsReady(true);
      });
    };

    const existingScript = document.getElementById(KAKAO_MAP_SCRIPT_ID) as HTMLScriptElement | null;

    if (existingScript) {
      if (getKakaoMapsSdk()?.maps) {
        initMap();
      } else {
        existingScript.addEventListener('load', initMap);
      }
      return () => existingScript.removeEventListener('load', initMap);
    }

    const script = document.createElement('script');
    script.id = KAKAO_MAP_SCRIPT_ID;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false`;
    script.async = true;
    script.addEventListener('load', initMap);
    document.head.appendChild(script);

    return () => script.removeEventListener('load', initMap);
  }, [appKey, lat, lng]);

  if (!appKey) {
    if (mapImageUrl) {
      return (
        <div className={cn('overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900', className)}>
          <img src={mapImageUrl} alt={displayAddress} className='size-full object-cover' />
        </div>
      );
    }

    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 p-6 text-center text-sm text-neutral-400',
          className,
        )}>
        {displayAddress}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900',
        !isReady && 'animate-pulse',
        className,
      )}>
      <div ref={mapRef} className='size-full min-h-80' aria-label='헤브론 위치 지도' />
    </div>
  );
};

export default KakaoMap;
