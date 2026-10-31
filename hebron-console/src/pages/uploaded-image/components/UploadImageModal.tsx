import AppDialog from '@/components/dialog/AppDialog';
import FormItem from '@/components/form/FormItem';
import AppSelect from '@/components/select/AppSelect';
import { appToast } from '@/components/toast/AppToast';
import AttachmentFile, { type AttachmentFileValue } from '@/components/upload/AttachmentFile';
import { useUploadFileMutation } from '@/data/file/file.query';
import { FileType } from '@/utils/enums/file.enum';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

type UploadImageModalProps = {
  open: boolean;
  setOpen: (value: boolean) => void;
};

const UploadImageModal = ({ open, setOpen }: UploadImageModalProps) => {
  const { t: tContent } = useTranslation('content');
  const { t: tCommon } = useTranslation('common');
  const { t: tEnum } = useTranslation('enum');
  const [category, setCategory] = useState<string>('');
  const [attachment, setAttachment] = useState<AttachmentFileValue | undefined>();

  const uploadMutation = useUploadFileMutation({
    onSuccess: (resp) => {
      appToast.success(resp.message || tCommon('notify.success_create'));
      handleClose();
    },
    onError: (err) => {
      appToast.error(err.response?.data?.message || tCommon('notify.fail_create'));
    },
  });

  const categoryOptions = useMemo(
    () => Object.values(FileType).map((v) => ({ value: v, label: tEnum(`content.${v}` as any) as string })),
    [tEnum],
  );

  const handleClose = () => {
    setCategory('');
    setAttachment(undefined);
    setOpen(false);
  };

  const handleSave = () => {
    if (!category || !attachment?.file) return;

    uploadMutation.mutate({
      file: attachment.file,
      type: category as FileType,
    });
  };

  return (
    <AppDialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose();
        else setOpen(v);
      }}
      title={tContent('image.modal_upload')}
      onOk={handleSave}
      okDisabled={!category || !attachment?.file}
      loading={uploadMutation.isPending}
      className='sm:max-w-lg'>
      <div className='space-y-4'>
        <FormItem label={tContent('image.field_category')} required>
          <AppSelect
            options={categoryOptions}
            value={category}
            onChange={(val) => setCategory(val as string)}
            placeholder={tContent('filter.ph_select_category')}
          />
        </FormItem>
        <FormItem label={tContent('image.field_image')} required>
          <AttachmentFile
            accept='image/*,application/pdf'
            value={attachment}
            onChange={(val) => {
              const item = Array.isArray(val) ? val[0] : val;
              setAttachment(item);
            }}
            uploading={uploadMutation.isPending}
            className='[&>div>button]:h-[15rem] [&>div>button]:w-full [&>div>div]:h-[15rem] [&>div>div]:w-full'
          />
        </FormItem>
      </div>
    </AppDialog>
  );
};

export default UploadImageModal;
