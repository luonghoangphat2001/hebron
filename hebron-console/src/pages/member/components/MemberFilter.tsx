import FilterContainer from '@/components/FilterContainer';
import FormItem from '@/components/form/FormItem';
import AppSelect from '@/components/select/AppSelect';
import { Input } from '@/components/ui/input';
import type { MemberFilterValues } from '@/data/member/member.service';
import { MemberStatus } from '@/utils/enums/member.enum';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type MemberFilterProps = {
  filter: MemberFilterValues;
  onFilterChange: (patch: Partial<MemberFilterValues>) => void;
};

const MemberFilter = ({ filter, onFilterChange }: MemberFilterProps) => {
  const { t: tEnum } = useTranslation('enum');
  const { t: tMember } = useTranslation('member');

  const statusOptions = useMemo(
    () => Object.values(MemberStatus).map((item) => ({ value: item, label: tEnum(`member.${item}`) })),
    [tEnum],
  );

  return (
    <FilterContainer onResetFilter={() => onFilterChange({ search_term: '', status: undefined, authority: undefined })}>
      <div className='grid grid-cols-3 gap-x-4 gap-y-4'>
        <FormItem label={tMember('field.keyword')}>
          <Input
            placeholder={tMember('placeholder.enter_keyword')}
            value={filter.search_term}
            onChange={(e) => onFilterChange({ search_term: e.target.value })}
          />
        </FormItem>
        <FormItem label={tMember('field.status')}>
          <AppSelect
            options={statusOptions}
            value={filter.status}
            placeholder={tMember('placeholder.all_status')}
            onChange={(v) => onFilterChange({ status: v })}
          />
        </FormItem>
      </div>
    </FilterContainer>
  );
};

export default MemberFilter;
