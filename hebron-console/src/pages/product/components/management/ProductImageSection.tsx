import { appToast } from '@/components/toast/AppToast';
import AttachmentFile, { type AttachmentFileValue } from '@/components/upload/AttachmentFile';
import { PRODUCT_IMAGE_ACCEPT, PRODUCT_IMAGE_MAX_COUNT } from '@/utils/constants/attachment.constant';
import { useTranslation } from 'react-i18next';

type Props = {
  attachments: AttachmentFileValue[];
  onChange: (value: AttachmentFileValue[]) => void;
  uploading: boolean;
  readOnly?: boolean;
};

const ProductImageSection = ({ attachments, onChange, uploading, readOnly }: Props) => {
  const { t } = useTranslation('product');
  const { t: tError } = useTranslation('error');

  /** AttachmentFile validates mime + size; the 5-image cap is enforced here. */
  const handleAttachmentsChange = (value?: AttachmentFileValue | AttachmentFileValue[]) => {
    const next = value == null ? [] : Array.isArray(value) ? value : [value];

    if (next.length > PRODUCT_IMAGE_MAX_COUNT) {
      appToast.error(tError('PRODUCT_IMAGE_MAX_COUNT'));
      onChange(next.slice(0, PRODUCT_IMAGE_MAX_COUNT));
      return;
    }

    onChange(next);
  };

  return (
    <section className='space-y-4'>
      <h3 className='text-sm font-semibold'>{t('modal.section_images')}</h3>
      <AttachmentFile
        multiple
        accept={PRODUCT_IMAGE_ACCEPT}
        value={attachments}
        onChange={handleAttachmentsChange}
        uploading={uploading}
        disabled={readOnly}
      />
      <p className='text-muted-foreground text-xs'>{t('modal.images_hint')}</p>
    </section>
  );
};

export default ProductImageSection;
