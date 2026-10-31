import { DaumPostcodeDialog, type SelectedPostcodeAddress } from '@/components/dialog/DaumPostcodeDialog';
import { appToast } from '@/components/toast/AppToast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAddressGeocodeMutation } from '@/data/address/address.query';
import { normalizeAddressGeocode } from '@/data/address/address.service';
import type { UpdatePageSectionREQ } from '@/data/homepage-management/homepage.request';
import { buildContactMapUpdatePayload, normalizeContactMapData } from '@/data/homepage-management/homepage.service';
import type { ContactMapInput, MallSection } from '@/data/homepage-management/homepage.type';
import { buildKakaoMapUrl } from '@/utils/helper/kakao-map.helper';
import { ExternalLink, Loader2, MapPin, Navigation, Search } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSectionActionLoading } from '../../hooks/useSectionActionLoading';
import KakaoMapView from '../ui/KakaoMapView';
import SectionHeader from '../ui/SectionHeader';
import SectionHeadingDescription from '../ui/SectionHeadingDescription';

type Props = {
  section?: MallSection;
  onSaveSection?: (payload?: Partial<UpdatePageSectionREQ>) => Promise<any> | void;
};

export const ContactMapEditor: React.FC<Props> = ({ section, onSaveSection }) => {
  const { t: tContent } = useTranslation('content');
  const { t: tCommon } = useTranslation('common');

  const normalized = useMemo(() => normalizeContactMapData(section), [section]);

  const [heading, setHeading] = useState(normalized.heading ?? '오시는 길');
  const [description, setDescription] = useState(
    normalized.description ?? '헤브론 본사 및 쇼룸으로 오시는 길을 안내해 드립니다.',
  );
  const placeName = normalized.place_name || normalized.company_name || '(주)헤브론 쇼룸';
  const [address, setAddress] = useState(normalized.address || '서울특별시 중구 마른내로 72 (인현동2가) 신일빌딩 3층');
  const [latitude, setLatitude] = useState<number | undefined>(normalized.latitude ?? 37.5645);
  const [longitude, setLongitude] = useState<number | undefined>(normalized.longitude ?? 126.9972);
  const [kakaoMapUrl, setKakaoMapUrl] = useState(
    normalized.kakao_map_url || normalized.map_link || 'https://map.kakao.com/link/map/헤브론,37.5645,126.9972',
  );

  const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);

  const { mutateAsync: geocodeAddress, isPending: isGeocodingAddress } = useAddressGeocodeMutation();
  const { isLoadingTarget, runWithLoading } = useSectionActionLoading<'save_contact_map'>();

  const handleCoordinatesChange = (newLat: number, newLng: number) => {
    setLatitude(newLat);
    setLongitude(newLng);
    setKakaoMapUrl(buildKakaoMapUrl(placeName, newLat, newLng, address));
  };

  const handleSelectAddress = async (selected: SelectedPostcodeAddress) => {
    const fullAddr = selected.fullAddress || selected.roadAddress;
    setAddress(fullAddr);
    try {
      const resp = await geocodeAddress({ address: fullAddr });
      const coords = normalizeAddressGeocode(resp.data);
      if (coords?.lat && coords?.lng) {
        const roundedLat = parseFloat(coords.lat.toFixed(6));
        const roundedLng = parseFloat(coords.lng.toFixed(6));
        setLatitude(roundedLat);
        setLongitude(roundedLng);
        setKakaoMapUrl(buildKakaoMapUrl(placeName, roundedLat, roundedLng, fullAddr));
        appToast.success(tContent('contact_map.geocode_success', '주소 검색 및 좌표가 업데이트되었습니다.'));
      } else {
        appToast.error(tContent('contact_map.geocode_failed', '좌표를 가져오지 못했습니다.'));
      }
    } catch {
      appToast.error(tContent('contact_map.geocode_failed', '좌표 변환 중 오류가 발생했습니다.'));
    }
  };

  const handleSaveAll = () => {
    const updatedInput: ContactMapInput = {
      heading,
      description,
      place_name: placeName,
      company_name: placeName,
      address,
      latitude,
      longitude,
    };
    return runWithLoading('save_contact_map', () => onSaveSection?.(buildContactMapUpdatePayload(updatedInput, section)));
  };

  return (
    <div className='space-y-6'>
      {/* Top Header & Save Action */}
      <SectionHeader
        title={section?.name || tContent('contact_map.title', '오시는 길 (카카오맵 / Kakao Map)')}
        icon={MapPin}
        badgeText='kakao_map'
        onSave={handleSaveAll}
        isSaving={isLoadingTarget('save_contact_map')}
      />

      {/* Section Title & Subtitle */}
      <SectionHeadingDescription
        heading={heading}
        onChangeHeading={setHeading}
        headingLabel={tContent('homepage.section_heading', '섹션 제목 (Heading)')}
        descriptionLabel={tContent('homepage.section_description', '섹션 설명 (Description)')}
        headingPlaceholder='오시는 길'
        description={description}
        onChangeDescription={setDescription}
        descriptionPlaceholder='헤브론 본사 및 쇼룸으로 오시는 길을 안내해 드립니다.'
        descriptionRows={2}
      />

      {/* Map Settings & Controls */}
      <div className='bg-card space-y-4 rounded-xl border p-5 shadow-2xs'>
        <div className='flex items-center justify-between border-b pb-3'>
          <div className='flex items-center gap-2'>
            <div className='flex h-6 w-6 items-center justify-center rounded-md bg-[#FEE500] text-xs font-black text-[#191919] shadow-2xs'>
              K
            </div>
            <h4 className='text-foreground text-xs font-bold'>
              {tContent('contact_map.kakao_settings', '카카오맵 설정 (Kakao Map Settings)')}
            </h4>
          </div>
        </div>

        <div className='space-y-4 text-xs'>
          {/* Address Search via Daum Postcode */}
          <div className='space-y-1.5'>
            <label className='text-foreground flex items-center gap-1.5 font-semibold'>
              <MapPin className='text-primary h-3.5 w-3.5' />
              {tContent('contact_map.address', '도로명 / 지번 주소 (Address)')}
            </label>
            <div className='flex gap-2'>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder='서울특별시 중구 마른내로 72 (인현동2가) 신일빌딩 3층'
                className='h-8 text-xs'
              />
              <Button
                type='button'
                variant='outline'
                size='sm'
                disabled={isGeocodingAddress}
                onClick={() => setIsPostcodeOpen(true)}
                className='h-8 shrink-0 gap-1.5 px-3 text-xs text-amber-600 hover:text-amber-700 dark:text-amber-400'>
                {isGeocodingAddress ? <Loader2 className='h-3.5 w-3.5 animate-spin' /> : <Search className='h-3.5 w-3.5' />}
                {tContent('contact_map.search_postcode', '우편번호 검색')}
              </Button>
            </div>
          </div>

          {/* Coordinates (Latitude & Longitude) */}
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div className='space-y-1.5'>
              <label className='text-foreground flex items-center gap-1.5 font-semibold'>
                <MapPin className='text-primary h-3.5 w-3.5' />
                {tContent('contact_map.latitude', '위도 (Latitude)')}
              </label>
              <Input
                type='number'
                step='any'
                value={latitude !== undefined ? latitude : ''}
                onChange={(e) => setLatitude(e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder='37.5645'
                className='h-8 font-mono text-xs'
              />
            </div>

            <div className='space-y-1.5'>
              <label className='text-foreground flex items-center gap-1.5 font-semibold'>
                <MapPin className='text-primary h-3.5 w-3.5' />
                {tContent('contact_map.longitude', '경도 (Longitude)')}
              </label>
              <Input
                type='number'
                step='any'
                value={longitude !== undefined ? longitude : ''}
                onChange={(e) => setLongitude(e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder='126.9972'
                className='h-8 font-mono text-xs'
              />
            </div>
          </div>

          {/* Kakao Map Link URL */}
          <div className='space-y-1.5'>
            <label className='text-foreground flex items-center gap-1.5 font-semibold'>
              <Navigation className='text-primary h-3.5 w-3.5' />
              {tContent('contact_map.kakao_map_url', '카카오맵 바로가기 URL')}
            </label>
            <div className='flex gap-2'>
              <Input
                value={kakaoMapUrl}
                onChange={(e) => setKakaoMapUrl(e.target.value)}
                placeholder='https://map.kakao.com/link/map/헤브론,37.5645,126.9972'
                className='h-8 font-mono text-xs'
              />
              {kakaoMapUrl && (
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  className='h-8 gap-1 px-3 text-xs'
                  onClick={() => window.open(kakaoMapUrl, '_blank')}>
                  <ExternalLink className='h-3.5 w-3.5' />
                  {tCommon('button.open', '열기')}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Kakao Map SDK View */}
      <KakaoMapView
        latitude={latitude}
        longitude={longitude}
        placeName={placeName}
        address={address}
        kakaoMapUrl={kakaoMapUrl}
        onCoordinatesChange={handleCoordinatesChange}
      />

      {/* Daum Postcode Modal */}
      <DaumPostcodeDialog open={isPostcodeOpen} onOpenChange={setIsPostcodeOpen} onSelectAddress={handleSelectAddress} />
    </div>
  );
};

export default ContactMapEditor;
