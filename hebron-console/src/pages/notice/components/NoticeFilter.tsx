import { DateRangePicker } from '@/components/date-picker/DateRangePicker';
import FilterContainer from '@/components/FilterContainer';
import FormItem from '@/components/form/FormItem';
import AppSelect from '@/components/select/AppSelect';
import { Input } from '@/components/ui/input';
import { useNoticeCategoryListQuery } from '@/data/notice/notice.query';
import type { NoticeListREQ } from '@/data/notice/notice.request';
import useDebounce from '@/hooks/useDebounce';
import { DATE_FORMAT } from '@/utils/constants/date.constant';
import { PostingStatus, SiteType } from '@/utils/enums/common.enum';
import { ExposureLocation } from '@/utils/enums/content.enum';
import dayjs from 'dayjs';
import { useCallback, useMemo, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { useTranslation } from 'react-i18next';

type NoticeFilterProps = {
  filter: NoticeListREQ;
  handleFilterChange: (filter: Partial<NoticeListREQ>) => void;
};

const NoticeFilter = ({ filter, handleFilterChange }: NoticeFilterProps) => {
  const { t: tCommon } = useTranslation('common');
  const { t: tContent } = useTranslation('content');
  const { t: tEnum } = useTranslation('enum');

  const [searchTerm, setSearchTerm] = useState(filter.search_term || '');
  const [authorId, setAuthorId] = useState(filter.author_id ? String(filter.author_id) : '');
  const [period, setPeriod] = useState<DateRange | undefined>(() => {
    if (!filter.exposure_start_date && !filter.exposure_end_date) return undefined;
    return {
      from: filter.exposure_start_date ? dayjs(filter.exposure_start_date).toDate() : undefined,
      to: filter.exposure_end_date ? dayjs(filter.exposure_end_date).toDate() : undefined,
    };
  });

  const { data: categories = [] } = useNoticeCategoryListQuery();
  const categoryOptions = useMemo(() => categories.map((c) => ({ value: c.id, label: c.name })), [categories]);

  const statusOptions = useMemo(
    () => Object.values(PostingStatus).map((v) => ({ value: v, label: tEnum(`common.${v}`) })),
    [tEnum],
  );

  const handleSearchChange = useCallback(
    (value: string) => handleFilterChange({ search_term: value || undefined }),
    [handleFilterChange],
  );

  const handleAuthorIdChange = useCallback(
    (value: string) => {
      const parsed = Number(value);
      handleFilterChange({ author_id: value && !Number.isNaN(parsed) ? parsed : undefined });
    },
    [handleFilterChange],
  );

  useDebounce(searchTerm, handleSearchChange);
  useDebounce(authorId, handleAuthorIdChange);

  const handlePeriodChange = (value: DateRange | undefined) => {
    setPeriod(value);
    handleFilterChange({
      exposure_start_date: value?.from ? dayjs(value.from).format(DATE_FORMAT) : undefined,
      exposure_end_date: value?.to ? dayjs(value.to).format(DATE_FORMAT) : undefined,
    });
  };

  const handleReset = () => {
    setSearchTerm('');
    setAuthorId('');
    setPeriod(undefined);
    handleFilterChange({
      search_term: undefined,
      category: undefined,
      author_id: undefined,
      site_type: SiteType.SHOPPING_MALL,
      exposure_status: undefined,
      exposure_location: ExposureLocation.MAIN,
      exposure_start_date: undefined,
      exposure_end_date: undefined,
    });
  };

  return (
    <FilterContainer onResetFilter={handleReset}>
      <div className='grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'>
        <FormItem label={tContent('filter.category')}>
          <AppSelect
            options={categoryOptions}
            value={filter.category}
            placeholder={tContent('filter.ph_select_category')}
            onChange={(value) => handleFilterChange({ category: value as number | undefined })}
          />
        </FormItem>
        <FormItem label={tContent('filter.search')}>
          <Input
            placeholder={tContent('filter.ph_search_title_content')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </FormItem>
        {/* <FormItem label={tContent('filter.author')}>
          <Input
            type='number'
            min={1}
            placeholder={tContent('filter.ph_author_id')}
            value={authorId}
            onChange={(e) => setAuthorId(e.target.value)}
          />
        </FormItem> */}
        <FormItem label={tContent('filter.exposure_status')}>
          <AppSelect
            options={statusOptions}
            value={filter.exposure_status}
            placeholder={tContent('filter.ph_all_statuses')}
            onChange={(value) => handleFilterChange({ exposure_status: value as PostingStatus | undefined })}
          />
        </FormItem>
        <FormItem label={tContent('filter.exposure_period')}>
          <DateRangePicker value={period} onChange={handlePeriodChange} placeholder={tCommon('filter.pick_date_range')} />
        </FormItem>
      </div>
    </FilterContainer>
  );
};

export default NoticeFilter;
