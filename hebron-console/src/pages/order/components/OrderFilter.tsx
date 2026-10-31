import { DateRangePicker } from '@/components/date-picker/DateRangePicker';
import FilterContainer from '@/components/FilterContainer';
import FormItem from '@/components/form/FormItem';
import AppSelect from '@/components/select/AppSelect';
import { Input } from '@/components/ui/input';
import type { OrderFilterValues } from '@/data/order/order.service';
import { DEFAULT_ORDER_FILTER } from '@/data/order/order.service';
import { OrderStatus } from '@/utils/enums/order.enum';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type OrderFilterProps = {
  filter: OrderFilterValues;
  onFilterChange: (patch: Partial<OrderFilterValues>) => void;
};

const OrderFilter = ({ filter, onFilterChange }: OrderFilterProps) => {
  const { t: tEnum } = useTranslation('enum');
  const { t: tOrder } = useTranslation('order');
  const { t: tCommon } = useTranslation('common');

  const statusOptions = useMemo(
    () => [
      { value: '', label: tOrder('placeholder.all_status') },
      ...Object.values(OrderStatus).map((v) => ({
        value: v,
        label: tEnum(`order.${v}`, v),
      })),
    ],
    [tEnum, tOrder],
  );

  return (
    <FilterContainer
      onResetFilter={() =>
        onFilterChange({
          ...DEFAULT_ORDER_FILTER,
          order_number: undefined,
          customer_name: undefined,
          orderer_name: undefined,
          status: undefined,
          date_period: undefined,
        })
      }>
      <div className='grid grid-cols-3 gap-x-4 gap-y-4'>
        <FormItem label={tOrder('field.order_number')}>
          <Input
            placeholder={tOrder('placeholder.enter_order_number')}
            value={filter.order_number || ''}
            onChange={(e) => onFilterChange({ order_number: e.target.value || undefined })}
          />
        </FormItem>
        <FormItem label={tOrder('field.orderer_name')}>
          <Input
            placeholder={tOrder('placeholder.enter_orderer_name')}
            value={filter.orderer_name || ''}
            onChange={(e) => onFilterChange({ orderer_name: e.target.value || undefined })}
          />
        </FormItem>
        <FormItem label={tOrder('field.status')}>
          <AppSelect
            options={statusOptions}
            value={filter.status || ''}
            placeholder={tOrder('placeholder.all_status')}
            onChange={(v) => onFilterChange({ status: (v as OrderStatus) || undefined })}
          />
        </FormItem>
        <FormItem label={tOrder('field.duration')}>
          <DateRangePicker
            value={filter.date_period}
            onChange={(range) => onFilterChange({ date_period: range || undefined })}
            placeholder={tCommon('filter.pick_date_range')}
          />
        </FormItem>
      </div>
    </FilterContainer>
  );
};

export default OrderFilter;
