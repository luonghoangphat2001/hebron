import FormItem from '@/components/form/FormItem';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group';
import { cn } from '@/lib/utils';
import { FileImage, ImageOff, ImagePlus, Link2, Loader2, Upload, X } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  target: { slug: string; label: string } | null;
  value: string | File;
  onValueChange: (value: string | File) => void;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
};

export const CategoryTabImageDialog: React.FC<Props> = ({ target, value, onValueChange, saving = false, onClose, onSubmit }) => {
  const { t: tContent } = useTranslation('content');
  const { t: tCommon } = useTranslation('common');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const isFile = typeof value !== 'string';
  const src = useMemo(() => (typeof value === 'string' ? value.trim() : URL.createObjectURL(value)), [value]);
  useEffect(() => {
    if (typeof value === 'string') return;
    return () => URL.revokeObjectURL(src);
  }, [value, src]);

  const hasImage = !!src;
  // failedSrc is per url, so typing a new url clears the error on its own
  const isBroken = hasImage && failedSrc === src;

  const pickFile = (file?: File) => {
    if (file?.type.startsWith('image/')) onValueChange(file);
  };
  const openFilePicker = () => fileInputRef.current?.click();

  return (
    <Dialog open={!!target} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='sm:max-w-xl'>
        <form onSubmit={onSubmit} noValidate className='min-w-0 space-y-5'>
          <DialogHeader>
            <DialogTitle className='flex flex-wrap items-center gap-2 text-base font-bold'>
              <ImagePlus className='text-primary h-4 w-4' />
              {target?.label}
              <Badge variant='outline' className='font-mono text-[10px] font-normal'>
                {target?.slug}
              </Badge>
            </DialogTitle>
            <DialogDescription className='text-xs'>{tContent('homepage.showcase_tab_image_desc')}</DialogDescription>
          </DialogHeader>

          <input
            ref={fileInputRef}
            type='file'
            accept='image/*'
            className='hidden'
            onChange={(e) => {
              pickFile(e.target.files?.[0]);
              e.target.value = ''; // allow picking the same file again
            }}
          />

          <div className='grid grid-cols-[minmax(0,1fr)] gap-5 sm:grid-cols-[176px_minmax(0,1fr)]'>
            <button
              type='button'
              disabled={saving}
              onClick={openFilePicker}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                pickFile(e.dataTransfer.files?.[0]);
              }}
              aria-label={tContent(hasImage ? 'homepage.change_image' : 'homepage.upload_image')}
              className={cn(
                'group bg-card focus-visible:ring-ring/50 mx-auto w-44 rounded-xl border p-2.5 text-center shadow-2xs transition-colors outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-60 sm:mx-0 sm:w-full',
                isDragging ? 'border-primary bg-primary/5 ring-primary/30 ring-2' : 'hover:border-primary/50',
              )}>
              <div className='bg-muted relative aspect-square w-full overflow-hidden rounded-lg border'>
                {hasImage && !isBroken ? (
                  <>
                    <img src={src} alt={target?.label} onError={() => setFailedSrc(src)} className='h-full w-full object-cover' />
                    <div className='absolute inset-0 flex items-center justify-center gap-1 bg-black/45 text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100'>
                      <Upload className='h-3.5 w-3.5' /> {tContent('homepage.change_image')}
                    </div>
                  </>
                ) : (
                  <div
                    className={cn(
                      'flex h-full flex-col items-center justify-center gap-1.5 p-3 text-[11px] leading-tight',
                      isBroken ? 'text-destructive bg-destructive/5' : 'text-muted-foreground',
                    )}>
                    {isBroken ? <ImageOff className='h-6 w-6' /> : <ImagePlus className='h-6 w-6' />}
                    {tContent(isBroken ? 'homepage.image_load_failed' : 'homepage.drop_or_click_image')}
                  </div>
                )}
              </div>
              <p className='text-foreground mt-2 line-clamp-1 text-xs font-bold'>{target?.label}</p>
            </button>

            <FormItem label={tContent('homepage.showcase_tab_image')} required>
              <div className='space-y-3'>
                {isFile ? (
                  <div className='bg-muted/40 flex items-center gap-2.5 rounded-lg border px-3 py-2'>
                    <FileImage className='text-primary h-4 w-4 shrink-0' />
                    <div className='min-w-0 flex-1'>
                      <p className='truncate text-xs font-medium'>{value.name}</p>
                      <p className='text-muted-foreground text-[10px]'>{Math.max(1, Math.round(value.size / 1024))} KB</p>
                    </div>
                    <Button
                      type='button'
                      size='icon'
                      variant='ghost'
                      disabled={saving}
                      onClick={() => onValueChange('')}
                      aria-label={tCommon('button.delete')}
                      className='text-muted-foreground hover:text-destructive h-7 w-7'>
                      <X className='h-3.5 w-3.5' />
                    </Button>
                  </div>
                ) : (
                  <Button type='button' variant='outline' disabled={saving} onClick={openFilePicker} className='w-full gap-1.5'>
                    <Upload className='h-3.5 w-3.5' /> {tContent('homepage.upload_image')}
                  </Button>
                )}

                <div className='text-muted-foreground flex items-center gap-2 text-[11px]'>
                  <span className='bg-border h-px flex-1' />
                  {tContent('homepage.or_paste_image_url')}
                  <span className='bg-border h-px flex-1' />
                </div>

                <InputGroup>
                  <InputGroupAddon>
                    <Link2 />
                  </InputGroupAddon>
                  <InputGroupInput
                    value={isFile ? '' : value}
                    onChange={(e) => onValueChange(e.target.value)}
                    placeholder='https://...'
                    disabled={saving}
                    aria-invalid={!isFile && isBroken}
                    className='font-mono text-xs'
                  />
                  {!isFile && value && (
                    <InputGroupAddon align='inline-end'>
                      <InputGroupButton
                        size='icon-xs'
                        disabled={saving}
                        onClick={() => onValueChange('')}
                        aria-label={tCommon('button.delete')}>
                        <X />
                      </InputGroupButton>
                    </InputGroupAddon>
                  )}
                </InputGroup>
              </div>
            </FormItem>
          </div>

          <DialogFooter className='border-t pt-4'>
            <Button type='button' variant='outline' onClick={onClose}>
              {tCommon('button.cancel')}
            </Button>
            <Button type='submit' disabled={saving || !hasImage}>
              {saving && <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' />}
              {tCommon('button.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryTabImageDialog;
