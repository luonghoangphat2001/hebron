import { appToast } from '@/components/toast/AppToast';
import { Button } from '@/components/ui/button';
import { uploadFileAPI } from '@/data/file/file.api';
import type { FileRESP } from '@/data/file/file.response';
import { cn } from '@/lib/utils';
import { DEFAULT_ATTACHMENT_ACCEPT, DEFAULT_ATTACHMENT_MAX_SIZE_MB } from '@/utils/constants/attachment.constant';
import type { FileType } from '@/utils/enums/file.enum';
import { FileText, Loader2, UploadIcon, X } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isImageSource } from '@/utils/helper/common.helper';
import { toStorageUrl } from '@/utils/helper/storage-url.helper';
/** Local draft (pending upload) or already-uploaded remote file. */
export type AttachmentFileValue = {
  localId: string;
  name: string;
  size: number;
  mime_type: string;
  /** Pending local file — upload on form submit */
  file?: File;
  /** Already on storage (e.g. edit mode) */
  remote?: FileRESP;
};

type PreviewItem = AttachmentFileValue & {
  preview?: string;
};

type Props = {
  value?: AttachmentFileValue | AttachmentFileValue[];
  onChange?: (value?: AttachmentFileValue | AttachmentFileValue[]) => void;
  /** Default: images only */
  accept?: string;
  /** Default: 5MB */
  maxSizeMB?: number;
  multiple?: boolean;
  disabled?: boolean;
  /** Show overlay while parent is uploading on submit */
  uploading?: boolean;
  className?: string;
  /** Size of the tile / dropzone — defaults to a fixed square */
  tileClassName?: string;
};

const toEmitValue = (item: PreviewItem): AttachmentFileValue => ({
  localId: item.localId,
  name: item.name,
  size: item.size,
  mime_type: item.mime_type,
  file: item.file,
  remote: item.remote,
});

const revokePreview = (preview?: string) => {
  if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview);
};

/** Map existing storage files into controlled values (edit mode). */
export const toAttachmentFileValues = (files: FileRESP[] = []): AttachmentFileValue[] =>
  files.map((remote) => ({
    localId: `remote-${remote.id}`,
    name: remote.name,
    size: remote.size,
    mime_type: remote.mime_type,
    remote,
  }));

/**
 * Resolve attachments on form submit.
 * - Local drafts → upload to storage
 * - Kept remotes → return as-is
 * - Removed items are already gone from `value`, so they are not returned
 *   (edit mode: remove all → `[]` → entity has no attachments after save)
 */
export const uploadAttachmentFiles = async (
  value: AttachmentFileValue | AttachmentFileValue[] | undefined,
  type: FileType,
): Promise<FileRESP[]> => {
  const items = value == null ? [] : Array.isArray(value) ? value : [value];
  if (!items.length) return [];

  return Promise.all(
    items.map(async (item) => {
      if (item.remote) return item.remote;
      if (!item.file) {
        throw new Error(`Missing local file for attachment "${item.name}"`);
      }

      const resp = await uploadFileAPI(item.file, type);
      return resp.data.file;
    }),
  );
};

const AttachmentFile = ({
  value,
  onChange,
  accept = DEFAULT_ATTACHMENT_ACCEPT,
  maxSizeMB = DEFAULT_ATTACHMENT_MAX_SIZE_MB,
  multiple = false,
  disabled,
  uploading = false,
  className,
  tileClassName,
}: Props) => {
  const { t: tCommon } = useTranslation('common');
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const previewMapRef = useRef<Map<string, string>>(new Map());
  const [items, setItems] = useState<PreviewItem[]>([]);
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const ensurePreview = (item: AttachmentFileValue): string | undefined => {
    const cached = previewMapRef.current.get(item.localId);
    if (cached) return cached;

    if (item.remote && isImageSource(item.remote)) {
      return toStorageUrl(item.remote.url);
    }

    if (item.file && isImageSource({ name: item.file.name, type: item.file.type, mime_type: item.file.type })) {
      const preview = URL.createObjectURL(item.file);
      previewMapRef.current.set(item.localId, preview);
      return preview;
    }

    return undefined;
  };

  const revokeLocalId = (localId: string) => {
    const preview = previewMapRef.current.get(localId);
    revokePreview(preview);
    previewMapRef.current.delete(localId);
  };

  useEffect(() => {
    return () => {
      previewMapRef.current.forEach((preview) => revokePreview(preview));
      previewMapRef.current.clear();
    };
  }, []);

  useEffect(() => {
    if (!value) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setItems((prev) => {
        prev.forEach((item) => revokeLocalId(item.localId));
        return [];
      });
      return;
    }

    const values = Array.isArray(value) ? value : [value];
    const nextIds = new Set(values.map((item) => item.localId));

    previewMapRef.current.forEach((_, localId) => {
      if (!nextIds.has(localId)) revokeLocalId(localId);
    });

    setItems(
      values.map((item) => ({
        ...item,
        preview: ensurePreview(item),
      })),
    );
  }, [value]);

  const emitChange = (nextItems: PreviewItem[]) => {
    const nextValue = nextItems.map(toEmitValue);

    if (multiple) {
      // Always emit an array (including []) so edit-mode "remove all" is explicit on submit
      onChange?.(nextValue);
      return;
    }

    onChange?.(nextValue[0]);
  };

  const validateFile = (file: File): boolean => {
    if (file.size > maxSizeBytes) {
      appToast.error(tCommon('notify.file_too_large', { size: maxSizeMB }));
      return false;
    }

    if (accept && accept !== '*') {
      const acceptList = accept.split(',').map((item) => item.trim().toLowerCase());
      const fileName = file.name.toLowerCase();
      const fileMime = file.type.toLowerCase();
      const matched = acceptList.some((rule) => {
        if (rule.startsWith('.')) return fileName.endsWith(rule);
        if (rule.endsWith('/*')) return fileMime.startsWith(rule.replace('/*', '/'));
        return fileMime === rule;
      });

      if (!matched) {
        appToast.error(tCommon('notify.file_type_invalid'));
        return false;
      }
    }

    return true;
  };

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';

    if (!files.length || disabled || uploading) return;

    const validFiles = files.filter(validateFile);
    if (!validFiles.length) return;

    const localItems: PreviewItem[] = validFiles.map((file) => {
      const localId = `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`;
      const draft: AttachmentFileValue = {
        localId,
        name: file.name,
        size: file.size,
        mime_type: file.type,
        file,
      };

      return {
        ...draft,
        preview: ensurePreview(draft),
      };
    });

    const nextItems = multiple ? [...items, ...localItems] : localItems;

    if (!multiple) {
      items.forEach((item) => revokeLocalId(item.localId));
    }

    setItems(nextItems);
    emitChange(nextItems);
  };

  const handleRemove = (localId: string) => {
    if (disabled || uploading) return;

    setItems((prev) => {
      revokeLocalId(localId);
      const nextItems = prev.filter((item) => item.localId !== localId);
      emitChange(nextItems);
      return nextItems;
    });
  };

  const canAddMore = useMemo(() => multiple || items.length === 0, [items.length, multiple]);
  const isBusy = disabled || uploading;
  const tileClass = cn('relative shrink-0 overflow-hidden rounded-md border', tileClassName || 'size-24 sm:size-28');

  return (
    <div className={cn('space-y-2', className)}>
      <input
        id={inputId}
        ref={inputRef}
        type='file'
        multiple={multiple}
        accept={accept}
        className='hidden'
        disabled={isBusy}
        onChange={handleSelect}
      />

      <div className='flex flex-wrap items-start gap-2.5'>
        {items.map((item) => {
          const showImage = Boolean(item.preview || (item.remote && isImageSource(item.remote)));

          return (
            <div key={item.localId} className={cn(tileClass, 'bg-muted/30')} title={item.name}>
              {showImage ? (
                <img src={item.preview || toStorageUrl(item.remote?.url)} alt={item.name} className='size-full object-cover' />
              ) : (
                <div className='flex size-full flex-col items-center justify-center gap-1 p-2'>
                  <FileText className='text-muted-foreground size-6' />
                  <p className='text-muted-foreground w-full truncate text-center text-[10px] leading-tight'>{item.name}</p>
                </div>
              )}

              {!isBusy && (
                <Button
                  type='button'
                  size='icon'
                  variant='destructive'
                  className='absolute top-1 right-1 z-10 size-6'
                  onClick={() => handleRemove(item.localId)}>
                  <X className='size-3.5' />
                </Button>
              )}

              {uploading && item.file && (
                <div className='bg-background/70 absolute inset-0 flex items-center justify-center'>
                  <Loader2 className='size-5 animate-spin' />
                </div>
              )}
            </div>
          );
        })}

        {canAddMore && (
          <button
            type='button'
            disabled={isBusy}
            onClick={() => inputRef.current?.click()}
            title={tCommon('title.click_to_upload')}
            className={cn(
              tileClass,
              'hover:bg-accent text-muted-foreground flex cursor-pointer flex-col items-center justify-center gap-1 border-dashed transition-colors',
              isBusy && 'cursor-not-allowed opacity-50',
            )}>
            <UploadIcon className='size-5' />
            <span className='px-1 text-center text-[10px] leading-tight'>
              {tCommon('title.upload_hint', { size: maxSizeMB })}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};

export default AttachmentFile;
