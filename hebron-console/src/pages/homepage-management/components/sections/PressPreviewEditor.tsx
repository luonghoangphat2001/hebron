import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { appToast } from '@/components/toast/AppToast';
import type { UpdatePageSectionREQ } from '@/data/homepage-management/homepage.request';
import {
  buildPressPreviewUpdatePayload,
  extractMediaIds,
  extractMediaItems,
  getMediaThumbnail,
  toMediaSectionItem,
  transformMediaToDialogItems,
} from '@/data/homepage-management/homepage.service';
import type { DialogListDataItem, MallSection } from '@/data/homepage-management/homepage.type';
import { useMediaInfiniteQuery } from '@/data/media/media.query';
import type { Media } from '@/data/media/media.response';
import { SiteType } from '@/utils/enums/common.enum';
import { stripHtml } from '@/utils/helper/string.helper';
import { ExternalLink, ImageIcon, Loader2, Newspaper, Plus, Trash2 } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DialogListData from '../DialogListData';
import SectionItemLimitControl from '../SectionItemLimitControl';
import SectionHeader from '../ui/SectionHeader';
import SectionHeadingDescription from '../ui/SectionHeadingDescription';

type Props = {
  section?: MallSection;
  rawContent?: any;
  siteType?: SiteType;
  onSaveSection?: (payload?: Partial<UpdatePageSectionREQ>) => Promise<any> | void;
  isSaving?: boolean;
};

type MediaPreviewCardProps = {
  media: any;
  index: number;
  isSaving?: boolean;
  onDelete: (id: number) => void;
};

export const MediaPreviewCard: React.FC<MediaPreviewCardProps> = ({ media, index, isSaving, onDelete }) => {
  const mediaId = Number(media.id);
  const mediaTitle = media.title || `Media #${mediaId || index + 1}`;
  const mediaImage = getMediaThumbnail(media);
  const categoryName =
    typeof media.category === 'object' && media.category !== null
      ? media.category.name
      : typeof media.category === 'string'
        ? media.category
        : '';
  const mediaDesc = media.description || media.subtitle || '';
  const linkUrl = media.link_url || media.link || media.url || '';
  const createdDate = media.created_at || media.published_at || '';

  return (
    <div className='group bg-card hover:border-primary/40 relative flex flex-col justify-between overflow-hidden rounded-2xl border shadow-2xs transition-all duration-200 hover:shadow-md'>
      {/* Top Media Thumbnail */}
      <div className='bg-muted relative aspect-16/10 w-full overflow-hidden'>
        {mediaImage ? (
          <img
            src={mediaImage}
            alt={mediaTitle}
            className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
          />
        ) : (
          <div className='text-muted-foreground flex h-full w-full items-center justify-center'>
            <ImageIcon className='h-8 w-8 opacity-40' />
          </div>
        )}

        {categoryName && (
          <div className='absolute top-2.5 left-2.5 flex items-center gap-1 rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs backdrop-blur-xs'>
            <span>{categoryName}</span>
          </div>
        )}

        <div className='absolute top-2.5 right-2.5 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100'>
          <Button
            size='icon'
            variant='destructive'
            disabled={isSaving}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(mediaId);
            }}
            className='h-7 w-7 rounded-full shadow-xs'>
            {isSaving ? <Loader2 className='h-3.5 w-3.5 animate-spin' /> : <Trash2 className='h-3.5 w-3.5' />}
          </Button>
        </div>
      </div>

      {/* Content Body */}
      <div className='flex flex-1 flex-col justify-between space-y-3 p-4'>
        <div className='space-y-1.5'>
          {categoryName && <span className='text-primary text-[11px] font-bold tracking-wide uppercase'>{categoryName}</span>}
          <h5 className='text-foreground line-clamp-1 text-sm font-bold tracking-tight'>{mediaTitle}</h5>
          {mediaDesc && <p className='text-muted-foreground line-clamp-2 text-xs leading-relaxed'>{stripHtml(mediaDesc)}</p>}
        </div>

        {/* Footer metadata */}
        <div className='border-border/60 flex items-center justify-between border-t pt-2.5 text-[11px] text-slate-400'>
          {linkUrl ? (
            <a
              href={linkUrl}
              target='_blank'
              rel='noreferrer'
              onClick={(e) => e.stopPropagation()}
              className='text-muted-foreground hover:text-primary flex items-center gap-1 truncate font-mono text-[10px]'>
              <span className='truncate'>{linkUrl}</span>
              <ExternalLink className='h-2.5 w-2.5 shrink-0' />
            </a>
          ) : (
            <span />
          )}
          {createdDate && <span className='shrink-0 font-mono text-[10px]'>{createdDate.slice(0, 10)}</span>}
        </div>
      </div>
    </div>
  );
};

export const PressPreviewEditor: React.FC<Props> = ({
  section,
  rawContent: rawContentProp,
  siteType = SiteType.BRAND_SITE,
  onSaveSection,
  isSaving,
}) => {
  const { t: tContent } = useTranslation('content');
  const { t: tEnum } = useTranslation('enum');
  const [isOpen, setIsOpen] = useState(false);

  const rawContent = rawContentProp || section?.rawSection?.content || {};

  const [heading, setHeading] = useState(rawContent?.heading || section?.rawSection?.title || '언론보도');
  const [description, setDescription] = useState(
    rawContent?.description ||
      section?.rawSection?.description ||
      section?.rawSection?.subtitle ||
      '헤브론의 주요 소식과 언론 보도 내용을 소개합니다.',
  );

  const mediaQueryParams = useMemo(
    () => ({
      site_type: siteType,
      is_active: true,
    }),
    [siteType],
  );

  const {
    data: mediaInfiniteData,
    isLoading: isMediaLoading,
    isFetchingNextPage: isFetchingMoreMedia,
    hasNextPage: hasMoreMedia,
    fetchNextPage: fetchMoreMedia,
  } = useMediaInfiniteQuery(mediaQueryParams);

  const allMedia = useMemo(() => {
    return mediaInfiniteData?.media || [];
  }, [mediaInfiniteData]);

  const currentLimit = Number(rawContent?.limit) || 3;

  const currentMediaIds = useMemo(() => {
    return extractMediaIds(rawContent);
  }, [rawContent]);

  const displayMedia = useMemo(() => {
    const items = extractMediaItems(rawContent);
    if (items.length > 0) return items.slice(0, currentLimit);
    if (currentMediaIds.length > 0 && allMedia.length > 0) {
      return currentMediaIds
        .map((id) => allMedia.find((m: any) => Number(m.id) === id))
        .filter((m): m is Media => Boolean(m))
        .slice(0, currentLimit);
    }
    return [];
  }, [rawContent, currentLimit, currentMediaIds, allMedia]);

  const dialogItems: DialogListDataItem[] = useMemo(() => {
    return transformMediaToDialogItems(allMedia);
  }, [allMedia]);

  const saveChanges = (ids: number[], limit: number, customHeading?: string, customDescription?: string) => {
    const selectedItems = ids
      .map((id) => allMedia.find((m: any) => Number(m.id) === id) || displayMedia.find((m: any) => Number(m.id) === id))
      .filter(Boolean)
      .map(toMediaSectionItem);

    onSaveSection?.(
      buildPressPreviewUpdatePayload(
        selectedItems as any,
        customHeading ?? heading,
        customDescription ?? description,
        rawContent.layout || 'coverflow',
        section?.name || '언론보도',
        section,
        ids,
        limit,
      ),
    );
  };

  const handleSaveOverview = () => {
    saveChanges(currentMediaIds, currentLimit, heading, description);
  };

  const handleOpenAddModal = () => {
    if (currentMediaIds.length >= currentLimit) {
      appToast.warning(
        tContent('homepage.limit_reached', { limit: currentLimit }) ||
          `최대 ${currentLimit}개까지 등록할 수 있습니다. 항목 수를 늘려주세요.`,
      );
      return;
    }
    setIsOpen(true);
  };

  const handleConfirmAddMedia = (selectedIds: (string | number)[]) => {
    const numericSelectedIds = selectedIds.map(Number).filter((id) => !isNaN(id) && id > 0);
    const newIds = Array.from(new Set([...currentMediaIds, ...numericSelectedIds]));
    saveChanges(newIds, currentLimit);
  };

  const handleDelete = (mediaId: number) => {
    const newIds = currentMediaIds.filter((id) => id !== mediaId);
    saveChanges(newIds, currentLimit);
  };

  const handleLimitChange = (newLimit: number) => {
    saveChanges(currentMediaIds, newLimit);
  };

  return (
    <div className='space-y-6'>
      {/* 1. Header bar with save button */}
      <SectionHeader
        title={section?.name || tEnum('content.press_preview', '언론보도')}
        icon={Newspaper}
        badgeText={tContent('homepage.items_count_suffix', { count: displayMedia.length })}
        onCreate={handleOpenAddModal}
        createLabel={tContent('homepage.link_media')}
        createDisabled={isSaving}
        onSave={handleSaveOverview}
        isSaving={isSaving}
        saveDisabled={isSaving}
      />

      {/* 2. Section Overview: Heading & Description */}
      <SectionHeadingDescription
        heading={heading}
        onChangeHeading={setHeading}
        description={description}
        onChangeDescription={setDescription}
        headingLabel={tContent('homepage.section_heading', 'Section Heading')}
        descriptionLabel={tContent('homepage.section_description', 'Section Description')}
      />

      {/* 3. Media Items List */}
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Newspaper className='text-primary h-4 w-4' />
            <h4 className='text-sm font-semibold'>{tContent('homepage.press_media_count', { count: displayMedia.length })}</h4>
            <Badge variant='outline' className='font-mono text-[10px]'>
              {tContent('homepage.flag_limit', { count: currentLimit })}
            </Badge>
          </div>
          <Button size='sm' onClick={handleOpenAddModal} disabled={isSaving} className='h-8 gap-1.5 text-xs font-semibold'>
            {isSaving ? <Loader2 className='h-3.5 w-3.5 animate-spin' /> : <Plus className='h-3.5 w-3.5' />}
            {tContent('homepage.link_media')}
          </Button>
        </div>

        {/* Card Grid Matching NoticesPreviewEditor Layout */}
        {displayMedia.length > 0 ? (
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {displayMedia.map((media, idx) => (
              <MediaPreviewCard key={media.id || idx} media={media} index={idx} isSaving={isSaving} onDelete={handleDelete} />
            ))}
          </div>
        ) : isMediaLoading ? (
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {Array.from({ length: currentLimit || 3 }).map((_, idx) => (
              <div key={idx} className='overflow-hidden rounded-2xl border'>
                <Skeleton className='h-40 w-full' />
                <div className='space-y-2 p-4'>
                  <Skeleton className='h-3 w-20' />
                  <Skeleton className='h-4 w-3/4' />
                  <Skeleton className='h-3 w-full' />
                  <Skeleton className='h-3 w-2/3' />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='bg-muted/10 space-y-2.5 rounded-2xl border border-dashed p-10 text-center'>
            <Newspaper className='text-muted-foreground mx-auto h-8 w-8' />
            <p className='text-foreground text-xs font-semibold'>{tContent('homepage.no_media')}</p>
            <p className='text-muted-foreground text-[11px]'>{tContent('homepage.no_media')}</p>
            <Button size='sm' variant='outline' onClick={handleOpenAddModal} disabled={isSaving} className='h-7 gap-1 text-xs'>
              {isSaving ? <Loader2 className='h-3 w-3 animate-spin' /> : <Plus className='h-3 w-3' />}{' '}
              {tContent('homepage.link_media')}
            </Button>
          </div>
        )}

        {/* Item Limit Control */}
        <SectionItemLimitControl limit={currentLimit} onChange={handleLimitChange} disabled={isSaving} options={[3, 6, 9, 12]} />
      </div>

      {/* Reusable Media Picker Modal via DialogListData */}
      <DialogListData
        open={isOpen}
        onOpenChange={setIsOpen}
        icon={<Newspaper className='text-primary h-5 w-5' />}
        title={tContent('homepage.link_media')}
        description={tContent('homepage.link_media_dialog_desc')}
        items={dialogItems}
        isLoading={isMediaLoading}
        hasMore={hasMoreMedia}
        isLoadingMore={isFetchingMoreMedia}
        onLoadMore={fetchMoreMedia}
        existingKeys={currentMediaIds}
        onConfirm={handleConfirmAddMedia}
      />
    </div>
  );
};

export default PressPreviewEditor;
