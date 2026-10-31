import AppDialog from '@/components/dialog/AppDialog';
import { Button } from '@/components/ui/button';

type DesignPreviewDialogProps = {
  open: boolean;
  previewFront: string;
  previewBack?: string;
  isConfirming?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

const DesignPreviewDialog = ({
  open,
  previewFront,
  previewBack,
  isConfirming,
  onOpenChange,
  onConfirm,
}: DesignPreviewDialogProps) => (
  <AppDialog
    open={open}
    onOpenChange={onOpenChange}
    title={
      <span className='flex items-center gap-3'>
        미리보기
        <span className='text-xs font-normal text-red-500'>모니터 해상도에 따라 실제 인쇄색과 차이가 있을 수 있습니다.</span>
      </span>
    }
    titleClassName='text-lg font-semibold'
    headerClassName='border-b border-neutral-200 px-6 pt-6 pb-3'
    closeButtonClassName='bg-transparent hover:bg-neutral-100'
    isConfirming={isConfirming}
    closeOnInteractOutside={false}
    showFooter={false}
    className='max-h-[90vh] max-w-4xl sm:max-w-4xl'
    contentClassName='border-y-0 p-0'>
    <div className='flex min-h-0 flex-col'>
      <div className='flex min-h-0 justify-center gap-6 overflow-auto bg-neutral-50 p-5'>
        {[previewFront, previewBack].filter(Boolean).map((preview, index) => (
          <figure key={index} className='flex min-w-0 flex-col items-center gap-2'>
            <img
              src={preview}
              alt={index === 0 ? '앞면 디자인 미리보기' : '뒷면 디자인 미리보기'}
              className='max-h-[58vh] max-w-full border border-neutral-200 bg-white object-contain shadow-sm'
            />
            {previewBack && <figcaption className='text-xs text-neutral-500'>{index === 0 ? '앞면' : '뒷면'}</figcaption>}
          </figure>
        ))}
      </div>

      <div className='flex justify-end border-t border-neutral-200 px-6 pt-4 pb-6'>
        <Button onClick={onConfirm} loading={isConfirming} disabled={isConfirming} className='min-w-28'>
          저장
        </Button>
      </div>
    </div>
  </AppDialog>
);

export default DesignPreviewDialog;
