import { DateRangePicker } from '@/components/date-picker/DateRangePicker';
import FilterContainer from '@/components/FilterContainer';
import FormItem from '@/components/form/FormItem';
import AppSelect from '@/components/select/AppSelect';
import { Input } from '@/components/ui/input';
import type { MesLogListREQ } from '@/data/mes/mes.request';
import useDebounce from '@/hooks/useDebounce';
import { DATE_FORMAT } from '@/utils/constants/date.constant';
import { MesDirection, MesLogResult, MesTriggerType } from '@/utils/enums/mes.enum';
import dayjs from 'dayjs';
import { useCallback, useMemo, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { useTranslation } from 'react-i18next';

type Props = {
  filter: MesLogListREQ;
  handleFilterChange: (patch: Partial<MesLogListREQ>) => void;
};

const MesLogFilter = ({ filter, handleFilterChange }: Props) => {
  const { t: tCommon } = useTranslation('common');
  const { t: tMes } = useTranslation('mes');
  const { t: tEnum } = useTranslation('enum');
  const [keyword, setKeyword] = useState(filter.keyword || '');

  const directionOptions = useMemo(
    () => Object.values(MesDirection).map((v) => ({ value: v, label: tEnum(`mes.${v}`) })),
    [tEnum],
  );
  const triggerOptions = useMemo(
    () => Object.values(MesTriggerType).map((v) => ({ value: v, label: tEnum(`mes.${v}`) })),
    [tEnum],
  );
  const resultOptions = useMemo(() => Object.values(MesLogResult).map((v) => ({ value: v, label: tEnum(`mes.${v}`) })), [tEnum]);

  const dateRange: DateRange | undefined =
    filter.start_date || filter.end_date
      ? {
          from: filter.start_date ? new Date(filter.start_date) : undefined,
          to: filter.end_date ? new Date(filter.end_date) : undefined,
        }
      : undefined;

  const handleKeywordChange = useCallback(
    (value: string) => handleFilterChange({ keyword: value || undefined }),
    [handleFilterChange],
  );

  useDebounce(keyword, handleKeywordChange);

  const handleDateRangeChange = (range?: DateRange) => {
    handleFilterChange({
      start_date: range?.from ? dayjs(range.from).format(DATE_FORMAT) : undefined,
      end_date: range?.to ? dayjs(range.to).format(DATE_FORMAT) : undefined,
    });
  };

  const handleReset = () => {
    setKeyword('');
    handleFilterChange({
      keyword: undefined,
      direction: undefined,
      trigger_type: undefined,
      status: undefined,
      start_date: undefined,
      end_date: undefined,
    });
  };

  return (
    <FilterContainer onResetFilter={handleReset}>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5'>
        <FormItem label={tMes('log.filter.keyword')}>
          <Input
            placeholder={tMes('log.filter.keyword_placeholder')}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </FormItem>
        <FormItem label={tMes('log.filter.direction')}>
          <AppSelect
            options={directionOptions}
            value={filter.direction}
            onChange={(v) => handleFilterChange({ direction: v as MesDirection | undefined })}
            placeholder={tMes('log.filter.all_directions')}
          />
        </FormItem>
        <FormItem label={tMes('log.filter.trigger_type')}>
          <AppSelect
            options={triggerOptions}
            value={filter.trigger_type}
            onChange={(v) => handleFilterChange({ trigger_type: v as MesTriggerType | undefined })}
            placeholder={tMes('log.filter.all_triggers')}
          />
        </FormItem>
        <FormItem label={tMes('log.filter.status')}>
          <AppSelect
            options={resultOptions}
            value={filter.status}
            onChange={(v) => handleFilterChange({ status: v as MesLogResult | undefined })}
            placeholder={tMes('log.filter.all_statuses')}
          />
        </FormItem>
        <FormItem label={tMes('log.filter.date_range')}>
          <DateRangePicker value={dateRange} onChange={handleDateRangeChange} placeholder={tCommon('filter.pick_date_range')} />
        </FormItem>
      </div>
    </FilterContainer>
  );
};

export default MesLogFilter;
