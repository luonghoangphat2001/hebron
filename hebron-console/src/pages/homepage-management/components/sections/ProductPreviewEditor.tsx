import { appToast } from '@/components/toast/AppToast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCategoryNodeInfiniteQuery } from '@/data/category/category.query';
import type { UpdatePageSectionREQ } from '@/data/homepage-management/homepage.request';
import type { ShowcaseCategoryRESP } from '@/data/homepage-management/homepage.response';
import {
  buildProductPreviewUpdatePayload,
  extractCategorySlugs,
  transformCategoriesToDialogItems,
  transformShowcaseProductToCardItem,
} from '@/data/homepage-management/homepage.service';
import type { DialogListDataItem, ProductItemData } from '@/data/homepage-management/homepage.type';
import { SiteType } from '@/utils/enums/common.enum';
import { SectionType } from '@/utils/enums/homepage.enum';
import { CheckCircle2, FolderTree, Layers, Loader2, Package, Plus, Trash2 } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSectionActionLoading } from '../../hooks/useSectionActionLoading';
import DialogListData from '../DialogListData';
import MallProductCard from '../MallProductCard';
import SectionItemLimitControl from '../SectionItemLimitControl';

type Props = {
  sectionType?: SectionType | string;
  rawContent: any;
  previewCategories?: ShowcaseCategoryRESP[];
  onSaveSection?: (payload?: Partial<UpdatePageSectionREQ>) => Promise<any> | void;
};

const CATEGORY_QUERY_PARAMS = {
  site_type: SiteType.SHOPPING_MALL,
};

export const ProductPreviewEditor: React.FC<Props> = ({
  sectionType = SectionType.PRODUCT_PREVIEW,
  rawContent,
  previewCategories = [],
  onSaveSection,
}) => {
  const { t: tContent } = useTranslation('content');

  const [isAddCatOpen, setIsAddCatOpen] = useState(false);
  const { isLoading, isLoadingTarget, runWithLoading } = useSectionActionLoading();

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
    return extractCategorySlugs(rawContent, previewCategories);
  }, [rawContent, previewCategories]);

  const defaultLimit = sectionType === SectionType.STEADY_SELLER ? 6 : 12;
  const currentLimit = Number(rawContent?.limit) || defaultLimit;

  // Category tabs sliced up to currentLimit
  const displaySlugs = useMemo(() => {
    return currentSlugs.slice(0, currentLimit);
  }, [currentSlugs, currentLimit]);

  const [selectedSlugOverride, setSelectedSlugOverride] = useState<string | null>(null);

  const selectedSlug = useMemo(() => {
    if (selectedSlugOverride && currentSlugs.includes(selectedSlugOverride)) {
      return selectedSlugOverride;
    }
    return rawContent?.category_slug || currentSlugs[0] || '';
  }, [selectedSlugOverride, currentSlugs, rawContent?.category_slug]);

  const activeCategory = useMemo(() => {
    return previewCategories.find((c) => (c.category_slug || c.category_name) === selectedSlug) || previewCategories[0];
  }, [previewCategories, selectedSlug]);

  // Product cards display all products under active category
  const currentProducts: ProductItemData[] = useMemo(() => {
    if (activeCategory?.products && activeCategory.products.length > 0) {
      return activeCategory.products.map(transformShowcaseProductToCardItem);
    }
    return [];
  }, [activeCategory]);

  const dialogItems: DialogListDataItem[] = useMemo(() => {
    return transformCategoriesToDialogItems(flatCategories);
  }, [flatCategories]);

  const handleOpenAddCatModal = () => {
    if (currentSlugs.length >= currentLimit) {
      appToast.warning(
        tContent('homepage.limit_reached', { limit: currentLimit }) ||
          `최대 ${currentLimit}개 카테고리까지 등록할 수 있습니다. 먼저 노출 개수를 늘려주세요.`,
      );
      return;
    }
    setIsAddCatOpen(true);
  };

  const handleLimitChange = (newLimit: number) =>
    runWithLoading('limit', () => onSaveSection?.(buildProductPreviewUpdatePayload(currentSlugs, newLimit, true, sectionType)));

  const handleConfirmAddCategories = (selectedSlugs: string[]) =>
    runWithLoading('add', () => {
      const newSlugs = Array.from(new Set([...currentSlugs, ...selectedSlugs]));
      return onSaveSection?.(buildProductPreviewUpdatePayload(newSlugs, currentLimit, true, sectionType));
    });

  const handleDeleteCategory = (slugToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    return runWithLoading(slugToDelete, () => {
      const newSlugs = currentSlugs.filter((s) => s !== slugToDelete);
      return onSaveSection?.(buildProductPreviewUpdatePayload(newSlugs, currentLimit, true, sectionType));
    });
  };

  return (
    <div className='space-y-6'>
      {/* Category Tabs Panel */}
      <div className='space-y-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Layers className='text-primary h-4 w-4' />
            <h4 className='text-sm font-semibold'>{tContent('homepage.category_tabs_count', { count: displaySlugs.length })}</h4>
            <Badge variant='outline' className='font-mono text-[10px]'>
              {tContent('homepage.flag_limit', { count: currentLimit })}
            </Badge>
          </div>
          <div className='flex items-center gap-2'>
            <Button size='sm' onClick={handleOpenAddCatModal} disabled={isLoading} className='h-7 gap-1 text-xs font-semibold'>
              {isLoadingTarget('add') ? <Loader2 className='h-3 w-3 animate-spin' /> : <Plus className='h-3 w-3' />}
              {tContent('homepage.add_category')}
            </Button>
          </div>
        </div>

        {isCategoriesLoading ? (
          <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5'>
            {Array.from({ length: currentLimit || 12 }).map((_, i) => (
              <div key={i} className='space-y-2 rounded-xl border p-3'>
                <Skeleton className='mx-auto h-3.5 w-3/4' />
                <Skeleton className='mx-auto h-2.5 w-1/2' />
              </div>
            ))}
          </div>
        ) : displaySlugs.length > 0 ? (
          <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5'>
            {displaySlugs.map((slug, idx) => {
              const matchedCat = flatCategories.find((c) => c.slug === slug || c.name === slug);
              const fallbackCat =
                previewCategories.find((c) => c.category_slug === slug || c.category_name === slug) || previewCategories[idx];
              const isSelected = slug === (selectedSlug || currentSlugs[0]);
              const label = fallbackCat?.category_name || matchedCat?.name || slug;
              const productCount = fallbackCat?.products?.length ?? 0;

              return (
                <div
                  key={slug || idx}
                  onClick={() => setSelectedSlugOverride(slug)}
                  className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border p-3 text-center transition-all duration-200 ${
                    isSelected
                      ? 'border-primary bg-primary/5 ring-primary/30 shadow-sm ring-2'
                      : 'border-border bg-card hover:border-primary/50 hover:bg-accent/30'
                  }`}>
                  {isSelected && (
                    <div className='bg-primary text-primary-foreground absolute top-1.5 right-1.5 z-10 flex h-4 w-4 items-center justify-center rounded-full shadow-xs'>
                      <CheckCircle2 className='h-3 w-3' />
                    </div>
                  )}

                  <p
                    className={`line-clamp-1 text-xs font-bold transition-colors ${
                      isSelected ? 'text-primary' : 'text-foreground'
                    }`}>
                    {label}
                  </p>
                  {slug && <span className='text-muted-foreground line-clamp-1 font-mono text-[9px]'>{slug}</span>}

                  <Badge variant='secondary' className='mt-1.5 h-4 px-1.5 font-mono text-[9px]'>
                    {tContent('homepage.items_count', { count: productCount })}
                  </Badge>

                  <div
                    className={`absolute top-1.5 left-1.5 transition-opacity ${
                      isLoadingTarget(slug) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}>
                    <Button
                      size='icon'
                      variant='ghost'
                      disabled={isLoading}
                      onClick={(e) => handleDeleteCategory(slug, e)}
                      className='text-muted-foreground hover:text-destructive h-6 w-6'>
                      {isLoadingTarget(slug) ? <Loader2 className='h-3 w-3 animate-spin' /> : <Trash2 className='h-3 w-3' />}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className='text-muted-foreground rounded-xl border border-dashed p-6 text-center text-xs'>
            <p className='mb-2'>{tContent('homepage.no_categories_available')}</p>
            <Button
              size='sm'
              variant='outline'
              onClick={handleOpenAddCatModal}
              disabled={isLoading}
              className='h-7 gap-1 text-xs'>
              {isLoadingTarget('add') ? <Loader2 className='h-3 w-3 animate-spin' /> : <Plus className='h-3 w-3' />}{' '}
              {tContent('homepage.add_category')}
            </Button>
          </div>
        )}

        {/* Display Item Limit Toolbar */}
        <SectionItemLimitControl
          limit={currentLimit}
          onChange={handleLimitChange}
          disabled={isLoading}
          options={sectionType === SectionType.STEADY_SELLER ? [4, 6, 8, 12, 16] : [6, 12, 18, 24, 30]}
        />
      </div>

      {/* Products in Active Category Panel */}
      <div className='bg-card space-y-4 rounded-xl border p-4 shadow-2xs'>
        <div className='flex flex-wrap items-center justify-between gap-3 border-b pb-3.5'>
          <div className='space-y-0.5'>
            <div className='flex items-center gap-2'>
              <Package className='text-primary h-4 w-4' />
              <h4 className='text-foreground text-sm font-bold'>
                {activeCategory?.category_name ||
                  activeCategory?.category_slug ||
                  selectedSlug ||
                  tContent('homepage.selected_category')}
              </h4>
              <Badge variant='outline' className='font-mono text-[10px]'>
                {selectedSlug}
              </Badge>
            </div>
            {activeCategory?.subtitle ? (
              <p className='text-muted-foreground text-xs italic'>{activeCategory.subtitle}</p>
            ) : (
              <p className='text-muted-foreground text-xs'>
                {tContent('homepage.curated_preview_products', { count: currentProducts.length })}
              </p>
            )}
          </div>
        </div>

        {isCategoriesLoading ? (
          <div className='grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3'>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className='space-y-2 rounded-xl border p-3.5'>
                <Skeleton className='aspect-[4/3] w-full rounded-lg' />
                <Skeleton className='h-4 w-3/4' />
                <Skeleton className='h-3.5 w-1/2' />
              </div>
            ))}
          </div>
        ) : currentProducts.length > 0 ? (
          <div className='grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3'>
            {currentProducts.map((prod) => (
              <div key={prod.id}>
                <MallProductCard product={prod} variant='default' className='bg-card border-border h-full shadow-2xs' />
              </div>
            ))}
          </div>
        ) : (
          <div className='bg-muted/10 space-y-2.5 rounded-xl border border-dashed p-8 text-center'>
            <Package className='text-muted-foreground mx-auto h-8 w-8' />
            <p className='text-foreground text-xs font-semibold'>{tContent('homepage.no_preview_products')}</p>
            <p className='text-muted-foreground text-[11px]'>
              {tContent('homepage.add_products_to_category_desc', {
                name: activeCategory?.category_name || activeCategory?.category_slug || selectedSlug,
              })}
            </p>
          </div>
        )}
      </div>

      {/* Reusable Category Picker Modal via DialogListData */}
      <DialogListData
        open={isAddCatOpen}
        onOpenChange={setIsAddCatOpen}
        icon={<FolderTree className='text-primary h-5 w-5' />}
        title={tContent('homepage.add_category')}
        description={tContent('homepage.add_showcase_cat_dialog_desc')}
        items={dialogItems}
        isLoading={isCategoriesLoading}
        hasMore={hasMoreCategories}
        isLoadingMore={isFetchingMoreCategories}
        onLoadMore={fetchMoreCategories}
        existingKeys={currentSlugs}
        onConfirm={handleConfirmAddCategories}
      />
    </div>
  );
};

export default ProductPreviewEditor;
