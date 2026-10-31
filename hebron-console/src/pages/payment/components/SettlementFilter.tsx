import { DateRangePicker } from '@/components/date-picker/DateRangePicker';
import FilterContainer from '@/components/FilterContainer';
import FormItem from '@/components/form/FormItem';
import useDebounce from '@/hooks/useDebounce';
import { useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { useTranslation } from 'react-i18next';

export type SettlementFilterValues = {
  settlement_date: DateRange | undefined;
};

export const DEFAULT_SETTLEMENT_FILTER: SettlementFilterValues = {
  settlement_date: undefined,
};

type Props = { onChange: (filter: SettlementFilterValues) => void };

const SettlementFilter = ({ onChange }: Props) => {
  const { t: tPayment } = useTranslation('payment');
  const { t: tCommon } = useTranslation('common');
  const [filter, setFilter] = useState<SettlementFilterValues>(DEFAULT_SETTLEMENT_FILTER);

  useDebounce(filter, onChange);

  const handleReset = () => {
    setFilter(DEFAULT_SETTLEMENT_FILTER);
    onChange(DEFAULT_SETTLEMENT_FILTER);
  };

  return (
    <FilterContainer onResetFilter={handleReset}>
      <div className='grid grid-cols-3 gap-x-4 gap-y-4'>
        <FormItem label={tPayment('settlement.field.settlement_date')}>
          <DateRangePicker
            value={filter.settlement_date}
            onChange={(v) => setFilter((prev) => ({ ...prev, settlement_date: v }))}
            placeholder={tCommon('filter.pick_date_range')}
          />
        </FormItem>
      </div>
    </FilterContainer>
  );
};

export default SettlementFilter;
