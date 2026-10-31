import { appToast } from '@/components/toast/AppToast';
import { Button } from '@/components/ui/button';
import { PRODUCT_AI_ACCEPT, PRODUCT_AI_MAX_SIZE_MB } from '@/utils/constants/attachment.constant';
import aiIcon from '@/assets/images/ai-icon.webp';
import { Download, Loader2, Upload, X } from 'lucide-react';
import { useId, useRef, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

import type { AttachmentFileValue } from '@/components/upload/AttachmentFile';

type Props = {
  attachment?: AttachmentFileValue;
  onChange: (value?: AttachmentFileValue) => void;
  uploading: boolean;
  readOnly?: boolean;
};

/** One downloadable Adobe Illustrator draft file. The API receives its URL in a one-item array. */
const ProductAiFileSection = ({ attachment, onChange, uploading, readOnly }: Props) => {
  const { t } = useTranslation('product');
  const { t: tCommon } = useTranslation('common');
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const maxSizeBytes = PRODUCT_AI_MAX_SIZE_MB * 1024 * 1024;
  const disabled = readOnly || uploading;

  const handleSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.ai')) {
      appToast.error(tCommon('notify.file_type_invalid'));
      return;
    }

    if (file.size > maxSizeBytes) {
      appToast.error(tCommon('notify.file_too_large', { size: PRODUCT_AI_MAX_SIZE_MB }));
      return;
    }

    onChange({
      localId: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
      name: file.name,
      size: file.size,
      mime_type: file.type || 'application/postscript',
      file,
    });
  };

  return (
    <section className='space-y-4'>
      <h3 className='text-sm font-semibold'>{t('modal.section_ai_file')}</h3>
      <input
        id={inputId}
        ref={inputRef}
        type='file'
        accept={PRODUCT_AI_ACCEPT}
        className='hidden'
        disabled={disabled}
        onChange={handleSelect}
      />
      {!attachment && !readOnly ? (
        <Button variant='outline' onClick={() => inputRef.current?.click()} disabled={uploading}>
          <Upload /> {t('modal.ai_file_upload')}
        </Button>
      ) : attachment ? (
        <div className='flex max-w-2xl items-center gap-3 rounded-md border p-3'>
          <img src={aiIcon} alt='' aria-hidden className='size-8 shrink-0 object-contain' />
          <p className='min-w-0 flex-1 truncate text-sm font-medium'>{attachment.name}</p>
          {uploading ? (
            <Loader2 className='text-muted-foreground size-4 animate-spin' aria-label={t('modal.ai_file_uploading')} />
          ) : (
            <div className='flex shrink-0 items-center gap-1'>
              {attachment.remote?.url && (
                <Button asChild size='sm' variant='ghost'>
                  <a href={attachment.remote.url} download={attachment.name} target='_blank' rel='noreferrer'>
                    <Download /> {tCommon('button.download')}
                  </a>
                </Button>
              )}
              {!readOnly && (
                <>
                  <Button size='sm' variant='outline' onClick={() => inputRef.current?.click()}>
                    <Upload /> {t('modal.ai_file_change')}
                  </Button>
                  <Button
                    size='icon-sm'
                    variant='ghost'
                    onClick={() => onChange(undefined)}
                    aria-label={tCommon('button.delete')}>
                    <X />
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      ) : (
        <p className='text-muted-foreground text-sm'>{t('modal.ai_file_empty')}</p>
      )}
      <p className='text-muted-foreground text-xs'>{t('modal.ai_file_hint')}</p>
    </section>
  );
};

export default ProductAiFileSection;
