import { DateRangePicker } from '@/components/date-picker/DateRangePicker';
import FilterContainer from '@/components/FilterContainer';
import FormItem from '@/components/form/FormItem';
import AppSelect from '@/components/select/AppSelect';
import { Input } from '@/components/ui/input';
import useDebounce from '@/hooks/useDebounce';
import type { SortOrder } from '@/utils/enums/common.enum';
import { FileType, type FileUploadedSortBy } from '@/utils/enums/file.enum';
import { useMemo, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { useTranslation } from 'react-i18next';

export type UploadedImageFilterValues = {
  name: string;
  type?: string;
  author_id?: number | null;
  period_from?: DateRange;
  period_to?: DateRange;
  sort_by?: FileUploadedSortBy;
  sort_order?: SortOrder;
  page: number;
  per_page: number;
};

export const DEFAULT_UPLOADED_IMAGE_FILTER: UploadedImageFilterValues = {
  name: '',
  type: undefined,
  author_id: null,
  period_from: undefined,
  period_to: undefined,
  sort_by: undefined,
  sort_order: undefined,
  page: 1,
  per_page: 10,
};

type Props = {
  onFilterChange: (filter: UploadedImageFilterValues) => void;
};

const UploadedImageFilter = ({ onFilterChange }: Props) => {
  const { t: tCommon } = useTranslation('common');
  const { t: tContent } = useTranslation('content');
  const { t: tEnum } = useTranslation('enum');
  const [filter, setFilter] = useState<UploadedImageFilterValues>(DEFAULT_UPLOADED_IMAGE_FILTER);

  useDebounce(filter, onFilterChange);

  const categoryOptions = useMemo(
    () => Object.values(FileType).map((v) => ({ value: v, label: tEnum(`content.${v}` as any) as string })),
    [tEnum],
  );

  const handleReset = () => {
    setFilter(DEFAULT_UPLOADED_IMAGE_FILTER);
    onFilterChange(DEFAULT_UPLOADED_IMAGE_FILTER);
  };

  return (
    <FilterContainer onResetFilter={handleReset}>
      <div className='grid grid-cols-3 gap-x-4 gap-y-4'>
        <FormItem label={tContent('filter.name')}>
          <Input
            placeholder={tContent('filter.ph_search_file')}
            value={filter.name}
            onChange={(e) => setFilter((prev) => ({ ...prev, name: e.target.value }))}
          />
        </FormItem>
        <FormItem label={tContent('filter.category')}>
          <AppSelect
            options={categoryOptions}
            value={filter.type}
            onChange={(v) => setFilter((prev) => ({ ...prev, type: v || undefined }))}
            placeholder={tContent('filter.ph_all_categories')}
            showSearch
          />
        </FormItem>
        {/* <FormItem label={tContent('filter.registrant')}>
          <Input
            type='number'
            min={1}
            placeholder={tContent('filter.ph_all_registrants')}
            value={filter.author_id ?? ''}
            onChange={(e) =>
              setFilter((prev) => ({
                ...prev,
                author_id: e.target.value ? Number(e.target.value) : null,
              }))
            }
          />
        </FormItem> */}
        <FormItem label={tContent('filter.upload_date')}>
          <DateRangePicker
            value={filter.period_from}
            onChange={(v) => setFilter((prev) => ({ ...prev, period_from: v, period_to: v }))}
            placeholder={tCommon('filter.pick_date_range')}
          />
        </FormItem>
      </div>
    </FilterContainer>
  );
};

export default UploadedImageFilter;
