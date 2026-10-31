import { DateRangePicker } from '@/components/date-picker/DateRangePicker';
import FilterContainer from '@/components/FilterContainer';
import FormItem from '@/components/form/FormItem';
import AppSelect from '@/components/select/AppSelect';
import { Input } from '@/components/ui/input';
import type { AccessLogFilterValues } from '@/data/system/system.service';
import { DEFAULT_ACCESS_LOG_FILTER } from '@/data/system/system.service';
import { AccessLogEventType } from '@/utils/enums/system.enum';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type ConnectionLogFilterProps = {
  filter: AccessLogFilterValues;
  onFilterChange: (newFilter: Partial<AccessLogFilterValues>) => void;
};

const ConnectionLogFilter = ({ filter, onFilterChange }: ConnectionLogFilterProps) => {
  const { t: tSystem } = useTranslation('system');
  const { t: tEnum } = useTranslation('enum');
  const { t: tCommon } = useTranslation('common');

  const eventTypeOptions = useMemo(
    () => [
      { value: '', label: tSystem('connection_log.placeholder.all_types') },
      ...Object.values(AccessLogEventType).map((v) => ({
        value: v,
        label: tEnum(`system.${v.toUpperCase()}`, v),
      })),
    ],
    [tEnum, tSystem],
  );

  const abnormalOptions = useMemo(
    () => [
      { value: '', label: tSystem('connection_log.placeholder.all') },
      { value: 'true', label: tSystem('connection_log.placeholder.abnormal_only') },
    ],
    [tSystem],
  );

  const handleReset = () => {
    onFilterChange({
      ...DEFAULT_ACCESS_LOG_FILTER,
      login_id: undefined,
      user_id_name: undefined,
      ip_address: undefined,
      event_type: undefined,
      browser_info: undefined,
      show_abnormal_only: undefined,
      date_period: undefined,
    });
  };

  return (
    <FilterContainer onResetFilter={handleReset}>
      <div className='grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'>
        <FormItem label={tSystem('connection_log.field.login_id', 'Login ID')}>
          <Input
            value={filter.login_id || filter.user_id_name || ''}
            onChange={(e) =>
              onFilterChange({
                login_id: e.target.value || undefined,
                user_id_name: e.target.value || undefined,
              })
            }
            placeholder={tSystem('connection_log.placeholder.search_user')}
          />
        </FormItem>

        <FormItem label={tSystem('connection_log.field.ip_address', 'Connection IP')}>
          <Input
            value={filter.ip_address || ''}
            onChange={(e) => onFilterChange({ ip_address: e.target.value || undefined })}
            placeholder={tSystem('connection_log.placeholder.search_ip')}
          />
        </FormItem>

        <FormItem label={tSystem('connection_log.field.type', 'Detection Result')}>
          <AppSelect
            options={eventTypeOptions}
            value={filter.event_type || ''}
            onChange={(val) => onFilterChange({ event_type: val || undefined })}
            placeholder={tSystem('connection_log.placeholder.all_types')}
          />
        </FormItem>

        <FormItem label={tSystem('connection_log.field.browser_info', 'Browser Info')}>
          <Input
            value={filter.browser_info || ''}
            onChange={(e) => onFilterChange({ browser_info: e.target.value || undefined })}
            placeholder={tSystem('connection_log.placeholder.search_browser')}
          />
        </FormItem>

        <FormItem label={tSystem('connection_log.field.show_abnormal_only', 'Detection Status')}>
          <AppSelect
            options={abnormalOptions}
            value={filter.show_abnormal_only ? 'true' : ''}
            onChange={(val) => onFilterChange({ show_abnormal_only: val === 'true' ? true : undefined })}
            placeholder={tSystem('connection_log.placeholder.all')}
          />
        </FormItem>

        <FormItem label={tSystem('connection_log.field.date', 'Access Date')}>
          <DateRangePicker
            value={filter.date_period}
            onChange={(val) => onFilterChange({ date_period: val || undefined })}
            placeholder={tCommon('filter.pick_date_range')}
          />
        </FormItem>
      </div>
    </FilterContainer>
  );
};

export default ConnectionLogFilter;
