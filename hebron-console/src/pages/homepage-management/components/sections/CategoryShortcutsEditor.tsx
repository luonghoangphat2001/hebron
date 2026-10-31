import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Skeleton } from '@/components/ui/skeleton';
import { appToast } from '@/components/toast/AppToast';
import { useCategoryNodeInfiniteQuery } from '@/data/category/category.query';
import type { CategorynNode } from '@/data/category/category.response';
import type { UpdatePageSectionREQ } from '@/data/homepage-management/homepage.request';
import type { CategoryShortcutItemRESP } from '@/data/homepage-management/homepage.response';
import {
  buildCategoryShortcutsUpdatePayload,
  extractCategorySlugs,
  transformCategoriesToDialogItems,
} from '@/data/homepage-management/homepage.service';
import type { DialogListDataItem } from '@/data/homepage-management/homepage.type';
import { SiteType } from '@/utils/enums/common.enum';
import { FolderTree, Layers, Loader2, Plus, Trash2 } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DialogListData from '../DialogListData';
import SectionItemLimitControl from '../SectionItemLimitControl';

type Props = {
  rawContent: any;
  categoryShortcuts: CategoryShortcutItemRESP[];
  onSaveSection?: (payload?: Partial<UpdatePageSectionREQ>) => void;
  isSaving?: boolean;
};

type ShortcutCardProps = {
  slug: string;
  index: number;
  matchedCategory?: CategorynNode;
  fallbackShortcut?: CategoryShortcutItemRESP;
  isSaving?: boolean;
  onDelete: (slug: string) => void;
};

const CATEGORY_QUERY_PARAMS = {
  site_type: SiteType.SHOPPING_MALL,
};

const ShortcutCard: React.FC<ShortcutCardProps> = ({ slug, index, matchedCategory, fallbackShortcut, isSaving, onDelete }) => {
  const label = matchedCategory?.name || fallbackShortcut?.label || slug;
  const iconUrl = matchedCategory?.icon || fallbackShortcut?.icon || null;
  const bannerUrl = matchedCategory?.banner_image || matchedCategory?.image || null;

  const primaryIcon = iconUrl || bannerUrl;
  const hoverBanner = bannerUrl || iconUrl;

  return (
    <HoverCard openDelay={120} closeDelay={100}>
      <HoverCardTrigger asChild>
        <div className='group bg-card hover:border-primary/40 relative flex cursor-pointer flex-col items-center justify-center rounded-xl border p-3 text-center shadow-2xs transition-all duration-200 hover:shadow-xs'>
          {/* Default Icon View */}
          <div className='bg-muted/50 relative mb-2 flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg border p-2'>
            {primaryIcon ? (
              <img
                src={primaryIcon}
                alt={label}
                className='h-full w-full object-contain transition-transform duration-300 group-hover:scale-105'
              />
            ) : (
              <div className='text-muted-foreground flex h-full w-full items-center justify-center font-mono text-xs'>
                #{index + 1}
              </div>
            )}
          </div>

          <p className='text-foreground line-clamp-1 text-xs font-bold'>{label}</p>
          {slug && <span className='text-muted-foreground line-clamp-1 font-mono text-[9px]'>{slug}</span>}

          {/* Delete action */}
          <div className='absolute top-1.5 right-1.5 z-10 opacity-0 transition-opacity group-hover:opacity-100'>
            <Button
              size='icon'
              variant='destructive'
              disabled={isSaving}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(slug);
              }}
              className='h-6 w-6 rounded-full shadow-xs'>
              {isSaving ? <Loader2 className='h-3 w-3 animate-spin' /> : <Trash2 className='h-3 w-3' />}
            </Button>
          </div>
        </div>
      </HoverCardTrigger>

      {/* Small Responsive Hover Modal */}
      <HoverCardContent side='top' align='center' className='bg-popover w-72 space-y-2.5 rounded-xl border p-3 shadow-xl'>
        {hoverBanner && (
          <div className='bg-muted relative aspect-video w-full overflow-hidden rounded-lg border'>
            <img src={hoverBanner} alt={`${label} banner`} className='h-full w-full object-cover' />
            <span className='absolute right-1 bottom-1 rounded bg-black/75 px-1.5 py-0.5 font-mono text-[9px] font-medium text-white'>
              Banner
            </span>
          </div>
        )}

        <div className='flex items-center gap-2.5'>
          {primaryIcon && (
            <div className='bg-muted/60 h-8 w-8 shrink-0 overflow-hidden rounded-md border p-1'>
              <img src={primaryIcon} alt={label} className='h-full w-full object-contain' />
            </div>
          )}
          <div className='min-w-0 flex-1'>
            <p className='text-foreground truncate text-xs font-bold'>{label}</p>
            {slug && <p className='text-muted-foreground truncate font-mono text-[10px]'>{slug}</p>}
          </div>
        </div>

        <div className='border-border/60 text-muted-foreground flex items-center justify-between border-t pt-2 text-[10px]'>
          <span className='font-mono'>Index #{index + 1}</span>
          {fallbackShortcut?.link && <span className='max-w-[140px] truncate font-mono'>/{fallbackShortcut.link}</span>}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export const CategoryShortcutsEditor: React.FC<Props> = ({ rawContent, categoryShortcuts, onSaveSection, isSaving }) => {
  const { t: tContent } = useTranslation('content');
  const [isOpen, setIsOpen] = useState(false);

  const {
    data: categoryData,
    isLoading: isCategoriesLoading,
    isFetchingNextPage: isFetchingMoreCategories,
    hasNextPage: hasMoreCategories,
    fetchNextPage: fetchMoreCategories,
  } = useCategoryNodeInfiniteQuery(CATEGORY_QUERY_PARAMS as any);

  const flatCategories = useMemo(() => {
    return categoryData?.flatCategories || [];
  }, [categoryData]);

  const currentSlugs = useMemo(() => {
    return extractCategorySlugs(rawContent, categoryShortcuts);
  }, [rawContent, categoryShortcuts]);

  const currentLimit = Number(rawContent?.limit) || 10;

  const displaySlugs = useMemo(() => {
    return currentSlugs.slice(0, currentLimit);
  }, [currentSlugs, currentLimit]);

  const dialogItems: DialogListDataItem[] = useMemo(() => {
    return transformCategoriesToDialogItems(flatCategories);
  }, [flatCategories]);

  const handleOpenAddModal = () => {
    if (currentSlugs.length >= currentLimit) {
      appToast.warning(
        tContent('homepage.limit_reached', { limit: currentLimit }) ||
          `최대 ${currentLimit}개까지 등록할 수 있습니다. 항목 수를 늘려주세요.`,
      );
      return;
    }
    setIsOpen(true);
  };

  const handleConfirmAdd = (selectedSlugs: string[]) => {
    const newSlugs = Array.from(new Set([...currentSlugs, ...selectedSlugs]));
    onSaveSection?.(buildCategoryShortcutsUpdatePayload(newSlugs, currentLimit, categoryShortcuts));
  };

  const handleDelete = (slugToDelete: string) => {
    const newSlugs = currentSlugs.filter((s) => s !== slugToDelete);
    onSaveSection?.(buildCategoryShortcutsUpdatePayload(newSlugs, currentLimit, categoryShortcuts));
  };

  const handleLimitChange = (newLimit: number) => {
    onSaveSection?.(buildCategoryShortcutsUpdatePayload(currentSlugs, newLimit, categoryShortcuts));
  };

  return (
    <div className='space-y-4'>
      {/* Header Info & Actions */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Layers className='text-primary h-4 w-4' />
          <h4 className='text-sm font-semibold'>
            {tContent('homepage.category_shortcuts_count', { count: displaySlugs.length })}
          </h4>
          <Badge variant='outline' className='font-mono text-[10px]'>
            {tContent('homepage.flag_limit', { count: currentLimit })}
          </Badge>
        </div>
        <Button size='sm' onClick={handleOpenAddModal} disabled={isSaving} className='h-8 gap-1.5 text-xs font-semibold'>
          {isSaving ? <Loader2 className='h-3.5 w-3.5 animate-spin' /> : <Plus className='h-3.5 w-3.5' />}
          {tContent('homepage.add_category_shortcut')}
        </Button>
      </div>

      {isCategoriesLoading ? (
        <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'>
          {Array.from({ length: currentLimit || 10 }).map((_, i) => (
            <div key={i} className='space-y-2 rounded-xl border p-3'>
              <Skeleton className='aspect-square w-full rounded-lg' />
              <Skeleton className='mx-auto h-3.5 w-3/4' />
              <Skeleton className='mx-auto h-2.5 w-1/2' />
            </div>
          ))}
        </div>
      ) : displaySlugs.length > 0 ? (
        <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'>
          {displaySlugs.map((slug, idx) => {
            const matchedCategory = flatCategories.find((c) => c.slug === slug || c.name === slug);
            const fallbackShortcut =
              categoryShortcuts.find((cs) => cs.slug === slug || cs.label === slug || cs.link === slug) || categoryShortcuts[idx];

            return (
              <ShortcutCard
                key={slug || idx}
                slug={slug}
                index={idx}
                matchedCategory={matchedCategory}
                fallbackShortcut={fallbackShortcut}
                isSaving={isSaving}
                onDelete={handleDelete}
              />
            );
          })}
        </div>
      ) : (
        <div className='bg-muted/10 space-y-2.5 rounded-xl border border-dashed p-8 text-center'>
          <Layers className='text-muted-foreground mx-auto h-8 w-8' />
          <p className='text-muted-foreground text-xs'>{tContent('homepage.no_category_shortcuts')}</p>
          <Button size='sm' variant='outline' onClick={handleOpenAddModal} disabled={isSaving} className='h-7 gap-1 text-xs'>
            {isSaving ? <Loader2 className='h-3 w-3 animate-spin' /> : <Plus className='h-3 w-3' />}{' '}
            {tContent('homepage.add_category_shortcut')}
          </Button>
        </div>
      )}

      {/* Item Limit Control */}
      <SectionItemLimitControl
        limit={currentLimit}
        onChange={handleLimitChange}
        disabled={isSaving}
        options={[5, 8, 10, 12, 15, 20]}
      />

      {/* Reusable DialogListData */}
      <DialogListData
        open={isOpen}
        onOpenChange={setIsOpen}
        icon={<FolderTree className='text-primary h-5 w-5' />}
        title={tContent('homepage.add_category_shortcut')}
        description={tContent('homepage.add_shortcuts_dialog_desc')}
        items={dialogItems}
        isLoading={isCategoriesLoading}
        hasMore={hasMoreCategories}
        isLoadingMore={isFetchingMoreCategories}
        onLoadMore={fetchMoreCategories}
        existingKeys={currentSlugs}
        onConfirm={handleConfirmAdd}
      />
    </div>
  );
};

export default CategoryShortcutsEditor;
