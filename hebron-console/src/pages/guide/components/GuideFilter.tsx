import FilterContainer from '@/components/FilterContainer';
import FormItem from '@/components/form/FormItem';
import AppSelect from '@/components/select/AppSelect';
import { Input } from '@/components/ui/input';
import { useAdminListQuery } from '@/data/admin/admin.query';
import type { GuideListREQ } from '@/data/guide/guide.request';
import useDebounce from '@/hooks/useDebounce';
import { PostingStatus } from '@/utils/enums/common.enum';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

type GuideFilterProps = {
  filter: GuideListREQ;
  handleFilterChange: (filter: Partial<GuideListREQ>) => void;
};

const GuideFilter = ({ filter, handleFilterChange }: GuideFilterProps) => {
  const { t: tContent } = useTranslation('content');
  const { t: tEnum } = useTranslation('enum');

  const [searchTerm, setSearchTerm] = useState(filter.search_term || '');

  const { data: adminData } = useAdminListQuery({ page: 1, per_page: 10 });
  const authorOptions = useMemo(() => (adminData?.list || []).map((user) => ({ value: user.id, label: user.name })), [adminData]);

  const statusOptions = useMemo(
    () => Object.values(PostingStatus).map((v) => ({ value: v, label: tEnum(`common.${v}`) })),
    [tEnum],
  );

  const handleSearchChange = useCallback(
    (value: string) => handleFilterChange({ search_term: value || undefined }),
    [handleFilterChange],
  );

  useDebounce(searchTerm, handleSearchChange);

  const handleReset = () => {
    setSearchTerm('');
    handleFilterChange({
      search_term: undefined,
      author_id: undefined,
      exposure_status: undefined,
    });
  };

  return (
    <FilterContainer onResetFilter={handleReset}>
      <div className='grid grid-cols-3 gap-x-4 gap-y-4'>
        <FormItem label={tContent('filter.search')}>
          <Input
            placeholder={tContent('filter.ph_search_title_content')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </FormItem>
        <FormItem label={tContent('filter.author')}>
          <AppSelect<number>
            options={authorOptions}
            value={filter.author_id}
            showSearch
            placeholder={tContent('filter.ph_all_authors')}
            onChange={(value) => handleFilterChange({ author_id: value })}
          />
        </FormItem>
        <FormItem label={tContent('filter.exposure_status')}>
          <AppSelect
            options={statusOptions}
            value={filter.exposure_status}
            placeholder={tContent('filter.ph_all_statuses')}
            onChange={(value) => handleFilterChange({ exposure_status: value as PostingStatus | undefined })}
          />
        </FormItem>
      </div>
    </FilterContainer>
  );
};

export default GuideFilter;
