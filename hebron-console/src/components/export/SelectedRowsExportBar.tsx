import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type SelectedRowsExportBarProps = {
  count: number;
  isExporting?: boolean;
  onExport?: () => void;
  children?: ReactNode;
};

/** Shows a "N selected" bar with batch actions — pair with a table's row-selection state. */
const SelectedRowsExportBar = ({ count, isExporting, onExport, children }: SelectedRowsExportBarProps) => {
  const { t: tCommon } = useTranslation('common');

  if (count === 0) return null;

  return (
    <div className='flex items-center justify-between rounded-md border border-gray-200 bg-gray-50/80 p-2 dark:border-gray-800 dark:bg-gray-900/50'>
      <span className='text-muted-foreground text-sm font-medium'>{tCommon('label.selected_count', { count })}</span>
      <div className='flex items-center gap-2'>
        {onExport && (
          <Button size='sm' onClick={onExport} disabled={isExporting} className='gap-1.5 text-xs'>
            {isExporting ? <Spinner className='size-3.5' /> : <Download className='size-3.5' />}
            {tCommon('export.selected')}
          </Button>
        )}
        {children}
      </div>
    </div>
  );
};

export default SelectedRowsExportBar;
