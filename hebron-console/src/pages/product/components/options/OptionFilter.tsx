import FilterContainer from '@/components/FilterContainer';
import FormItem from '@/components/form/FormItem';
import AppSelect from '@/components/select/AppSelect';
import { Input } from '@/components/ui/input';
import useDebounce from '@/hooks/useDebounce';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export type OptionFilterValues = {
  name?: string;
  is_active?: boolean;
};

type Props = {
  filter: OptionFilterValues;
  handleFilterChange: (patch: Partial<OptionFilterValues>) => void;
};

const OptionFilter = ({ filter, handleFilterChange }: Props) => {
  const { t } = useTranslation('option');
  const [name, setName] = useState(filter.name || '');

  const activeOptions = useMemo(
    () => [
      { value: 'true', label: t('option.modal.active') },
      { value: 'false', label: t('option.modal.inactive') },
    ],
    [t],
  );

  const handleNameChange = useCallback((value: string) => handleFilterChange({ name: value || undefined }), [handleFilterChange]);

  useDebounce(name, handleNameChange);

  const handleReset = () => {
    setName('');
    handleFilterChange({ name: undefined, is_active: undefined });
  };

  return (
    <FilterContainer onResetFilter={handleReset}>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <FormItem label={t('option.filter.name')}>
          <Input placeholder={t('option.filter.name_placeholder')} value={name} onChange={(e) => setName(e.target.value)} />
        </FormItem>
        <FormItem label={t('option.filter.status')}>
          <AppSelect
            options={activeOptions}
            value={filter.is_active === undefined ? undefined : String(filter.is_active)}
            onChange={(v) => handleFilterChange({ is_active: v === undefined ? undefined : v === 'true' })}
            placeholder={t('option.filter.all')}
          />
        </FormItem>
      </div>
    </FilterContainer>
  );
};

export default OptionFilter;
