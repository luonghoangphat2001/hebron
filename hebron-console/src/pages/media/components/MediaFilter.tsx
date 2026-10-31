import FilterContainer from '@/components/FilterContainer';
import FormItem from '@/components/form/FormItem';
import AppSelect from '@/components/select/AppSelect';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
// import { Separator } from '@/components/ui/separator';
import { useMediaCategoryListQuery } from '@/data/media/media.query';
import type { MediaListREQ } from '@/data/media/media.request';
import { DEFAULT_MEDIA_SITE_TYPE } from '@/data/media/media.service';
import useDebounce from '@/hooks/useDebounce';
// import { SiteType } from '@/utils/enums/common.enum';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  filter: MediaListREQ;
  handleFilterChange: (filter: Partial<MediaListREQ>) => void;
};

const MediaFilter = ({ filter, handleFilterChange }: Props) => {
  const { t: tContent } = useTranslation('content');
  const { t: tEnum } = useTranslation('enum');

  const [keyword, setKeyword] = useState(filter.keyword || '');

  const { data: categories = [], isLoading: isCategoryLoading } = useMediaCategoryListQuery();

  // const siteTypeOptions = useMemo(
  // () => Object.values(SiteType).map((v) => ({ value: v, label: tEnum(`common.${v}` as 'common.BRAND_SITE') })),
  // [tEnum],
  // );
  const categoryOptions = useMemo(() => categories.map((c) => ({ value: c.id, label: c.name })), [categories]);
  const statusOptions = useMemo(
    () => [
      { value: 'true', label: tEnum('common.ACTIVE') },
      { value: 'false', label: tEnum('common.INACTIVE') },
    ],
    [tEnum],
  );

  const handleKeywordChange = useCallback(
    (value: string) => handleFilterChange({ keyword: value || undefined }),
    [handleFilterChange],
  );
  useDebounce(keyword, handleKeywordChange);

  const handleReset = () => {
    setKeyword('');
    handleFilterChange({
      keyword: undefined,
      site_type: DEFAULT_MEDIA_SITE_TYPE,
      category_id: undefined,
      is_active: undefined,
    });
  };

  return (
    <FilterContainer onResetFilter={handleReset}>
      <div className='space-y-4'>
        {/* <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
          <FormItem label={tContent('filter.site_type')}>
            <AppSelect
              options={siteTypeOptions}
              value={filter.site_type || DEFAULT_MEDIA_SITE_TYPE}
              clearable={false}
              onChange={(value) => handleFilterChange({ site_type: value as SiteType, category_id: undefined })}
            />
          </FormItem>
        </div>

        <Separator /> */}

        <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
          <FormItem label={tContent('filter.search')}>
            <Input placeholder={tContent('media.ph_search')} value={keyword} onChange={(e) => setKeyword(e.target.value)} />
          </FormItem>
          <FormItem label={tContent('filter.category')}>
            {isCategoryLoading ? (
              <Skeleton className='h-9 w-full rounded-md' />
            ) : (
              <AppSelect
                options={categoryOptions}
                value={filter.category_id}
                placeholder={tContent('filter.ph_all_categories')}
                onChange={(value) => handleFilterChange({ category_id: value })}
              />
            )}
          </FormItem>
          <FormItem label={tContent('filter.status')}>
            <AppSelect
              options={statusOptions}
              value={filter.is_active === undefined ? undefined : String(filter.is_active)}
              placeholder={tContent('filter.ph_all_statuses')}
              onChange={(value) => handleFilterChange({ is_active: value === undefined ? undefined : value === 'true' })}
            />
          </FormItem>
        </div>
      </div>
    </FilterContainer>
  );
};

export default MediaFilter;
