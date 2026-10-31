import { appToast } from '@/components/toast/AppToast';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import {
  ATTACHMENT_ACCEPT,
  ATTACHMENT_ACCEPT_LABEL,
  ATTACHMENT_MAX_FILES,
  ATTACHMENT_MAX_SIZE_BYTES,
  ATTACHMENT_MAX_SIZE_MB,
} from '@/utils/constants/attachment.constant';
import {
  bytesToMegabytes,
  createLocalAttachmentDraft,
  downloadAttachment,
  formatFileSize,
  isAttachmentFileAccepted,
  isLocalAttachment,
  type AttachmentFormValue,
} from '@/utils/helper/file.helper';
import { DownloadSimpleIcon, FolderOpenIcon, InfoIcon, PaperclipIcon, WarningCircleIcon, XIcon } from '@phosphor-icons/react';
import { useRef, useState, type DragEvent } from 'react';
import { useTranslation } from 'react-i18next';

export type AppFileDropzoneProps = {
  label?: string;
  required?: boolean;
  errorMessage?: string;
  infoMessage?: string;
  secondaryInfoMessage?: string;
  accept?: string;
  acceptLabel?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number;
  files?: AttachmentFormValue[];
  onChange?: (files: AttachmentFormValue[]) => void;
  disabled?: boolean;
  uploading?: boolean;
  labelPlacement?: 'responsive' | 'top' | 'left';
  labelClassName?: string;
  containerClassName?: string;
  variant?: 'default' | 'dark';
};

const getDisplayName = (item: AttachmentFormValue) => (isLocalAttachment(item) ? item.file.name : item.file_name);

const getDisplaySize = (item: AttachmentFormValue) => (isLocalAttachment(item) ? item.file.size : item.file_size);

const AppFileDropzone = ({
  label,
  required = false,
  errorMessage,
  infoMessage,
  secondaryInfoMessage,
  accept = ATTACHMENT_ACCEPT,
  acceptLabel = ATTACHMENT_ACCEPT_LABEL,
  multiple = true,
  maxFiles = ATTACHMENT_MAX_FILES,
  maxSize = ATTACHMENT_MAX_SIZE_BYTES,
  files = [],
  onChange,
  disabled = false,
  uploading = false,
  labelPlacement = 'responsive',
  labelClassName,
  containerClassName,
  variant = 'default',
}: AppFileDropzoneProps) => {
  const { t: tCommon } = useTranslation('common');
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const isBusy = disabled || uploading;
  const maxSizeMB = bytesToMegabytes(maxSize) || ATTACHMENT_MAX_SIZE_MB;

  const validateFile = (file: File): boolean => {
    if (file.size > maxSize) {
      appToast.error(tCommon('notify.file_too_large', { size: maxSizeMB.toFixed(0) }));
      return false;
    }

    if (accept && !isAttachmentFileAccepted(file, accept)) {
      appToast.error(tCommon('notify.file_type_invalid'));
      return false;
    }

    return true;
  };

  const appendFiles = (selectedFiles: FileList | File[]) => {
    if (isBusy) return;

    const validFiles = Array.from(selectedFiles).filter(validateFile);
    if (!validFiles.length) return;

    const localItems = validFiles.map(createLocalAttachmentDraft);
    let nextItems = multiple ? [...files, ...localItems] : localItems;

    if (nextItems.length > maxFiles) {
      appToast.error(tCommon('notify.file_max_count', { count: maxFiles }));
      nextItems = nextItems.slice(0, maxFiles);
    }

    onChange?.(nextItems);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) {
      appendFiles(event.target.files);
    }
    event.target.value = '';
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer.files?.length) {
      appendFiles(event.dataTransfer.files);
    }
  };

  const handleRemove = (localId: string) => {
    if (isBusy) return;
    onChange?.(files.filter((file) => file.localId !== localId));
  };

  const canAddMore = files.length < maxFiles;

  const dropzone = (
    <div className='flex flex-col gap-3'>
      {!isBusy && canAddMore ? (
        <div
          role='button'
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              inputRef.current?.click();
            }
          }}
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={cn(
            'flex cursor-pointer flex-col items-center gap-1 rounded-lg border border-dashed px-6 py-4 text-center transition-colors',
            variant === 'dark'
              ? isDragging
                ? 'border-brand bg-neutral-800'
                : 'border-neutral-700 bg-neutral-900'
              : isDragging
                ? 'border-brand bg-red-50'
                : 'border-neutral-200 bg-neutral-50',
            errorMessage && 'border-danger',
          )}>
          <FolderOpenIcon className='mb-2 size-10 text-amber-400' weight='duotone' aria-hidden />
          <p className={cn('text-sm', variant === 'dark' ? 'text-neutral-400' : 'text-neutral-600')}>
            <span className='text-brand font-semibold'>클릭하여</span> 또는 파일을 여기에 드래그하여 업로드
          </p>
          {acceptLabel ? (
            <p className={cn('text-sm', variant === 'dark' ? 'text-neutral-500' : 'text-neutral-500')}>{acceptLabel}</p>
          ) : null}
        </div>
      ) : null}

      <input
        ref={inputRef}
        type='file'
        className='hidden'
        accept={accept}
        multiple={multiple}
        disabled={isBusy}
        onChange={handleInputChange}
      />

      {files.length > 0 ? (
        <ul className='flex flex-col gap-2'>
          {files.map((file) => {
            const displayName = getDisplayName(file);
            const displaySize = getDisplaySize(file);

            return (
              <li
                key={file.localId}
                className={cn(
                  'relative flex items-center gap-2 rounded-lg border px-3 py-2',
                  variant === 'dark' ? 'border-neutral-700 bg-neutral-900' : 'border-neutral-200 bg-white',
                )}>
                <PaperclipIcon className='size-4 shrink-0 text-neutral-500' aria-hidden />
                <div className='min-w-0 flex-1'>
                  <p className={cn('truncate text-sm', variant === 'dark' ? 'text-white' : 'text-neutral-950')}>{displayName}</p>
                  {displaySize ? <p className='text-xs text-neutral-400'>{formatFileSize(displaySize)}</p> : null}
                </div>
                {!isLocalAttachment(file) ? (
                  <Button
                    type='button'
                    variant='ghost'
                    size='xs'
                    onClick={() => void downloadAttachment(file)}
                    aria-label={`${displayName} download`}>
                    <DownloadSimpleIcon className='size-4' aria-hidden />
                  </Button>
                ) : null}
                {!isBusy ? (
                  <Button
                    type='button'
                    variant='ghost'
                    size='xs'
                    onClick={() => handleRemove(file.localId)}
                    aria-label={`${displayName} 삭제`}>
                    <XIcon className='size-4' aria-hidden />
                  </Button>
                ) : null}
                {uploading && isLocalAttachment(file) ? (
                  <div className='absolute inset-0 flex items-center justify-center rounded-lg bg-white/70'>
                    <Spinner className='size-4' />
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );

  return (
    <div
      className={cn(
        'w-full space-y-1.5',
        labelPlacement === 'responsive' && 'md:flex md:items-start md:gap-4',
        labelPlacement === 'left' && 'flex items-start gap-4',
        containerClassName,
      )}>
      {label ? (
        <div
          className={cn(
            'flex items-center gap-0.5',
            labelPlacement === 'responsive' && 'md:w-24',
            labelPlacement === 'left' && 'w-24',
            labelClassName,
          )}>
          <span className='text-sm font-medium text-neutral-500'>{label}</span>
          {required ? <span className='bg-danger size-1 min-w-1 rounded-full' aria-hidden /> : null}
        </div>
      ) : null}

      <div className='min-w-0 flex-1 space-y-1.5'>
        {dropzone}
        {infoMessage && !errorMessage ? (
          <p className='flex items-start gap-1 text-xs text-neutral-400'>
            <InfoIcon className='size-4 shrink-0 text-neutral-400' weight='fill' aria-hidden />
            {infoMessage}
          </p>
        ) : null}
        {secondaryInfoMessage && !errorMessage ? (
          <p className='flex items-start gap-1 text-xs text-neutral-400'>
            <InfoIcon className='size-4 shrink-0 text-neutral-400' weight='fill' aria-hidden />
            {secondaryInfoMessage}
          </p>
        ) : null}
        {errorMessage ? (
          <p className='text-danger flex items-start gap-1 text-xs'>
            <WarningCircleIcon className='text-danger size-4 shrink-0' weight='fill' aria-hidden />
            {errorMessage}
          </p>
        ) : null}
      </div>
    </div>
  );
};

export default AppFileDropzone;
