import FilterContainer from '@/components/FilterContainer';
import FormItem from '@/components/form/FormItem';
import AppSelect from '@/components/select/AppSelect';
import { Input } from '@/components/ui/input';
import type { AdminListREQ } from '@/data/admin/admin.request';
import useDebounce from '@/hooks/useDebounce';
import { Status } from '@/utils/enums/common.enum';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

type AdministratorFilterProps = {
  filter: AdminListREQ;
  handleFilterChange: (filter: AdminListREQ) => void;
};

const AdministratorFilter = ({ filter, handleFilterChange }: AdministratorFilterProps) => {
  const { t: tEnum } = useTranslation('enum');
  const { t: tCommon } = useTranslation('common');
  const [searchTerm, setSearchTerm] = useState(filter.search_term || '');
  const statusOptions = useMemo(
    () => Object.values(Status).map((item) => ({ value: item, label: tEnum(`common.${item.toUpperCase()}` as any) })),
    [tEnum],
  );

  const handleSearchChange = useCallback(
    (value: string) => handleFilterChange({ search_term: value || undefined }),
    [handleFilterChange],
  );

  useDebounce(searchTerm, handleSearchChange);

  const handleReset = () => {
    setSearchTerm('');
    handleFilterChange({ search_term: undefined, status: undefined });
  };

  return (
    <FilterContainer onResetFilter={handleReset}>
      <div className='grid grid-cols-3 gap-x-4 gap-y-4'>
        <FormItem label={tCommon('title.search_term')}>
          <Input
            placeholder={tCommon('placeholder.search_by_name_phone_email')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </FormItem>
        <FormItem label={tCommon('title.status')}>
          <AppSelect options={statusOptions} value={filter.status} onChange={(value) => handleFilterChange({ status: value })} />
        </FormItem>
      </div>
    </FilterContainer>
  );
};

export default AdministratorFilter;
