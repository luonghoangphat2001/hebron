import { DateRangePicker } from '@/components/date-picker/DateRangePicker';
import FilterContainer from '@/components/FilterContainer';
import FormItem from '@/components/form/FormItem';
import AppSelect from '@/components/select/AppSelect';
import { Input } from '@/components/ui/input';
import useDebounce from '@/hooks/useDebounce';
import { ExposureStatus, SortOrder } from '@/utils/enums/common.enum';
import { PopupLocation, PopupSort } from '@/utils/enums/popup.enum';
import { useMemo, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { useTranslation } from 'react-i18next';

export type PopupFilterValues = {
  popup_name: string;
  exposure_location: PopupLocation | undefined;
  status: ExposureStatus | undefined;
  period_from: DateRange | undefined;
  period_to: DateRange | undefined;
  registrant_id?: number | null;
  exposure_period_from: DateRange | undefined;
  exposure_period_to: DateRange | undefined;
  sort_by?: PopupSort;
  sort_order?: SortOrder;
  page: number;
  per_page: number;
};

export const DEFAULT_POPUP_FILTER: PopupFilterValues = {
  popup_name: '',
  exposure_location: undefined,
  status: undefined,
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

type Props = { onFilterChange: (filter: PopupFilterValues) => void };

const PopupFilter = ({ onFilterChange }: Props) => {
  const { t: tCommon } = useTranslation('common');
  const { t: tContent } = useTranslation('content');
  const { t: tEnum } = useTranslation('enum');
  const [filter, setFilter] = useState<PopupFilterValues>(DEFAULT_POPUP_FILTER);

  useDebounce(filter, onFilterChange);

  const exposureStatusOptions = useMemo(
    () => Object.values(ExposureStatus).map((v) => ({ value: v, label: tEnum(`common.${v}`) })),
    [tEnum],
  );

  const locationOptions = useMemo(
    () => Object.values(PopupLocation).map((v) => ({ value: v, label: tEnum(`content.${v}`) })),
    [tEnum],
  );

  const handleReset = () => {
    setFilter(DEFAULT_POPUP_FILTER);
    onFilterChange(DEFAULT_POPUP_FILTER);
  };

  return (
    <FilterContainer onResetFilter={handleReset}>
      <div className='grid grid-cols-3 gap-x-4 gap-y-4'>
        <FormItem label={tContent('filter.name')}>
          <Input
            placeholder={tContent('filter.ph_search_popup')}
            value={filter.popup_name}
            onChange={(e) => setFilter((prev) => ({ ...prev, popup_name: e.target.value }))}
          />
        </FormItem>
        <FormItem label={tContent('filter.exposure_status')}>
          <AppSelect
            options={exposureStatusOptions}
            value={filter.status}
            onChange={(v) => setFilter((prev) => ({ ...prev, status: v as ExposureStatus | undefined }))}
            placeholder={tContent('filter.ph_all_statuses')}
          />
        </FormItem>
        {/* <FormItem label={tContent('filter.location')}>
          <AppSelect
            options={locationOptions}
            value={filter.exposure_location}
            onChange={(v) => setFilter((prev) => ({ ...prev, exposure_location: v as PopupLocation | undefined }))}
            placeholder={tContent('filter.ph_all_locations')}
          />
        </FormItem>
        <FormItem label={tContent('filter.registrant')}>
          <Input
            placeholder={tContent('filter.ph_all_registrants')}
            type='number'
            value={filter.registrant_id || ''}
            onChange={(e) => setFilter((prev) => ({ ...prev, registrant_id: Number(e.target.value) }))}
          />
        </FormItem>
        <FormItem label={tContent('filter.registration_date')}>
          <DateRangePicker
            value={filter.period_from}
            onChange={(v) => setFilter((prev) => ({ ...prev, period_from: v, period_to: v }))}
            placeholder={tCommon('filter.pick_date_range')}
          />
        </FormItem> */}
        <FormItem label={tContent('filter.display_period')}>
          <DateRangePicker
            value={filter.exposure_period_from}
            onChange={(v) => setFilter((prev) => ({ ...prev, exposure_period_from: v, exposure_period_to: v }))}
            placeholder={tCommon('filter.pick_date_range')}
          />
        </FormItem>
      </div>
    </FilterContainer>
  );
};

export default PopupFilter;
