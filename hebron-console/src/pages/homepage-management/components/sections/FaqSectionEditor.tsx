import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { appToast } from '@/components/toast/AppToast';
import { useFAQInfiniteQuery } from '@/data/faq/faq.query';
import type { UpdatePageSectionREQ } from '@/data/homepage-management/homepage.request';
import type { FaqItemRESP } from '@/data/homepage-management/homepage.response';
import {
  buildFaqSectionUpdatePayload,
  extractFaqIds,
  extractFaqItems,
  getCleanFaqAnswer,
  transformFaqsToDialogItems,
} from '@/data/homepage-management/homepage.service';
import type { DialogListDataItem } from '@/data/homepage-management/homepage.type';
import { PostingStatus, SiteType } from '@/utils/enums/common.enum';
import { Eye, HelpCircle, Loader2, Plus, Trash2 } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DialogListData from '../DialogListData';
import SectionItemLimitControl from '../SectionItemLimitControl';
import { useSectionActionLoading } from '../../hooks/useSectionActionLoading';

type Props = {
  rawContent: any;
  faqs?: FaqItemRESP[];
  siteType?: SiteType;
  onSaveSection?: (payload?: Partial<UpdatePageSectionREQ>) => Promise<any> | void;
};

type FaqPreviewCardProps = {
  faq: FaqItemRESP;
  index: number;
  isLoading?: boolean;
  isLoadingTarget: (target: number | 'add' | 'limit') => boolean;
  onDelete: (id: number) => void;
};

const FaqPreviewCard: React.FC<FaqPreviewCardProps> = ({ faq, index, isLoading, isLoadingTarget, onDelete }) => {
  const faqId = Number(faq.id);
  const faqCategory = faq.category || 'FAQ';
  const faqQuestion = faq.question || `FAQ #${faqId || index + 1}`;
  const cleanAnswer = getCleanFaqAnswer(faq.answer || '');
  const viewCount = faq.view_count;

  return (
    <div className='group bg-card hover:border-primary/40 relative space-y-2 rounded-xl border p-4 shadow-2xs transition-colors'>
      <div className='flex items-start justify-between gap-3'>
        <div className='min-w-0 flex-1 space-y-1'>
          <div className='flex items-center gap-2'>
            <Badge variant='outline' className='bg-primary/5 text-primary text-[10px] font-semibold'>
              {faqCategory}
            </Badge>
            <span className='text-foreground truncate text-xs font-bold'>{faqQuestion}</span>
          </div>
          <p className='text-muted-foreground line-clamp-2 text-xs leading-relaxed'>{cleanAnswer}</p>
        </div>
        <div
          className={`flex items-center gap-1 transition-opacity ${
            isLoadingTarget(faqId) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}>
          <Button
            size='icon'
            variant='ghost'
            disabled={isLoading}
            onClick={() => onDelete(faqId)}
            className='text-muted-foreground hover:text-destructive h-7 w-7'>
            {isLoadingTarget(faqId) ? <Loader2 className='h-3.5 w-3.5 animate-spin' /> : <Trash2 className='h-3.5 w-3.5' />}
          </Button>
        </div>
      </div>
      {viewCount !== undefined && viewCount !== null && (
        <div className='flex items-center gap-1 font-mono text-[10px] text-slate-400'>
          <Eye className='h-3 w-3' /> {viewCount}
        </div>
      )}
    </div>
  );
};

export const FaqSectionEditor: React.FC<Props> = ({ rawContent, siteType = SiteType.SHOPPING_MALL, onSaveSection }) => {
  const { t: tContent } = useTranslation('content');

  const [isOpen, setIsOpen] = useState(false);
  const { isLoading, isLoadingTarget, runWithLoading } = useSectionActionLoading<number | 'add' | 'limit'>();

  const faqQueryParams = useMemo(
    () => ({
      site_type: siteType,
      posting_status: PostingStatus.EXPOSED,
    }),
    [siteType],
  );

  const {
    data: faqInfiniteData,
    isLoading: isFaqsLoading,
    isFetchingNextPage: isFetchingMoreFaqs,
    hasNextPage: hasMoreFaqs,
    fetchNextPage: fetchMoreFaqs,
  } = useFAQInfiniteQuery(faqQueryParams);

  const allFaqs = useMemo(() => {
    return faqInfiniteData?.faqs || [];
  }, [faqInfiniteData]);

  const currentLimit = Number(rawContent?.limit) || 5;

  const displayFaqs = useMemo(() => {
    return extractFaqItems(rawContent).slice(0, currentLimit);
  }, [rawContent, currentLimit]);

  const currentFaqIds = useMemo(() => {
    return extractFaqIds(rawContent);
  }, [rawContent]);

  const dialogItems: DialogListDataItem[] = useMemo(() => {
    return transformFaqsToDialogItems(allFaqs);
  }, [allFaqs]);

  const handleOpenAddModal = () => {
    if (currentFaqIds.length >= currentLimit) {
      appToast.warning(
        tContent('homepage.limit_reached', { limit: currentLimit }) ||
          `최대 ${currentLimit}개까지 등록할 수 있습니다. 항목 수를 늘려주세요.`,
      );
      return;
    }
    setIsOpen(true);
  };

  const handleConfirmAddFaqs = (selectedIds: number[]) =>
    runWithLoading('add', () => {
      const newIds = Array.from(new Set([...currentFaqIds, ...selectedIds]));
      return onSaveSection?.(buildFaqSectionUpdatePayload(newIds, currentLimit));
    });

  const handleDelete = (faqId: number) =>
    runWithLoading(faqId, () => {
      const newIds = currentFaqIds.filter((id) => id !== faqId);
      return onSaveSection?.(buildFaqSectionUpdatePayload(newIds, currentLimit));
    });

  const handleLimitChange = (newLimit: number) =>
    runWithLoading('limit', () => onSaveSection?.(buildFaqSectionUpdatePayload(currentFaqIds, newLimit)));

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <HelpCircle className='text-primary h-4 w-4' />
          <h4 className='text-sm font-semibold'>{tContent('homepage.faqs_count', { count: displayFaqs.length })}</h4>
          <Badge variant='outline' className='font-mono text-[10px]'>
            {tContent('homepage.flag_limit', { count: currentLimit })}
          </Badge>
        </div>
        <Button size='sm' onClick={handleOpenAddModal} disabled={isLoading} className='h-8 gap-1.5 text-xs font-semibold'>
          {isLoadingTarget('add') ? <Loader2 className='h-3.5 w-3.5 animate-spin' /> : <Plus className='h-3.5 w-3.5' />}
          {tContent('homepage.add_faq_item')}
        </Button>
      </div>

      {displayFaqs.length > 0 ? (
        <div className='space-y-3'>
          {displayFaqs.map((faq, idx) => (
            <FaqPreviewCard
              key={faq.id || idx}
              faq={faq}
              index={idx}
              isLoading={isLoading}
              isLoadingTarget={isLoadingTarget}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : isFaqsLoading ? (
        <div className='space-y-3'>
          {Array.from({ length: currentLimit || 5 }).map((_, idx) => (
            <div key={idx} className='space-y-2 rounded-xl border p-4'>
              <div className='flex items-center gap-2'>
                <Skeleton className='h-4 w-12 rounded-md' />
                <Skeleton className='h-4 w-1/2' />
              </div>
              <Skeleton className='h-3.5 w-full' />
              <Skeleton className='h-3.5 w-3/4' />
            </div>
          ))}
        </div>
      ) : (
        <div className='bg-muted/10 space-y-3 rounded-xl border border-dashed p-8 text-center'>
          <HelpCircle className='text-muted-foreground mx-auto h-8 w-8' />
          <p className='text-muted-foreground text-xs'>{tContent('homepage.no_faqs')}</p>
          <Button
            size='sm'
            variant='outline'
            onClick={handleOpenAddModal}
            disabled={isLoading}
            className='h-8 gap-1.5 text-xs font-semibold'>
            {isLoadingTarget('add') ? <Loader2 className='h-3.5 w-3.5 animate-spin' /> : <Plus className='h-3.5 w-3.5' />}{' '}
            {tContent('homepage.add_faq_item')}
          </Button>
        </div>
      )}

      {/* Item Limit Control */}
      <SectionItemLimitControl
        limit={currentLimit}
        onChange={handleLimitChange}
        disabled={isLoading}
        options={[3, 5, 8, 10, 15]}
      />

      {/* Reusable FAQ Picker Modal via DialogListData */}
      <DialogListData
        open={isOpen}
        onOpenChange={setIsOpen}
        icon={<HelpCircle className='text-primary h-5 w-5' />}
        title={tContent('homepage.add_faq_item')}
        description={tContent('homepage.add_faq_dialog_desc')}
        items={dialogItems}
        isLoading={isFaqsLoading}
        hasMore={hasMoreFaqs}
        isLoadingMore={isFetchingMoreFaqs}
        onLoadMore={fetchMoreFaqs}
        existingKeys={currentFaqIds}
        onConfirm={handleConfirmAddFaqs}
      />
    </div>
  );
};

export default FaqSectionEditor;
