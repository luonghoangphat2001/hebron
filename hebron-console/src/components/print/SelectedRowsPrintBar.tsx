import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Printer } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type SelectedRowsPrintBarProps = {
  isPrinting?: boolean;
  onPrint: () => void;
};

/** Batch print action button — can be paired with row-selection state inside SelectedRowsExportBar. */
const SelectedRowsPrintBar = ({ isPrinting, onPrint }: SelectedRowsPrintBarProps) => {
  const { t: tOrder } = useTranslation('order');

  return (
    <Button size='sm' variant='outline' onClick={onPrint} disabled={isPrinting} className='gap-1.5 text-xs'>
      {isPrinting ? <Spinner className='size-3.5' /> : <Printer className='size-3.5' />}
      {tOrder('button.batch_output')}
    </Button>
  );
};

export default SelectedRowsPrintBar;
