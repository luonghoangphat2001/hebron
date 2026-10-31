import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Spinner } from '@/components/ui/spinner';
import { ExportType } from '@/utils/enums/common.enum';
import { Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type ExportExcelButtonProps = {
  isExporting?: boolean;
  onExport: (exportType: ExportType) => void;
  className?: string;
};

/**
 * Reusable "Export Excel" trigger — lets the user export either everything matching the
 * current filters or just the current page. Use alongside `SelectedRowsExportBar` when the
 * table also supports exporting a hand-picked selection of rows.
 */
const ExportExcelButton = ({ isExporting, onExport, className }: ExportExcelButtonProps) => {
  const { t: tCommon } = useTranslation('common');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' className={className ?? 'gap-2'} disabled={isExporting}>
          {isExporting ? <Spinner /> : <Download className='size-4' />}
          {tCommon('button.export_excel')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={() => onExport(ExportType.ALL)} className='cursor-pointer'>
          {tCommon('export.all')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onExport(ExportType.CURRENT_PAGE)} className='cursor-pointer'>
          {tCommon('export.current_page')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportExcelButton;
