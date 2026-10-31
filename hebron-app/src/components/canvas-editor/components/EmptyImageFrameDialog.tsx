import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { WarningIcon } from '@phosphor-icons/react';

type EmptyImageFrameDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const EmptyImageFrameDialog = ({ open, onOpenChange }: EmptyImageFrameDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className='max-w-md gap-6 rounded-none px-8 py-10 text-center' showCloseButton={false}>
      <DialogTitle className='sr-only'>빈 이미지 프레임 알림</DialogTitle>
      <div className='flex flex-col items-center gap-5'>
        <WarningIcon className='size-16 text-black' weight='fill' aria-hidden />
        <p className='text-lg leading-7 text-neutral-600'>
          빈프레임이 있습니다.
          <br />
          이미지를 넣어주세요
        </p>
      </div>
      <Button variant='outline' className='mx-auto min-w-24 rounded-none' onClick={() => onOpenChange(false)}>
        확인
      </Button>
    </DialogContent>
  </Dialog>
);

export default EmptyImageFrameDialog;
