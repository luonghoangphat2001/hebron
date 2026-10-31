import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useImageFit, type ObjectFitMode } from '@/hooks/useImageFit';
import { cn } from '@/lib/utils';
import { Eye, Loader2, Maximize2, Minimize2, X } from 'lucide-react';
import React, { useRef, useState } from 'react';

type ImageFullscreenDialogProps = {
  url: string | null | undefined;
  onClose: () => void;
  defaultFit?: 'contain' | 'cover';
};

export const ImagePreviewDialog = ({ url, onClose, defaultFit = 'contain' }: ImageFullscreenDialogProps) => {
  const [prevUrl, setPrevUrl] = useState(url);
  const [overriddenFit, setOverriddenFit] = useState<ObjectFitMode | null>(null);

  // Reset override when url changes
  if (prevUrl !== url) {
    setPrevUrl(url);
    setOverriddenFit(null);
  }

  if (!url) return null;

  const currentFit: ObjectFitMode = overriddenFit ?? (defaultFit === 'cover' ? 'object-cover' : 'object-contain');

  const toggleFit = () => {
    setOverriddenFit(currentFit === 'object-contain' ? 'object-cover' : 'object-contain');
  };

  return (
    <Dialog open={!!url} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className='flex max-h-[90vh] max-w-[90vw] items-center justify-center border-none bg-transparent p-0 shadow-none ring-0 outline-none focus:ring-0 sm:max-w-none'>
        <div className='relative flex max-h-[90vh] max-w-[90vw] items-center justify-center'>
          {/* Action buttons */}
          <div className='absolute top-0 -right-14 flex flex-col gap-2'>
            <button
              type='button'
              onClick={onClose}
              title='Close'
              className='flex size-10 cursor-pointer items-center justify-center rounded-xl bg-white/90 p-2 text-gray-800 shadow-md backdrop-blur-xs transition-colors hover:bg-white'>
              <X className='size-5' />
            </button>
            <button
              type='button'
              onClick={toggleFit}
              title={currentFit === 'object-contain' ? 'Fit Cover' : 'Fit Contain'}
              className='flex size-10 cursor-pointer items-center justify-center rounded-xl bg-white/90 p-2 text-gray-800 shadow-md backdrop-blur-xs transition-colors hover:bg-white'>
              {currentFit === 'object-contain' ? <Maximize2 className='size-4' /> : <Minimize2 className='size-4' />}
            </button>
          </div>

          <img
            src={url}
            alt='Preview'
            className={cn(
              'max-h-[90vh] max-w-[90vw] rounded-[20px] transition-all duration-200',
              currentFit === 'object-contain' ? 'object-contain' : 'aspect-square h-[80vh] w-[80vh] object-cover',
            )}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

type ImageColumnPreviewProps = {
  src: string | null | undefined;
  alt?: string;
  className?: string;
  previewLabel?: string;
  onClick?: () => void;
};

export const ImageColumnPreview = ({
  src,
  alt = 'Thumbnail',
  className,
  previewLabel = 'Preview',
  onClick,
}: ImageColumnPreviewProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { fit, isLoading } = useImageFit(src, containerRef);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      setIsDialogOpen(true);
    }
  };

  return (
    <>
      <div
        ref={containerRef}
        role={src ? 'button' : undefined}
        tabIndex={src ? 0 : undefined}
        onClick={src ? handleClick : undefined}
        onKeyDown={src ? (e) => e.key === 'Enter' && handleClick() : undefined}
        className={cn(
          'group relative inline-flex items-center justify-center overflow-visible rounded-md border border-neutral-200 bg-neutral-100 transition-all',
          src ? 'cursor-pointer' : 'cursor-default',
          className,
        )}>
        <div className='relative flex h-full w-full items-center justify-center overflow-hidden rounded-md'>
          {isLoading ? (
            <div className='flex h-full w-full items-center justify-center bg-neutral-200/50 dark:bg-neutral-800/50'>
              <Loader2 className='size-4 animate-spin text-neutral-500' />
            </div>
          ) : (
            <img
              src={src || undefined}
              alt={alt}
              className={cn('h-full w-full transition-transform duration-200 group-hover:scale-105', fit)}
            />
          )}

          {src && !isLoading && (
            <div className='absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition-opacity duration-200 group-hover:opacity-100'>
              <Eye className='size-5 stroke-[2.5] text-white' />
            </div>
          )}
        </div>

        {/* "Preview" badge — bottom-right corner */}
        {src && !isLoading && (
          <span className='pointer-events-none absolute -right-3 -bottom-1.5 z-10 rounded border border-neutral-300 bg-[#e5e5e5] px-2 py-0.5 text-[11px] font-medium text-neutral-800 opacity-0 shadow-md transition-all duration-200 select-none group-hover:opacity-100'>
            {previewLabel}
          </span>
        )}
      </div>

      {/* Self-managed fullscreen dialog (skipped when onClick is overridden) */}
      {!onClick && <ImagePreviewDialog url={isDialogOpen ? src : null} onClose={() => setIsDialogOpen(false)} />}
    </>
  );
};

export default ImagePreviewDialog;
