import { Button } from '@/components/ui/button';
import MyPageFormMobileFooter from '@/pages/ecommerce/my-page/components/MyPageFormMobileFooter';

type MyPageFormActionsProps = {
  cancelLabel: string;
  submitLabel?: string;
  mobileSubmitLabel?: string;
  onCancel: () => void;
  loading?: boolean;
  /** View / readonly mode — only show the cancel/back button */
  hideSubmit?: boolean;
};

type MyPageFormMobileActionsProps = MyPageFormActionsProps & {
  isDocked: boolean;
};

export const MyPageFormDesktopActions = ({
  cancelLabel,
  submitLabel,
  onCancel,
  loading,
  hideSubmit = false,
}: MyPageFormActionsProps) => (
  <div className='hidden shrink-0 gap-2 md:flex'>
    <Button type='button' variant='outline' onClick={onCancel} className='px-8'>
      {cancelLabel}
    </Button>
    {!hideSubmit && submitLabel ? (
      <Button type='submit' className='px-14' loading={loading}>
        {submitLabel}
      </Button>
    ) : null}
  </div>
);

export const MyPageFormMobileActions = ({
  cancelLabel,
  submitLabel,
  mobileSubmitLabel,
  onCancel,
  loading,
  isDocked,
  hideSubmit = false,
}: MyPageFormMobileActionsProps) => (
  <MyPageFormMobileFooter isDocked={isDocked}>
    <div className='flex gap-2'>
      <Button type='button' variant='outline' className='flex-1' onClick={onCancel}>
        {cancelLabel}
      </Button>
      {!hideSubmit && submitLabel ? (
        <Button type='submit' className='flex-1' loading={loading}>
          {mobileSubmitLabel ?? submitLabel}
        </Button>
      ) : null}
    </div>
  </MyPageFormMobileFooter>
);
