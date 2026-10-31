import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getFileUrl } from '@/utils/helper/common.helper';
import { useTranslation } from 'react-i18next';

type DesignGroupPreviewModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  title: string;
  previewFront: string;
  previewBack?: string;
};

const DesignGroupPreviewModal = ({ open, setOpen, title, previewFront, previewBack }: DesignGroupPreviewModalProps) => {
  const { t: tOrder } = useTranslation('order');
  const { t: tCommon } = useTranslation('common');
  const previews = [
    { label: tOrder('label.design_preview_front'), url: previewFront },
    ...(previewBack ? [{ label: tOrder('label.design_preview_back'), url: previewBack }] : []),
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className='max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-4xl'>
        <DialogHeader>
          <DialogTitle>{tOrder('label.design_group_preview')}</DialogTitle>
          <p className='text-muted-foreground truncate text-sm'>{title}</p>
        </DialogHeader>

        <div className='grid gap-4 sm:grid-cols-2'>
          {previews.map((preview) => (
            <figure key={preview.label} className='space-y-2'>
              <figcaption className='text-sm font-medium text-gray-900'>{preview.label}</figcaption>
              <div className='flex min-h-48 items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-gray-50 p-2'>
                <img
                  src={getFileUrl(preview.url)}
                  alt={`${title} - ${preview.label}`}
                  className='max-h-[60vh] w-full rounded object-contain'
                />
              </div>
            </figure>
          ))}
        </div>

        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => setOpen(false)}>
            {tCommon('button.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DesignGroupPreviewModal;
