import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { appToast } from '@/components/toast/AppToast';
import type { UpdatePageSectionREQ } from '@/data/homepage-management/homepage.request';
import {
  buildNoticesPreviewUpdatePayload,
  extractMediaIds,
  extractMediaItems,
  transformMediaToDialogItems,
} from '@/data/homepage-management/homepage.service';
import type { DialogListDataItem } from '@/data/homepage-management/homepage.type';
import { useMediaInfiniteQuery } from '@/data/media/media.query';
import { SiteType } from '@/utils/enums/common.enum';
import { Loader2, Newspaper, Plus } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DialogListData from '../DialogListData';
import SectionItemLimitControl from '../SectionItemLimitControl';
import { MediaPreviewCard } from './PressPreviewEditor';

type Props = {
  rawContent: any;
  siteType?: SiteType;
  onSaveSection?: (payload?: Partial<UpdatePageSectionREQ>) => void;
  isSaving?: boolean;
};

export const NoticesPreviewEditor: React.FC<Props> = ({
  rawContent,
  siteType = SiteType.SHOPPING_MALL,
  onSaveSection,
  isSaving,
}) => {
  const { t: tContent } = useTranslation('content');
  const [isOpen, setIsOpen] = useState(false);

  const siteMedia = useMediaInfiniteQuery({ site_type: siteType, is_active: true });
  const fallbackToBrand = siteType !== SiteType.BRAND_SITE && siteMedia.isSuccess && siteMedia.data.media.length === 0;
  const brandMedia = useMediaInfiniteQuery({ site_type: SiteType.BRAND_SITE, is_active: true }, fallbackToBrand);
  const mediaQuery = fallbackToBrand ? brandMedia : siteMedia;

  const allMedia = useMemo(() => mediaQuery.data?.media || [], [mediaQuery.data]);

  const currentLimit = Number(rawContent?.limit) || 3;
  const currentMediaIds = useMemo(() => extractMediaIds(rawContent, 'notice_ids'), [rawContent]);

  const displayMedia = useMemo(() => {
    const items = extractMediaItems(rawContent);
    if (items.length > 0) return items.slice(0, currentLimit);
    return currentMediaIds
      .map((id) => allMedia.find((m: any) => Number(m.id) === id))
      .filter(Boolean)
      .slice(0, currentLimit);
  }, [rawContent, currentLimit, currentMediaIds, allMedia]);

  const dialogItems: DialogListDataItem[] = useMemo(() => transformMediaToDialogItems(allMedia), [allMedia]);

  const saveChanges = (ids: number[], limit: number) => {
    onSaveSection?.(buildNoticesPreviewUpdatePayload(ids, limit));
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

  const handleConfirmAddMedia = (selectedIds: number[]) => {
    saveChanges(Array.from(new Set([...currentMediaIds, ...selectedIds])), currentLimit);
  };

  const handleDelete = (mediaId: number) => {
    saveChanges(
      currentMediaIds.filter((id) => id !== mediaId),
      currentLimit,
    );
  };

  const handleLimitChange = (newLimit: number) => {
    saveChanges(currentMediaIds, newLimit);
  };

  return (
    <div className='space-y-5'>
      {/* Header bar */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Newspaper className='text-primary h-4 w-4' />
          <h4 className='text-sm font-semibold'>{tContent('homepage.notices_press_count', { count: displayMedia.length })}</h4>
          <Badge variant='outline' className='font-mono text-[10px]'>
            {tContent('homepage.flag_limit', { count: currentLimit })}
          </Badge>
        </div>
        <Button size='sm' onClick={handleOpenAddModal} disabled={isSaving} className='h-8 gap-1.5 text-xs font-semibold'>
          {isSaving ? <Loader2 className='h-3.5 w-3.5 animate-spin' /> : <Plus className='h-3.5 w-3.5' />}
          {tContent('homepage.link_media')}
        </Button>
      </div>

      {/* 3-Card Grid Matching User Page Layout */}
      {displayMedia.length > 0 ? (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {displayMedia.map((media, idx) => (
            <MediaPreviewCard key={media.id || idx} media={media} index={idx} isSaving={isSaving} onDelete={handleDelete} />
          ))}
        </div>
      ) : mediaQuery.isLoading ? (
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
          <Button size='sm' variant='outline' onClick={handleOpenAddModal} disabled={isSaving} className='h-7 gap-1 text-xs'>
            {isSaving ? <Loader2 className='h-3 w-3 animate-spin' /> : <Plus className='h-3 w-3' />}{' '}
            {tContent('homepage.link_media')}
          </Button>
        </div>
      )}

      {/* Item Limit Control */}
      <SectionItemLimitControl limit={currentLimit} onChange={handleLimitChange} disabled={isSaving} options={[3, 6, 9, 12]} />

      {/* Reusable Notice Picker Modal via DialogListData */}
      <DialogListData
        open={isOpen}
        onOpenChange={setIsOpen}
        icon={<Newspaper className='text-primary h-5 w-5' />}
        title={tContent('homepage.link_media')}
        description={tContent('homepage.link_media_dialog_desc')}
        items={dialogItems}
        isLoading={mediaQuery.isLoading}
        hasMore={mediaQuery.hasNextPage}
        isLoadingMore={mediaQuery.isFetchingNextPage}
        onLoadMore={mediaQuery.fetchNextPage}
        existingKeys={currentMediaIds}
        onConfirm={handleConfirmAddMedia}
      />
    </div>
  );
};

export default NoticesPreviewEditor;
