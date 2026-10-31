import AppDescription from '@/components/description/AppDescription';
import { ImageColumnPreview } from '@/components/dialog/ImagePreviewDialog';
import FormItem from '@/components/form/FormItem';
import { AppRichTextEditor } from '@/components/shared/app-rich-text-editor';
import { Badge } from '@/components/ui/badge';
import type { Media } from '@/data/media/media.response';
import { cn } from '@/lib/utils';
import { STATUS_BADGE } from '@/utils/constants/common.constant';
import { Status } from '@/utils/enums/common.enum';
import { FileType } from '@/utils/enums/file.enum';
import { toStorageUrl } from '@/utils/helper/storage-url.helper';
import { ImageOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = {
  media?: Media | null;
};

const MediaDetailView = ({ media }: Props) => {
  const { t: tContent } = useTranslation('content');
  const { t: tCommon } = useTranslation('common');
  const { t: tEnum } = useTranslation('enum');

  if (!media) {
    return <p className='text-muted-foreground py-8 text-center text-sm'>{tContent('media.empty')}</p>;
  }

  // one upload backs both fields, so image_url and url point at the same picture
  const preview = toStorageUrl(media.image_url || media.url);

  return (
    <div className='space-y-5'>
      <div className='flex items-start justify-between gap-3'>
        <div className='min-w-0'>
          <p className='truncate text-base font-semibold'>{media.title}</p>
          <p className='text-muted-foreground truncate text-sm'>
            {/* {tEnum(`common.${media.site_type}` as 'common.BRAND_SITE')} */}
            {media.category?.name || '-'}
          </p>
        </div>
        <Badge className={cn('shrink-0', STATUS_BADGE[media.is_active ? Status.ACTIVE : Status.INACTIVE])}>
          {tEnum(media.is_active ? 'common.ACTIVE' : 'common.INACTIVE')}
        </Badge>
      </div>

      <div className='space-y-1.5'>
        <p className='text-muted-foreground text-sm'>{tContent('image.field_image')}</p>
        {preview ? (
          <ImageColumnPreview
            src={preview}
            alt={media.title}
            className='h-56 w-full rounded-lg border'
            previewLabel={tCommon('button.preview')}
          />
        ) : (
          <div className='text-muted-foreground flex h-56 w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed'>
            <ImageOff className='size-5 opacity-50' />
            <span className='text-xs'>-</span>
          </div>
        )}
      </div>

      <AppDescription
        columns={2}
        items={[
          { label: tContent('filter.category'), value: media.category?.name },
          { label: tContent('media.field_sort_order'), value: String(media.sort_order ?? 0) },
          {
            label: tContent('media.field_link_url'),
            value: media.link_url ? (
              <a
                href={media.link_url}
                target='_blank'
                rel='noreferrer'
                className='text-primary break-all underline-offset-2 hover:underline'>
                {media.link_url}
              </a>
            ) : undefined,
          },
        ]}
      />

      {/* ── Description ── */}
      <div className='rounded-md border border-gray-200 p-4'>
        <p className='mb-3 text-lg font-medium'>{tContent('portfolio.section_description')}</p>
        <FormItem label={tContent('media.field_description')}>
          <AppRichTextEditor
            value={media.description || ''}
            disabled
            placeholder={tContent('media.ph_description')}
            imageUploadMode='immediate'
            imageFileType={FileType.MEDIA}
          />
        </FormItem>
      </div>
    </div>
  );
};

export default MediaDetailView;
