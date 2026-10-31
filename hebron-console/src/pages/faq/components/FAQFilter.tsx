import { DateRangePicker } from '@/components/date-picker/DateRangePicker';
import FilterContainer from '@/components/FilterContainer';
import FormItem from '@/components/form/FormItem';
import AppSelect from '@/components/select/AppSelect';
import { Input } from '@/components/ui/input';
import { useFAQCategoryListQuery } from '@/data/faq/faq.query';
import type { FAQListREQ } from '@/data/faq/faq.request';
import useDebounce from '@/hooks/useDebounce';
import { DATE_FORMAT } from '@/utils/constants/date.constant';
import { PostingStatus, SiteType } from '@/utils/enums/common.enum';
import { ExposureTarget, FAQ_SITE_TYPES } from '@/utils/enums/content.enum';
import dayjs from 'dayjs';
import { useCallback, useMemo, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { useTranslation } from 'react-i18next';

type FAQFilterProps = {
  filter: FAQListREQ;
  handleFilterChange: (filter: Partial<FAQListREQ>) => void;
};

const FAQFilter = ({ filter, handleFilterChange }: FAQFilterProps) => {
  const { t: tCommon } = useTranslation('common');
  const { t: tContent } = useTranslation('content');
  const { t: tEnum } = useTranslation('enum');

  const [title, setTitle] = useState(filter.title || '');
  const [authorId, setAuthorId] = useState(filter.author_id ? String(filter.author_id) : '');
  const [period, setPeriod] = useState<DateRange | undefined>(() => {
    if (!filter.registration_date_from && !filter.registration_date_to) return undefined;
    return {
      from: filter.registration_date_from ? dayjs(filter.registration_date_from).toDate() : undefined,
      to: filter.registration_date_to ? dayjs(filter.registration_date_to).toDate() : undefined,
    };
  });

  const { data: categories = [] } = useFAQCategoryListQuery();
  const categoryOptions = useMemo(
    () =>
      categories.map(({ slug, name }) => ({
        value: slug || name,
        label: name,
      })),
    [categories],
  );
  const siteTypeOptions = useMemo(() => FAQ_SITE_TYPES.map((v) => ({ value: v, label: tEnum(`common.${v}`) })), [tEnum]);

  const handleSiteTypeChange = (siteType: SiteType | undefined) => {
    handleFilterChange({ site_type: siteType });
  };
  const statusOptions = useMemo(
    () => Object.values(PostingStatus).map((v) => ({ value: v, label: tEnum(`common.${v}`) })),
    [tEnum],
  );
  const targetOptions = useMemo(
    () => Object.values(ExposureTarget).map((v) => ({ value: v, label: tEnum(`content.${v}`) })),
    [tEnum],
  );

  const handleTitleChange = useCallback(
    (value: string) => handleFilterChange({ title: value || undefined }),
    [handleFilterChange],
  );

  const handleAuthorIdChange = useCallback(
    (value: string) => {
      const parsed = Number(value);
      handleFilterChange({ author_id: value && !Number.isNaN(parsed) ? parsed : undefined });
    },
    [handleFilterChange],
  );

  useDebounce(title, handleTitleChange);
  useDebounce(authorId, handleAuthorIdChange);

  const handlePeriodChange = (value: DateRange | undefined) => {
    setPeriod(value);
    handleFilterChange({
      registration_date_from: value?.from ? dayjs(value.from).format(DATE_FORMAT) : undefined,
      registration_date_to: value?.to ? dayjs(value.to).format(DATE_FORMAT) : undefined,
    });
  };

  const handleReset = () => {
    setTitle('');
    setAuthorId('');
    setPeriod(undefined);
    handleFilterChange({
      title: undefined,
      faq_category: undefined,
      author_id: undefined,
      posting_status: undefined,
      exposure_target: undefined,
      site_type: undefined,
      registration_date_from: undefined,
      registration_date_to: undefined,
    });
  };

  return (
    <FilterContainer onResetFilter={handleReset}>
      <div className='grid grid-cols-3 gap-x-4 gap-y-4'>
        <FormItem label={tContent('filter.search')}>
          <Input placeholder={tContent('filter.ph_search_question')} value={title} onChange={(e) => setTitle(e.target.value)} />
        </FormItem>
        <FormItem label={tContent('filter.site_type')}>
          <AppSelect
            options={siteTypeOptions}
            value={filter.site_type}
            placeholder={tContent('filter.ph_all_site_types')}
            onChange={(value) => handleSiteTypeChange(value as SiteType | undefined)}
          />
        </FormItem>
        <FormItem label={tContent('filter.category')}>
          <AppSelect
            options={categoryOptions}
            value={filter.faq_category}
            placeholder={tContent('filter.ph_all_categories')}
            onChange={(category) => handleFilterChange({ faq_category: category })}
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
        <FormItem label={tContent('filter.status')}>
          <AppSelect
            options={statusOptions}
            value={filter.posting_status}
            placeholder={tContent('filter.ph_all_statuses')}
            onChange={(value) => handleFilterChange({ posting_status: value as PostingStatus | undefined })}
          />
        </FormItem>
        {/* <FormItem label={tContent('filter.exposure_target')}>
          <AppSelect
            options={targetOptions}
            value={filter.exposure_target}
            placeholder={tContent('filter.ph_all_targets')}
            onChange={(value) => handleFilterChange({ exposure_target: value as ExposureTarget | undefined })}
          />
        </FormItem> */}
        <FormItem label={tContent('filter.registration_date')}>
          <DateRangePicker value={period} onChange={handlePeriodChange} placeholder={tCommon('filter.pick_date_range')} />
        </FormItem>
      </div>
    </FilterContainer>
  );
};

export default FAQFilter;
