import FilterContainer from '@/components/FilterContainer';
import FormItem from '@/components/form/FormItem';
import AppSelect from '@/components/select/AppSelect';
import { Input } from '@/components/ui/input';
import type { PermissionListREQ } from '@/data/permission/permission.request';
import useDebounce from '@/hooks/useDebounce';
import { STATUS_ENUM_KEY } from '@/utils/constants/common.constant';
import { Status } from '@/utils/enums/common.enum';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

type PermissionFilterProps = {
  filter: PermissionListREQ;
  handleFilterChange: (filter: Partial<PermissionListREQ>) => void;
};

const PermissionFilter = ({ filter, handleFilterChange }: PermissionFilterProps) => {
  const { t: tPermission } = useTranslation('system');
  const { t: tEnum } = useTranslation('enum');
  const [search, setSearch] = useState(filter.search || '');

  const statusOptions = useMemo(
    () => Object.values(Status).map((item) => ({ value: item, label: tEnum(STATUS_ENUM_KEY[item]) })),
    [tEnum],
  );

  const handleSearchChange = useCallback(
    (value: string) => handleFilterChange({ search: value || undefined }),
    [handleFilterChange],
  );
  useDebounce(search, handleSearchChange);

  const handleReset = () => {
    setSearch('');
    handleFilterChange({ search: undefined, usage_status: undefined });
  };

  return (
    <FilterContainer onResetFilter={handleReset}>
      <div className='grid grid-cols-3 gap-x-4 gap-y-4'>
        <FormItem label={tPermission('permission.field.search')}>
          <Input
            placeholder={tPermission('permission.placeholder.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </FormItem>
        <FormItem label={tPermission('permission.field.status')}>
          <AppSelect
            options={statusOptions}
            value={filter.usage_status}
            onChange={(v) => handleFilterChange({ usage_status: v as Status | undefined })}
            placeholder={tPermission('permission.placeholder.all_statuses')}
          />
        </FormItem>
      </div>
    </FilterContainer>
  );
};

export default PermissionFilter;
