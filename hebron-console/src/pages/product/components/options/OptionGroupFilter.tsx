import FilterContainer from '@/components/FilterContainer';
import FormItem from '@/components/form/FormItem';
import AppSelect from '@/components/select/AppSelect';
import { Input } from '@/components/ui/input';
import type { OptionGroupListREQ } from '@/data/option-group/option-group.request';
import useDebounce from '@/hooks/useDebounce';
import { useOptionGroupDisplayTypeOptions } from '@/hooks/useOptionGroupDisplayTypeOptions';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  filter: OptionGroupListREQ;
  handleFilterChange: (patch: Partial<OptionGroupListREQ>) => void;
};

const OptionGroupFilter = ({ filter, handleFilterChange }: Props) => {
  const { t } = useTranslation('option');
  const [code, setCode] = useState(filter.code || '');
  const [name, setName] = useState(filter.name || '');

  const requiredOptions = useMemo(
    () => [
      { value: 'true', label: t('group.filter.option_required') },
      { value: 'false', label: t('group.filter.option_not_required') },
    ],
    [t],
  );

  const displayTypeOptions = useOptionGroupDisplayTypeOptions();

  const handleTextFiltersChange = useCallback(
    (value: { code: string; name: string }) =>
      handleFilterChange({
        code: value.code || undefined,
        name: value.name || undefined,
      }),
    [handleFilterChange],
  );

  useDebounce({ code, name }, handleTextFiltersChange);

  const handleReset = () => {
    setCode('');
    setName('');
    handleFilterChange({ code: undefined, name: undefined, display_type: undefined, is_required: undefined });
  };

  return (
    <FilterContainer onResetFilter={handleReset}>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <FormItem label={t('group.filter.code')}>
          <Input placeholder={t('group.filter.code_placeholder')} value={code} onChange={(e) => setCode(e.target.value)} />
        </FormItem>
        <FormItem label={t('group.filter.name')}>
          <Input placeholder={t('group.filter.name_placeholder')} value={name} onChange={(e) => setName(e.target.value)} />
        </FormItem>
        {/* <FormItem label={t('group.filter.display_type')}>
          <AppSelect
            options={displayTypeOptions}
            value={filter.display_type as OptionGroupDisplayType | undefined}
            onChange={(v) => handleFilterChange({ display_type: v })}
            placeholder={t('group.filter.all')}
          />
        </FormItem> */}
        <FormItem label={t('group.filter.required')}>
          <AppSelect
            options={requiredOptions}
            value={filter.is_required === undefined ? undefined : String(filter.is_required)}
            onChange={(v) => handleFilterChange({ is_required: v === undefined ? undefined : v === 'true' })}
            placeholder={t('group.filter.all')}
          />
        </FormItem>
      </div>
    </FilterContainer>
  );
};

export default OptionGroupFilter;
