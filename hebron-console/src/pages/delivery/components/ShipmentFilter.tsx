import { DateRangePicker } from '@/components/date-picker/DateRangePicker';
import FilterContainer from '@/components/FilterContainer';
import FormItem from '@/components/form/FormItem';
import AppSelect from '@/components/select/AppSelect';
import { Input } from '@/components/ui/input';
import { useShipmentSearchFiltersQuery } from '@/data/delivery/delivery.query';
import type { ShipmentListREQ } from '@/data/delivery/delivery.request';
import useDebounce from '@/hooks/useDebounce';
import { DATE_FORMAT } from '@/utils/constants/date.constant';
import { ShipmentStatus } from '@/utils/enums/delivery.enum';
import dayjs from 'dayjs';
import { useCallback, useMemo, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { useTranslation } from 'react-i18next';

type ShipmentFilterProps = {
  filter: ShipmentListREQ;
  handleFilterChange: (filter: Partial<ShipmentListREQ>) => void;
};

const ShipmentFilter = ({ filter, handleFilterChange }: ShipmentFilterProps) => {
  const { t: tCommon } = useTranslation('common');
  const { t: tDelivery } = useTranslation('delivery');
  const { t: tEnum } = useTranslation('enum');

  const [searchTerm, setSearchTerm] = useState(filter.search_term || '');
  const [orderNumber, setOrderNumber] = useState(filter.order_number || '');
  const [customerName, setCustomerName] = useState(filter.customer_name || '');
  const [productName, setProductName] = useState(filter.product_name || '');
  const [invoiceNumber, setInvoiceNumber] = useState(filter.invoice_number || '');
  const [trackingNumber, setTrackingNumber] = useState(filter.tracking_number || '');
  const [shipmentPeriod, setShipmentPeriod] = useState<DateRange | undefined>(() => {
    if (!filter.shipment_date_from && !filter.shipment_date_to) return undefined;
    return {
      from: filter.shipment_date_from ? dayjs(filter.shipment_date_from).toDate() : undefined,
      to: filter.shipment_date_to ? dayjs(filter.shipment_date_to).toDate() : undefined,
    };
  });

  const { data: searchFilters } = useShipmentSearchFiltersQuery();

  const statusOptions = useMemo(
    () => Object.values(ShipmentStatus).map((v) => ({ value: v, label: tEnum(`delivery.${v}`) })),
    [tEnum],
  );

  const handleSearchTermChange = useCallback(
    (value: string) => handleFilterChange({ search_term: value || undefined }),
    [handleFilterChange],
  );
  const handleOrderNumberChange = useCallback(
    (value: string) => handleFilterChange({ order_number: value || undefined }),
    [handleFilterChange],
  );
  const handleCustomerNameChange = useCallback(
    (value: string) => handleFilterChange({ customer_name: value || undefined }),
    [handleFilterChange],
  );
  const handleProductNameChange = useCallback(
    (value: string) => handleFilterChange({ product_name: value || undefined }),
    [handleFilterChange],
  );
  const handleInvoiceNumberChange = useCallback(
    (value: string) => handleFilterChange({ invoice_number: value || undefined }),
    [handleFilterChange],
  );
  const handleTrackingNumberChange = useCallback(
    (value: string) => handleFilterChange({ tracking_number: value || undefined }),
    [handleFilterChange],
  );

  useDebounce(searchTerm, handleSearchTermChange);
  useDebounce(orderNumber, handleOrderNumberChange);
  useDebounce(customerName, handleCustomerNameChange);
  useDebounce(productName, handleProductNameChange);
  useDebounce(invoiceNumber, handleInvoiceNumberChange);
  useDebounce(trackingNumber, handleTrackingNumberChange);

  const handleShipmentPeriodChange = (value: DateRange | undefined) => {
    setShipmentPeriod(value);
    handleFilterChange({
      shipment_date_from: value?.from ? dayjs(value.from).format(DATE_FORMAT) : undefined,
      shipment_date_to: value?.to ? dayjs(value.to).format(DATE_FORMAT) : undefined,
    });
  };

  const handleReset = () => {
    setSearchTerm('');
    setOrderNumber('');
    setCustomerName('');
    setProductName('');
    setInvoiceNumber('');
    setTrackingNumber('');
    setShipmentPeriod(undefined);
    handleFilterChange({
      search_term: undefined,
      order_number: undefined,
      customer_name: undefined,
      product_name: undefined,
      invoice_number: undefined,
      tracking_number: undefined,
      shipping_manager_id: undefined,
      status: undefined,
      shipment_date_from: undefined,
      shipment_date_to: undefined,
    });
  };

  return (
    <FilterContainer onResetFilter={handleReset}>
      <div className='grid grid-cols-3 gap-x-4 gap-y-4'>
        <FormItem label={tDelivery('shipment.field.search_term')}>
          <Input
            placeholder={tDelivery('shipment.placeholder.search_term')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </FormItem>
        <FormItem label={tDelivery('shipment.field.order_number')}>
          <Input
            placeholder={tDelivery('shipment.placeholder.order_number')}
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
          />
        </FormItem>
        <FormItem label={tDelivery('shipment.field.customer_name')}>
          <Input
            placeholder={tDelivery('shipment.placeholder.customer_name')}
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </FormItem>
        <FormItem label={tDelivery('shipment.field.product_name')}>
          <Input
            placeholder={tDelivery('shipment.placeholder.product_name')}
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
        </FormItem>
        <FormItem label={tDelivery('shipment.field.invoice_number')}>
          <Input
            placeholder={tDelivery('shipment.placeholder.invoice_number')}
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
          />
        </FormItem>
        <FormItem label={tDelivery('shipment.field.tracking_number')}>
          <Input
            placeholder={tDelivery('shipment.placeholder.tracking_number')}
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
          />
        </FormItem>
        <FormItem label={tDelivery('shipment.field.shipping_manager')}>
          <AppSelect
            options={searchFilters?.shipping_manager_options || []}
            value={filter.shipping_manager_id}
            onChange={(v) => handleFilterChange({ shipping_manager_id: v })}
            placeholder={tDelivery('shipment.placeholder.shipping_manager')}
            showSearch
          />
        </FormItem>
        <FormItem label={tDelivery('shipment.field.status')}>
          <AppSelect
            options={statusOptions}
            value={filter.status}
            onChange={(v) => handleFilterChange({ status: v as ShipmentStatus | undefined })}
            placeholder={tDelivery('shipment.placeholder.all_statuses')}
          />
        </FormItem>
        <FormItem label={tDelivery('shipment.field.shipment_date')}>
          <DateRangePicker
            value={shipmentPeriod}
            onChange={handleShipmentPeriodChange}
            placeholder={tCommon('filter.pick_date_range')}
          />
        </FormItem>
      </div>
    </FilterContainer>
  );
};

export default ShipmentFilter;
