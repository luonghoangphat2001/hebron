import { ImageColumnPreview } from '@/components/dialog/ImagePreviewDialog';
import { Badge } from '@/components/ui/badge';
import type { MallSection } from '@/data/homepage-management/homepage.type';
import { ImageIcon, Sparkles } from 'lucide-react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  section: MallSection;
  onSaveSection?: (payload?: any) => Promise<any> | void;
};

export const AboutCtaView: React.FC<Props> = ({ section }) => {
  const { t: tCommon } = useTranslation('common');
  const { t: tContent } = useTranslation('content');
  const { t: tEnum } = useTranslation('enum');

  const rawSection: any = section.rawSection || section;
  const content = useMemo(() => rawSection?.content || {}, [rawSection?.content]);

  const images: string[] = useMemo(() => {
    if (Array.isArray(content.item)) {
      return content.item
        .slice(0, 20)
        .map((it: any) => it?.image)
        .filter(Boolean);
    }
    if (Array.isArray(content.product_images)) {
      return content.product_images.slice(0, 20).filter(Boolean);
    }
    return [];
  }, [content]);

  return (
    <div className='space-y-6'>
      {/* 1. Header Bar */}
      <div className='bg-card flex flex-col gap-4 rounded-2xl border p-5 shadow-2xs sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-center gap-3'>
          <div className='bg-primary/10 text-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-xl'>
            <Sparkles className='h-5 w-5' />
          </div>
          <div>
            <div className='flex flex-wrap items-center gap-2'>
              <h3 className='text-foreground text-base font-bold'>
                {rawSection?.title || section.name || tEnum('content.about_cta', '제작 문의')}
              </h3>
              <Badge variant='secondary' className='text-xs font-semibold'>
                {tContent('homepage.total_images_count', { count: images.length })}
              </Badge>
              <Badge variant='outline' className='text-[10px]'>
                {tContent('homepage.view_only')}
              </Badge>
            </div>
            {rawSection?.subtitle && <p className='text-muted-foreground mt-0.5 text-xs font-medium'>{rawSection.subtitle}</p>}
          </div>
        </div>
      </div>

      {/* 2. Showcase Images Gallery (View Only) */}
      <div className='bg-card space-y-4 rounded-2xl border p-6 shadow-2xs'>
        <div className='flex items-center justify-between border-b pb-3'>
          <div className='flex items-center gap-2'>
            <ImageIcon className='text-primary h-4 w-4' />
            <h4 className='text-foreground text-sm font-bold'>{tContent('homepage.showcase_images_gallery')}</h4>
          </div>
          <span className='text-muted-foreground text-xs'>
            {tContent('homepage.total_images_count', { count: images.length })}
          </span>
        </div>

        {images.length === 0 ? (
          <div className='border-muted text-muted-foreground flex flex-col items-center justify-center rounded-xl border border-dashed py-14 text-center'>
            <ImageIcon className='mb-2 h-10 w-10 opacity-30' />
            <p className='text-xs font-medium'>{tContent('homepage.no_showcase_images')}</p>
            <p className='mt-1 text-[11px] opacity-70'>{tContent('homepage.no_showcase_images_desc')}</p>
          </div>
        ) : (
          <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'>
            {images.map((imgUrl, idx) => (
              <div
                key={idx}
                className='group bg-muted/40 border-border/80 hover:border-primary/50 relative aspect-3/4 overflow-hidden rounded-xl border shadow-2xs transition-all'>
                <ImageColumnPreview
                  src={imgUrl}
                  alt={`Showcase ${idx + 1}`}
                  className='h-full w-full rounded-xl object-cover'
                  previewLabel={tCommon('button.preview')}
                />

                <div className='pointer-events-none absolute top-2 left-2'>
                  <Badge className='bg-background/90 text-foreground font-mono text-[10px] font-bold shadow-xs backdrop-blur-xs'>
                    #{idx + 1}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AboutCtaView;
