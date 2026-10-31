import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { TaskLogItemRESP } from '@/data/system/system.response';
import { parseTaskLogChanges } from '@/data/system/system.service';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type OperationLogDetailModalProps = {
  item: TaskLogItemRESP | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const FormattedValueDisplay = ({ value, variant }: { value?: string; variant: 'before' | 'after' }) => {
  if (!value || value === '-') {
    return <span>-</span>;
  }

  const isBefore = variant === 'before';
  const trimmed = value.trim();
  const isJson = value.includes('\n') && (trimmed.startsWith('{') || trimmed.startsWith('['));

  if (isJson) {
    return (
      <pre
        className={cn(
          'max-h-48 max-w-full overflow-auto rounded-md border p-2.5 font-mono text-[11px] leading-relaxed font-normal whitespace-pre shadow-inner',
          isBefore
            ? 'border-red-200/80 bg-red-50/60 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300'
            : 'border-green-200/80 bg-green-50/60 text-green-700 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-300',
        )}>
        {value}
      </pre>
    );
  }

  return <span className={cn('break-all', isBefore ? 'text-red-500 line-through' : 'font-medium text-green-600')}>{value}</span>;
};

export const OperationLogDetailModal = ({ item, open, onOpenChange }: OperationLogDetailModalProps) => {
  const { t: tSystem } = useTranslation('system');
  const { t: tEnum } = useTranslation('enum');
  const { i18n } = useTranslation();

  const parsedChanges = useMemo(() => {
    if (!item) return [];
    return parseTaskLogChanges(item, i18n.language);
  }, [item, i18n.language]);

  if (!item) return null;

  const menuVal = item.target_menu || item.menu || '-';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[100vh] max-w-4xl flex-col gap-4 overflow-hidden p-6 sm:max-w-5xl'>
        <DialogHeader className='border-b pb-3'>
          <DialogTitle className='flex items-center justify-between gap-4 pe-6 text-lg font-semibold'>
            <span>{tSystem('operation_log.detail_modal_title', 'Operation Log Details')}</span>
          </DialogTitle>
        </DialogHeader>

        {/* Metadata info cards */}
        <div className='grid grid-cols-2 gap-3 rounded-lg bg-neutral-50 p-3 text-xs sm:grid-cols-4 dark:bg-neutral-900'>
          <div>
            <span className='text-muted-foreground block'>{tSystem('operation_log.column.target_menu')}</span>
            <span className='text-foreground font-medium'>{tEnum(`system.${menuVal}`, menuVal)}</span>
          </div>
          <div>
            <span className='text-muted-foreground block'>{tSystem('operation_log.column.data_id')}</span>
            <span className='text-foreground font-medium'>{item.data_identifier ?? item.subject_id ?? '-'}</span>
          </div>
          <div>
            <span className='text-muted-foreground block'>{tSystem('operation_log.column.operator')}</span>
            <span className='text-foreground font-medium'>{item.worker?.name || item.worker?.username || '-'}</span>
          </div>
          <div>
            <span className='text-muted-foreground block'>{tSystem('operation_log.column.date_time')}</span>
            <span className='text-foreground font-medium'>{item.created_at || '-'}</span>
          </div>
        </div>

        {/* Full side-by-side or field changes table */}
        <div className='max-h-[50vh] flex-1 overflow-y-auto rounded-lg border'>
          <table className='w-full table-fixed border-collapse text-left text-xs'>
            <thead className='sticky top-0 border-b bg-neutral-100 font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'>
              <tr>
                <th className='w-[20%] px-3 py-2.5'>{tSystem('operation_log.column.field_name', 'Field Name')}</th>
                <th className='w-[40%] border-l px-3 py-2.5'>{tSystem('operation_log.column.before_change', 'Before Change')}</th>
                <th className='w-[40%] border-l px-3 py-2.5'>{tSystem('operation_log.column.after_change', 'After Change')}</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-neutral-200 dark:divide-neutral-800'>
              {parsedChanges.length === 0 ? (
                <tr>
                  <td colSpan={3} className='text-muted-foreground py-6 text-center'>
                    {tSystem('operation_log.no_changed_fields', 'No changed fields recorded.')}
                  </td>
                </tr>
              ) : (
                parsedChanges.map((change, idx) => (
                  <tr key={idx} className='hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50'>
                    <td className='px-3 py-2 align-top font-medium text-neutral-800 dark:text-neutral-200'>
                      {change.fieldLabel}
                    </td>
                    <td className='border-l bg-red-50/20 px-3 py-2 align-top dark:bg-red-950/10'>
                      <FormattedValueDisplay value={change.beforeVal} variant='before' />
                    </td>
                    <td className='border-l bg-green-50/20 px-3 py-2 align-top dark:bg-green-950/10'>
                      <FormattedValueDisplay value={change.afterVal} variant='after' />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
};
