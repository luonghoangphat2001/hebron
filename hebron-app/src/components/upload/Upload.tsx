import { cn } from '@/lib/utils';
import { InfoIcon, PaperclipIcon, UploadIcon, WarningCircleIcon, XIcon } from '@phosphor-icons/react';
import { useRef } from 'react';
import { Button } from '../ui/button';

export type FileItem = {
  id: string;
  name: string;
  size?: number;
  type?: string;
  url?: string;
  file?: File;
};

export type UploadProps = {
  label?: string;
  labelButton?: string;
  errorMessage?: string;
  infoMessage?: string;
  required?: boolean;
  multiple?: boolean;
  accept?: string;
  files?: FileItem[];
  onChange?: (files: FileItem[]) => void;
  onRemove?: (id: string) => void;
  maxFiles?: number;
  disabled?: boolean;
  readOnly?: boolean;
};

const Upload = ({
  label,
  labelButton,
  errorMessage,
  infoMessage,
  required = false,
  multiple = true,
  accept,
  files = [],
  onChange,
  onRemove,
  maxFiles,
  disabled = false,
  readOnly = false,
}: UploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    if (disabled || readOnly) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled || readOnly) return;
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      const newFiles: FileItem[] = Array.from(selectedFiles).map((file) => ({
        id: Math.random().toString(36).substring(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        file: file,
      }));

      const updatedFiles = multiple ? [...files, ...newFiles] : newFiles;
      const limitedFiles = maxFiles ? updatedFiles.slice(0, maxFiles) : updatedFiles;
      onChange?.(limitedFiles);
    }
    // Reset input value to allow selecting same file again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemove = (id: string) => {
    if (disabled || readOnly) return;
    onRemove?.(id);
    onChange?.(files.filter((f) => f.id !== id));
  };

  return (
    <div>
      <div className={cn('w-full space-y-1.5 md:flex md:items-start md:gap-4')}>
        {label && (
          <div className={cn('flex items-center gap-0.5 md:w-24')}>
            <label className='text-sm font-medium text-neutral-500'>{label}</label>
            {required && <p className='bg-danger size-1 rounded-full'></p>}
          </div>
        )}
        <input
          type='file'
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple={multiple}
          accept={accept}
          className='hidden'
        />
        <div>
          <Button variant='outline' type='button' onClick={handleButtonClick} className='w-39'>
            {labelButton} <UploadIcon size={20} className='text-neutral-500' />
          </Button>
          {infoMessage && (
            <p className={cn('mt-1.5 flex items-center gap-1 text-xs text-neutral-400')}>
              <InfoIcon className='size-4 text-neutral-400' weight='fill' />
              {infoMessage}
            </p>
          )}
          {errorMessage && (
            <p className={cn('text-danger mt-1.5 flex items-center gap-1 text-xs')}>
              <WarningCircleIcon className='text-danger size-4' weight='fill' />
              {errorMessage}
            </p>
          )}

          {files.length > 0 && (
            <div className='mt-2'>
              {files.map((file) => (
                <div key={file.id} className={'flex items-center gap-2'}>
                  <PaperclipIcon className={cn('size-4 text-neutral-500')} />
                  <p className={'max-w-100 truncate text-sm text-neutral-500'}>{file.name}</p>
                  <Button variant='ghost' size='xs' onClick={() => handleRemove(file.id)}>
                    <XIcon size={16} />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Upload;
