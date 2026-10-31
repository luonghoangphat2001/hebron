import { DateRangePicker } from '@/components/date-picker/DateRangePicker';
import FilterContainer from '@/components/FilterContainer';
import FormItem from '@/components/form/FormItem';
import AppSelect from '@/components/select/AppSelect';
import { Input } from '@/components/ui/input';
import { getPagesBySiteType } from '@/data/banner/banner.service';
import useDebounce from '@/hooks/useDebounce';
import { BannerLocation, BannerSort } from '@/utils/enums/banner.enum';
import { ExposureStatus, PageType, SiteType, SortOrder } from '@/utils/enums/common.enum';
import { useCallback, useMemo, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { useTranslation } from 'react-i18next';

export type BannerFilterValues = {
  banner_name: string;
  exposure_location: BannerLocation | undefined;
  status: ExposureStatus | undefined;
  site_type: SiteType | undefined;
  page_type: PageType | undefined;
  period_from: DateRange | undefined;
  period_to: DateRange | undefined;
  registrant_id?: number | null;
  exposure_period_from: DateRange | undefined;
  exposure_period_to: DateRange | undefined;
  sort_by?: BannerSort | undefined;
  sort_order?: SortOrder | undefined;
  page: number;
  per_page: number;
};

export const DEFAULT_BANNER_FILTER: BannerFilterValues = {
  banner_name: '',
  exposure_location: undefined,
  status: undefined,
  site_type: undefined,
  page_type: undefined,
  period_from: undefined,
  period_to: undefined,
  registrant_id: null,
  exposure_period_from: undefined,
  exposure_period_to: undefined,
  sort_by: undefined,
  sort_order: undefined,
  page: 1,
  per_page: 10,
};

type BannerFilterProps = {
  filter: BannerFilterValues;
  handleFilterChange: (filter: Partial<BannerFilterValues>) => void;
};

const BannerFilter = ({ filter, handleFilterChange }: BannerFilterProps) => {
  const { t: tCommon } = useTranslation('common');
  const { t: tContent } = useTranslation('content');
  const { t: tEnum } = useTranslation('enum');

  const [bannerName, setBannerName] = useState(filter.banner_name || '');
  const [registrantId, setRegistrantId] = useState(
    filter.registrant_id !== null && filter.registrant_id !== undefined ? String(filter.registrant_id) : '',
  );

  const handleNameChange = useCallback((value: string) => handleFilterChange({ banner_name: value }), [handleFilterChange]);

  const handleRegistrantChange = useCallback(
    (value: string) => {
      const parsed = Number(value);
      handleFilterChange({ registrant_id: value && !Number.isNaN(parsed) ? parsed : null });
    },
    [handleFilterChange],
  );

  useDebounce(bannerName, handleNameChange);
  useDebounce(registrantId, handleRegistrantChange);

  const exposureStatusOptions = useMemo(
    () => Object.values(ExposureStatus).map((v) => ({ value: v, label: tEnum(`common.${v}`) })),
    [tEnum],
  );
  const locationOptions = useMemo(
    () => Object.values(BannerLocation).map((v) => ({ value: v, label: tEnum(`content.${v}`) })),
    [tEnum],
  );
  const siteTypeOptions = useMemo(() => Object.values(SiteType).map((v) => ({ value: v, label: tEnum(`common.${v}`) })), [tEnum]);

  const pageTypeOptions = useMemo(() => {
    if (!filter.site_type) return [];
    const pages = getPagesBySiteType(filter.site_type);
    return pages.map((v) => ({ value: v, label: tEnum(`content.${v}` as any) }));
  }, [filter.site_type, tEnum]);

  const handleSiteTypeChange = (siteType: SiteType | undefined) => {
    if (!siteType) {
      handleFilterChange({ site_type: undefined, page_type: undefined });
      return;
    }
    const validPages = getPagesBySiteType(siteType);
    const nextPageType = filter.page_type && validPages.includes(filter.page_type) ? filter.page_type : undefined;
    handleFilterChange({ site_type: siteType, page_type: nextPageType });
  };

  const handleReset = () => {
    setBannerName('');
    setRegistrantId('');
    handleFilterChange({
      banner_name: '',
      exposure_location: undefined,
      status: undefined,
      site_type: undefined,
      page_type: undefined,
      period_from: undefined,
      period_to: undefined,
      registrant_id: null,
      exposure_period_from: undefined,
      exposure_period_to: undefined,
    });
  };

  return (
    <FilterContainer onResetFilter={handleReset}>
      <div className='grid grid-cols-3 gap-x-4 gap-y-4'>
        <FormItem label={tContent('filter.name')}>
          <Input
            placeholder={tContent('filter.ph_search_name')}
            value={bannerName}
            onChange={(e) => setBannerName(e.target.value)}
          />
        </FormItem>
        <FormItem label={tContent('filter.site_type')}>
          <AppSelect
            options={siteTypeOptions}
            value={filter.site_type}
            onChange={(v) => handleSiteTypeChange(v as SiteType | undefined)}
            placeholder={tContent('filter.ph_all_site_types')}
          />
        </FormItem>
        <FormItem label={tContent('filter.page_type')}>
          <AppSelect
            options={pageTypeOptions}
            value={filter.page_type}
            onChange={(v) => handleFilterChange({ page_type: v as PageType | undefined })}
            placeholder={filter.site_type ? tContent('filter.ph_all_page_types') : tContent('filter.ph_select_site_type')}
            disabled={!filter.site_type}
          />
        </FormItem>
        <FormItem label={tContent('filter.exposure_status')}>
          <AppSelect
            options={exposureStatusOptions}
            value={filter.status}
            onChange={(v) => handleFilterChange({ status: v as ExposureStatus | undefined })}
            placeholder={tContent('filter.ph_all_statuses')}
          />
        </FormItem>
        {/* <FormItem label={tContent('filter.location')}>
          <AppSelect
            options={locationOptions}
            value={filter.exposure_location}
            onChange={(v) => handleFilterChange({ exposure_location: v as BannerLocation | undefined })}
            placeholder={tContent('filter.ph_all_locations')}
          />
        </FormItem> */}
        {/* <FormItem label={tContent('filter.registrant')}>
          <Input
            placeholder={tContent('filter.ph_all_registrants')}
            type='number'
            value={registrantId}
            onChange={(e) => setRegistrantId(e.target.value)}
          />
        </FormItem> */}
        <FormItem label={tContent('filter.registration_date')}>
          <DateRangePicker
            value={filter.period_from}
            onChange={(v) => handleFilterChange({ period_from: v, period_to: v })}
            placeholder={tCommon('filter.pick_date_range')}
          />
        </FormItem>
        <FormItem label={tContent('filter.display_period')}>
          <DateRangePicker
            value={filter.exposure_period_from}
            onChange={(v) => handleFilterChange({ exposure_period_from: v, exposure_period_to: v })}
            placeholder={tCommon('filter.pick_date_range')}
          />
        </FormItem>
      </div>
    </FilterContainer>
  );
};

export default BannerFilter;
