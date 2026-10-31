import { DateRangePicker } from '@/components/date-picker/DateRangePicker';
import FilterContainer from '@/components/FilterContainer';
import FormItem from '@/components/form/FormItem';
import AppSelect from '@/components/select/AppSelect';
import { Input } from '@/components/ui/input';
import { DEFAULT_INQUIRY_FILTER } from '@/data/inquiry/inquiry.service';
import useDebounce from '@/hooks/useDebounce';
import type { SortOrder } from '@/utils/enums/common.enum';
import { InquirySortBy, InquiryStatus, InquiryType } from '@/utils/enums/inquiry.enum';
import { useMemo, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { useTranslation } from 'react-i18next';

export type InquiryFilterValues = {
  search_term: string;
  inquiry_type: InquiryType | undefined;
  customer_name: string;
  inquirer_name: string;
  status: InquiryStatus | undefined;
  assigned_to?: number | null;
  created_period: DateRange | undefined;
  has_attachment?: boolean;
  sort_by?: InquirySortBy;
  sort_order?: SortOrder;
  page: number;
  per_page: number;
};

type Props = {
  onFilterChange: (filter: InquiryFilterValues) => void;
};

const InquiryFilter = ({ onFilterChange }: Props) => {
  const { t: tEnum } = useTranslation('enum');
  const { t: tInquiry } = useTranslation('inquiry');
  const { t: tCommon } = useTranslation('common');

  const [filter, setFilter] = useState<InquiryFilterValues>(DEFAULT_INQUIRY_FILTER);

  useDebounce(filter, onFilterChange);

  const typeOptions = useMemo(() => Object.values(InquiryType).map((v) => ({ value: v, label: tEnum(`inquiry.${v}`) })), [tEnum]);

  const statusOptions = useMemo(
    () => Object.values(InquiryStatus).map((v) => ({ value: v, label: tEnum(`inquiry.${v}`) })),
    [tEnum],
  );

  const handleReset = () => {
    setFilter(DEFAULT_INQUIRY_FILTER);
    onFilterChange(DEFAULT_INQUIRY_FILTER);
  };

  return (
    <FilterContainer onResetFilter={handleReset}>
      <div className='grid grid-cols-3 gap-x-4 gap-y-4'>
        <FormItem label={tCommon('title.search_term')}>
          <Input
            value={filter.search_term}
            onChange={(e) => setFilter((prev) => ({ ...prev, search_term: e.target.value }))}
            placeholder={tInquiry('placeholder.enter_search_term')}
          />
        </FormItem>
        <FormItem label={tInquiry('field.inquiry_type')}>
          <AppSelect
            options={typeOptions}
            value={filter.inquiry_type}
            onChange={(v) => setFilter((prev) => ({ ...prev, inquiry_type: v as InquiryType | undefined }))}
            placeholder={tInquiry('placeholder.all_types')}
          />
        </FormItem>
        <FormItem label={tInquiry('field.customer_name')}>
          <Input
            value={filter.customer_name}
            onChange={(e) => setFilter((prev) => ({ ...prev, customer_name: e.target.value }))}
            placeholder={tInquiry('placeholder.enter_customer_name')}
          />
        </FormItem>
        <FormItem label={tInquiry('field.inquirer_name')}>
          <Input
            value={filter.inquirer_name}
            onChange={(e) => setFilter((prev) => ({ ...prev, inquirer_name: e.target.value }))}
            placeholder={tInquiry('placeholder.enter_inquirer_name')}
          />
        </FormItem>
        <FormItem label={tInquiry('field.status')}>
          <AppSelect
            options={statusOptions}
            value={filter.status}
            onChange={(v) => setFilter((prev) => ({ ...prev, status: v as InquiryStatus | undefined }))}
            placeholder={tInquiry('placeholder.all_status')}
          />
        </FormItem>
        <FormItem label={tInquiry('field.person_in_charge')}>
          <Input
            type='number'
            value={filter.assigned_to || ''}
            onChange={(e) => setFilter((prev) => ({ ...prev, assigned_to: e.target.value ? Number(e.target.value) : null }))}
            placeholder={tInquiry('placeholder.all_managers')}
          />
        </FormItem>
        <FormItem label={tInquiry('field.registration_date')}>
          <DateRangePicker
            value={filter.created_period}
            onChange={(range) => setFilter((prev) => ({ ...prev, created_period: range }))}
            placeholder={tCommon('filter.pick_date_range')}
          />
        </FormItem>
      </div>
    </FilterContainer>
  );
};

export default InquiryFilter;
