import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FileText, UploadIcon, X } from 'lucide-react';
import { useMemo, useRef } from 'react';

type UploadType = 'image' | 'file';

type UploadItem = string | File;
type UploadValue = UploadItem | UploadItem[];

type Props = {
  value?: UploadValue;
  onChange?: (value?: UploadValue) => void;
  type?: UploadType;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  accept?: string;
  previewHeight?: string;
};

const itemName = (item: UploadItem) => (typeof item === 'string' ? item.split('/').pop() || 'file' : item.name);

// blob URLs are never revoked — fine for an admin form with a handful of uploads per session
const previewSrc = (item: UploadItem) => (typeof item === 'string' ? item : URL.createObjectURL(item));

export default function AppUpload({
  value,
  onChange,
  type = 'image',
  multiple = false,
  disabled,
  className,
  accept,
  previewHeight = 'h-[240px] w-full',
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const items = useMemo<UploadItem[]>(() => (!value ? [] : Array.isArray(value) ? value : [value]), [value]);

  const finalAccept = useMemo(() => accept ?? (type === 'image' ? 'image/*' : '*'), [accept, type]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // allow selecting the same file again
    e.target.value = '';

    onChange?.(multiple ? [...items, ...files] : files[0]);
  };

  const handleRemove = (index: number) => {
    const nextItems = items.filter((_, i) => i !== index);
    onChange?.(multiple ? nextItems : nextItems[0]);
  };

  return (
    <div className={cn('space-y-3', className)}>
      <input
        ref={inputRef}
        type='file'
        multiple={multiple}
        accept={finalAccept}
        className='hidden'
        disabled={disabled}
        onChange={handleUpload}
      />

      {items.length > 0 && (
        <div className='space-y-3'>
          {items.map((item, index) => (
            <div key={index} className={cn('relative overflow-hidden rounded-md border', type === 'image' && previewHeight)}>
              {type === 'image' ? (
                <div className='bg-muted/30 flex h-full w-full items-center justify-center'>
                  <img src={previewSrc(item)} alt={itemName(item)} className='h-full w-full object-cover' />
                </div>
              ) : (
                <div className='flex items-center gap-3 p-4 pr-12'>
                  <div className='bg-muted flex size-10 items-center justify-center rounded-md'>
                    <FileText className='size-5' />
                  </div>

                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-sm font-medium'>{itemName(item)}</p>
                  </div>
                </div>
              )}

              <Button
                type='button'
                size='icon'
                variant='destructive'
                className='absolute top-2 right-2 z-10 size-8'
                onClick={() => handleRemove(index)}>
                <X className='size-4' />
              </Button>
            </div>
          ))}
        </div>
      )}

      {(!items.length || multiple) && (
        <button
          type='button'
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'hover:bg-accent flex flex-col items-center justify-center gap-2 rounded-md border border-dashed transition-colors',
            type === 'image' ? previewHeight : 'min-h-[120px] w-full',
            disabled && 'cursor-not-allowed opacity-50',
          )}>
          <UploadIcon className='text-muted-foreground size-5' />

          <span className='text-muted-foreground text-sm'>Click to upload {type}</span>
        </button>
      )}
    </div>
  );
}
