import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Eye, Image as ImageIcon, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

type Props = {
  images: string[];
  title?: string;
  className?: string;
};

export const CtaImageGalleryPreview: React.FC<Props> = ({ images = [], title = 'Image Preview', className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const validImages = images.filter(Boolean);

  const openGallery = (index: number) => {
    setSelectedIndex(index);
    setIsOpen(true);
  };

  const nextImage = () => {
    setSelectedIndex((prev) => (prev + 1) % validImages.length);
  };

  const prevImage = () => {
    setSelectedIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'Escape') setIsOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, validImages.length]);

  if (!validImages.length) {
    return <span className='text-muted-foreground text-xs'>-</span>;
  }

  const maxVisibleThumbnails = 3;
  const visibleImages = validImages.slice(0, maxVisibleThumbnails);
  const remainingCount = validImages.length - maxVisibleThumbnails;

  return (
    <>
      {/* Table Cell Thumbnail Presentation */}
      <div
        className={cn('group flex cursor-pointer items-center justify-center gap-1.5 py-1 select-none', className)}
        onClick={() => openGallery(0)}>
        <div className='flex items-center -space-x-3 transition-all duration-200 group-hover:space-x-1'>
          {visibleImages.map((src, idx) => (
            <div
              key={idx}
              className='border-background bg-muted relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border-2 shadow-xs transition-transform duration-200 group-hover:scale-105'
              title={`${title} - ${idx + 1}`}>
              <img src={src} alt={`${title}-${idx + 1}`} className='h-full w-full object-cover' />
              <div className='absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100'>
                <Eye className='h-3.5 w-3.5 text-white' />
              </div>
            </div>
          ))}
        </div>

        {remainingCount > 0 && (
          <span className='bg-muted text-muted-foreground border-border group-hover:bg-primary group-hover:text-primary-foreground flex h-7 items-center justify-center rounded-full border px-2 text-[11px] font-semibold transition-colors'>
            +{remainingCount}
          </span>
        )}
      </div>

      {/* Fullscreen Multi-Image Gallery Lightbox */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          showCloseButton={false}
          className='flex max-h-[95vh] max-w-[95vw] flex-col items-center justify-center rounded-2xl border-none bg-black/90 p-4 text-white shadow-2xl ring-0 outline-none sm:max-w-4xl'>
          <DialogTitle className='sr-only'>{title}</DialogTitle>

          {/* Header Bar */}
          <div className='flex w-full items-center justify-between px-2 pb-3'>
            <div className='flex items-center gap-2'>
              <ImageIcon className='h-4 w-4 text-white/80' />
              <span className='max-w-[300px] truncate text-sm font-medium text-white/90 sm:max-w-md'>{title}</span>
              <span className='rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold text-white'>
                {selectedIndex + 1} / {validImages.length}
              </span>
            </div>

            <Button
              type='button'
              size='icon'
              variant='ghost'
              onClick={() => setIsOpen(false)}
              className='size-9 rounded-full text-white/80 hover:bg-white/20 hover:text-white'>
              <X className='size-5' />
            </Button>
          </div>

          {/* Main Showcase Image Area */}
          <div className='relative flex max-h-[62vh] min-h-[320px] w-full items-center justify-center overflow-hidden rounded-xl bg-black/50'>
            {validImages[selectedIndex] && (
              <img
                src={validImages[selectedIndex]}
                alt={`${title}-${selectedIndex + 1}`}
                className='max-h-[60vh] max-w-full rounded-lg object-contain transition-all duration-150'
              />
            )}

            {/* Left / Right Nav Arrows */}
            {validImages.length > 1 && (
              <>
                <Button
                  type='button'
                  size='icon'
                  variant='ghost'
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className='absolute top-1/2 left-3 size-10 -translate-y-1/2 rounded-full bg-black/60 text-white shadow-md hover:bg-black/80'>
                  <ChevronLeft className='size-6' />
                </Button>
                <Button
                  type='button'
                  size='icon'
                  variant='ghost'
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className='absolute top-1/2 right-3 size-10 -translate-y-1/2 rounded-full bg-black/60 text-white shadow-md hover:bg-black/80'>
                  <ChevronRight className='size-6' />
                </Button>
              </>
            )}
          </div>

          {/* Bottom Thumbnail Strip */}
          {validImages.length > 1 && (
            <div className='mt-4 flex w-full max-w-full items-center justify-center gap-2 overflow-x-auto px-2 py-1'>
              {validImages.map((src, idx) => (
                <button
                  key={idx}
                  type='button'
                  onClick={() => setSelectedIndex(idx)}
                  className={cn(
                    'relative h-14 w-14 shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 bg-white/10 transition-all',
                    selectedIndex === idx
                      ? 'border-primary ring-primary scale-105 ring-2 ring-offset-2 ring-offset-black'
                      : 'border-transparent opacity-50 hover:opacity-100',
                  )}>
                  <img src={src} alt={`thumb-${idx}`} className='h-full w-full object-cover' />
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
