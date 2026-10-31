import { DateRangePicker } from '@/components/date-picker/DateRangePicker';
import FilterContainer from '@/components/FilterContainer';
import FormItem from '@/components/form/FormItem';
import AppSelect from '@/components/select/AppSelect';
import { Input } from '@/components/ui/input';
import useDebounce from '@/hooks/useDebounce';
import { PaymentMethod, PaymentStatus } from '@/utils/enums/payment.enum';
import { useMemo, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { useTranslation } from 'react-i18next';

export type PaymentFilterValues = {
  order_number: string;
  customer_name: string;
  payment_method: PaymentMethod | undefined;
  status: PaymentStatus | undefined;
  payment_date: DateRange | undefined;
};

export const DEFAULT_PAYMENT_FILTER: PaymentFilterValues = {
  order_number: '',
  customer_name: '',
  payment_method: undefined,
  status: undefined,
  payment_date: undefined,
};

type Props = { onChange: (filter: PaymentFilterValues) => void };

const PaymentFilter = ({ onChange }: Props) => {
  const { t: tPayment } = useTranslation('payment');
  const { t: tCommon } = useTranslation('common');
  const { t: tEnum } = useTranslation('enum');
  const [filter, setFilter] = useState<PaymentFilterValues>(DEFAULT_PAYMENT_FILTER);

  useDebounce(filter, onChange);

  const methodOptions = useMemo(
    () => Object.values(PaymentMethod).map((v) => ({ value: v, label: tEnum(`payment.${v}`, v) })),
    [tEnum],
  );

  const statusOptions = useMemo(
    () => Object.values(PaymentStatus).map((v) => ({ value: v, label: tEnum(`payment.${v}`, v) })),
    [tEnum],
  );

  const handleReset = () => {
    setFilter(DEFAULT_PAYMENT_FILTER);
    onChange(DEFAULT_PAYMENT_FILTER);
  };

  return (
    <FilterContainer onResetFilter={handleReset}>
      <div className='grid grid-cols-3 gap-x-4 gap-y-4'>
        <FormItem label={tPayment('history.field.order_number')}>
          <Input
            placeholder={tPayment('history.placeholder.order_number')}
            value={filter.order_number}
            onChange={(e) => setFilter((prev) => ({ ...prev, order_number: e.target.value }))}
          />
        </FormItem>
        <FormItem label={tPayment('history.field.customer_name')}>
          <Input
            placeholder={tPayment('history.placeholder.customer_name')}
            value={filter.customer_name}
            onChange={(e) => setFilter((prev) => ({ ...prev, customer_name: e.target.value }))}
          />
        </FormItem>
        <FormItem label={tPayment('history.field.payment_method')}>
          <AppSelect
            options={methodOptions}
            value={filter.payment_method}
            onChange={(v) => setFilter((prev) => ({ ...prev, payment_method: v as PaymentMethod | undefined }))}
            placeholder={tPayment('history.placeholder.all_methods')}
          />
        </FormItem>
        <FormItem label={tPayment('history.field.status')}>
          <AppSelect
            options={statusOptions}
            value={filter.status}
            onChange={(v) => setFilter((prev) => ({ ...prev, status: v as PaymentStatus | undefined }))}
            placeholder={tPayment('history.placeholder.all_statuses')}
          />
        </FormItem>
        <FormItem label={tPayment('history.field.payment_date')}>
          <DateRangePicker
            value={filter.payment_date}
            onChange={(v) => setFilter((prev) => ({ ...prev, payment_date: v }))}
            placeholder={tCommon('filter.pick_date_range')}
          />
        </FormItem>
      </div>
    </FilterContainer>
  );
};

export default PaymentFilter;
