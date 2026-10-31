import { DateRangePicker } from '@/components/date-picker/DateRangePicker';
import FilterContainer from '@/components/FilterContainer';
import FormItem from '@/components/form/FormItem';
import AppSelect from '@/components/select/AppSelect';
import { Input } from '@/components/ui/input';
import type { TaskLogFilterValues } from '@/data/system/system.service';
import { DEFAULT_TASK_LOG_FILTER } from '@/data/system/system.service';
import { TargetMenu, TaskType } from '@/utils/enums/system.enum';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type OperationLogFilterProps = {
  filter: TaskLogFilterValues;
  onFilterChange: (newFilter: Partial<TaskLogFilterValues>) => void;
};

const OperationLogFilter = ({ filter, onFilterChange }: OperationLogFilterProps) => {
  const { t: tSystem } = useTranslation('system');
  const { t: tEnum } = useTranslation('enum');
  const { t: tCommon } = useTranslation('common');

  const menuOptions = useMemo(
    () => [
      { value: '', label: tSystem('operation_log.placeholder.all_menus') },
      ...Object.values(TargetMenu).map((v) => ({ value: v, label: tEnum(`system.${v}`, v) })),
    ],
    [tEnum, tSystem],
  );

  const actionOptions = useMemo(
    () => [
      { value: '', label: tSystem('operation_log.placeholder.all_actions') },
      ...Object.values(TaskType).map((v) => ({
        value: v,
        label: tEnum(`system.${v}`, v),
      })),
    ],
    [tEnum, tSystem],
  );

  const handleReset = () => {
    onFilterChange({
      ...DEFAULT_TASK_LOG_FILTER,
      menu: undefined,
      worker_name: undefined,
      task_type: undefined,
      date_period: undefined,
    });
  };

  return (
    <FilterContainer onResetFilter={handleReset}>
      <div className='grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-4'>
        <FormItem label={tSystem('operation_log.field.target_menu')}>
          <AppSelect
            options={menuOptions}
            value={filter.menu || ''}
            onChange={(val) => onFilterChange({ menu: val || undefined })}
            placeholder={tSystem('operation_log.placeholder.all_menus')}
          />
        </FormItem>

        <FormItem label={tSystem('operation_log.field.operator')}>
          <Input
            value={filter.worker_name || ''}
            onChange={(e) => onFilterChange({ worker_name: e.target.value || undefined })}
            placeholder={tSystem('operation_log.placeholder.search_operator')}
          />
        </FormItem>
        <FormItem label={tSystem('operation_log.field.action')}>
          <AppSelect
            options={actionOptions}
            value={filter.task_type || ''}
            onChange={(val) => onFilterChange({ task_type: val || undefined })}
            placeholder={tSystem('operation_log.placeholder.all_actions')}
          />
        </FormItem>
        <FormItem label={tSystem('operation_log.field.date')}>
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

export default OperationLogFilter;
