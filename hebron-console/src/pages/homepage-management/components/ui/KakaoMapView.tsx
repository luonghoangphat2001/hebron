import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { buildKakaoMapDirectionsUrl, buildKakaoMapUrl } from '@/utils/helper/kakao-map.helper';
import { ExternalLink, MapPin, Navigation } from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useKakaoMap } from '../../hooks/useKakaoMap';

type Props = {
  latitude?: number;
  longitude?: number;
  placeName?: string;
  address?: string;
  kakaoMapUrl?: string;
  onCoordinatesChange?: (lat: number, lng: number) => void;
};

export const KakaoMapView: React.FC<Props> = ({
  latitude = 37.5645,
  longitude = 126.9972,
  placeName = '(주)헤브론 쇼룸',
  address = '서울특별시 중구 마른내로 72 (인현동2가) 신일빌딩 3층',
  kakaoMapUrl,
  onCoordinatesChange,
}) => {
  const { t: tContent } = useTranslation('content');
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);
  const overlayInstanceRef = useRef<any>(null);

  const { isLoaded, hasError } = useKakaoMap();

  // Initialize and update Kakao Map on mount or coordinate change
  useEffect(() => {
    const kakao = typeof window !== 'undefined' ? (window as any).kakao : undefined;
    if (!isLoaded || !mapContainerRef.current || !kakao?.maps) return;

    try {
      const position = new kakao.maps.LatLng(latitude, longitude);

      if (!mapInstanceRef.current) {
        const mapOptions = {
          center: position,
          level: 3,
        };
        const map = new kakao.maps.Map(mapContainerRef.current, mapOptions);
        mapInstanceRef.current = map;

        // Add Zoom & MapType Controls
        const zoomControl = new kakao.maps.ZoomControl();
        map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);
        const mapTypeControl = new kakao.maps.MapTypeControl();
        map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);

        // Marker
        const marker = new kakao.maps.Marker({
          position,
          map,
        });
        markerInstanceRef.current = marker;

        // Custom Overlay Pin Tooltip
        const overlayContent = `
          <div style="padding:6px 12px;font-size:12px;font-weight:700;color:#191919;border-radius:20px;background:#FEE500;box-shadow:0 3px 10px rgba(0,0,0,0.25);border:1px solid #e5ce00;white-space:nowrap;display:flex;align-items:center;gap:4px;">
            <span>📍 ${placeName}</span>
          </div>
        `;
        const overlay = new kakao.maps.CustomOverlay({
          position,
          content: overlayContent,
          yAnchor: 2.2,
          map,
        });
        overlayInstanceRef.current = overlay;

        // Map Click Event -> Move marker & notify parent
        if (onCoordinatesChange) {
          kakao.maps.event.addListener(map, 'click', (mouseEvent: any) => {
            const latlng = mouseEvent.latLng;
            const newLat = parseFloat(latlng.getLat().toFixed(6));
            const newLng = parseFloat(latlng.getLng().toFixed(6));
            marker.setPosition(latlng);
            overlay.setPosition(latlng);
            onCoordinatesChange(newLat, newLng);
          });
        }
      } else {
        const map = mapInstanceRef.current;
        map.relayout();
        map.setCenter(position);
        if (markerInstanceRef.current) markerInstanceRef.current.setPosition(position);
        if (overlayInstanceRef.current) {
          overlayInstanceRef.current.setPosition(position);
          overlayInstanceRef.current.setContent(`
            <div style="padding:6px 12px;font-size:12px;font-weight:700;color:#191919;border-radius:20px;background:#FEE500;box-shadow:0 3px 10px rgba(0,0,0,0.25);border:1px solid #e5ce00;white-space:nowrap;display:flex;align-items:center;gap:4px;">
              <span>📍 ${placeName}</span>
            </div>
          `);
        }
      }
    } catch {
      // Map render fallback handled by state
    }
  }, [isLoaded, latitude, longitude, placeName, onCoordinatesChange]);

  const directMapUrl = kakaoMapUrl || buildKakaoMapUrl(placeName, latitude, longitude, address);
  const directionsUrl = buildKakaoMapDirectionsUrl(placeName, latitude, longitude);

  return (
    <div className='bg-card space-y-4 rounded-xl border p-5 shadow-2xs'>
      <div className='flex items-center justify-between border-b pb-3'>
        <div className='flex items-center gap-2'>
          <div className='flex h-5 w-5 items-center justify-center rounded-sm bg-[#FEE500] text-[10px] font-black text-[#191919]'>
            K
          </div>
          <h4 className='text-foreground text-xs font-bold'>
            {tContent('contact_map.preview_title', '카카오맵 인터랙티브 뷰 (Kakao Map Interactive View)')}
          </h4>
        </div>

        <div className='flex items-center gap-2'>
          <Badge variant='outline' className='font-mono text-[10px]'>
            Lat: {latitude}, Lng: {longitude}
          </Badge>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            className='h-6 gap-1 px-2 text-[11px] text-amber-600 hover:text-amber-700 dark:text-amber-400'
            onClick={() => window.open(directMapUrl, '_blank')}>
            <ExternalLink className='h-3 w-3' />
            카카오맵 크게보기
          </Button>
        </div>
      </div>

      {/* Kakao Map Canvas */}
      <div className='relative h-80 w-full overflow-hidden rounded-2xl border bg-slate-950 shadow-inner sm:h-96'>
        {/* Real SDK Kakao Map mount */}
        <div ref={mapContainerRef} className={`h-full w-full ${hasError ? 'hidden' : 'block'}`} />

        {/* Fallback Graphic UI if SDK not loaded or offline */}
        {hasError && (
          <div className='absolute inset-0 flex flex-col items-center justify-center space-y-4 bg-slate-950 p-6 text-center text-white'>
            <div className='absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-30' />
            <div className='relative z-10 flex flex-col items-center space-y-3'>
              <div className='flex h-14 w-14 items-center justify-center rounded-full bg-[#FEE500] text-[#191919] shadow-lg'>
                <MapPin className='h-7 w-7' />
              </div>
              <div className='space-y-1'>
                <h5 className='text-base font-bold text-white'>{placeName}</h5>
                <p className='text-xs text-slate-300'>{address}</p>
              </div>
              <div className='flex gap-2 pt-2'>
                <Button
                  type='button'
                  size='sm'
                  onClick={() => window.open(directionsUrl, '_blank')}
                  className='h-8 gap-1.5 bg-[#FEE500] text-xs font-bold text-[#191919] hover:bg-[#ebd300]'>
                  <Navigation className='h-3.5 w-3.5' />
                  카카오맵 길찾기
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KakaoMapView;
