import { appToast } from '@/components/toast/AppToast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import AppUpload from '@/components/upload/AppUpload';
import { useCategoryNodeInfiniteQuery } from '@/data/category/category.query';
import type { CategorynNode } from '@/data/category/category.response';
import { uploadFileAPI } from '@/data/file/file.api';
import type { UpdatePageSectionREQ } from '@/data/homepage-management/homepage.request';
import type { ShowcaseCategoryRESP, ShowcaseCategorySlugRESP } from '@/data/homepage-management/homepage.response';
import {
  buildCategoryShowcaseUpdatePayload,
  extractCategorySlugs,
  transformCategoriesToDialogItems,
  transformShowcaseProductToCardItem,
} from '@/data/homepage-management/homepage.service';
import type { DialogListDataItem, MallSection, ProductItemData } from '@/data/homepage-management/homepage.type';
import { SiteType } from '@/utils/enums/common.enum';
import { FileType } from '@/utils/enums/file.enum';
import { CheckCircle2, FolderTree, Image as ImageIcon, Layers, Loader2, Plus, Sparkles, Trash2, Upload } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DialogListData from '../DialogListData';
import MallProductCard from '../MallProductCard';
import SectionItemLimitControl from '../SectionItemLimitControl';
import SectionCardActions from '../ui/SectionCardActions';
import CategoryTabImageDialog from './CategoryTabImageDialog';

import { useSectionActionLoading } from '../../hooks/useSectionActionLoading';

type Props = {
  section: MallSection;
  rawContent: any;
  showcaseCategories?: ShowcaseCategoryRESP[];
  showcaseProducts: ProductItemData[];
  onUpdateSection?: (updated: Partial<MallSection>) => void;
  onSaveSection?: (payload?: Partial<UpdatePageSectionREQ>) => Promise<any> | void;
};

const CATEGORY_QUERY_PARAMS = {
  site_type: SiteType.SHOPPING_MALL,
};

const TabImage = ({ urls, alt, placeholder }: { urls: string[]; alt: string; placeholder: string }) => {
  const [failedCount, setFailedCount] = useState(0);
  const src = urls[failedCount];

  if (!src) {
    return (
      <div className='text-muted-foreground flex h-full w-full items-center justify-center font-mono text-xs'>{placeholder}</div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailedCount((n) => n + 1)}
      className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
    />
  );
};

export const CategoryShowcaseEditor: React.FC<Props> = ({
  section,
  rawContent,
  showcaseCategories = [],
  showcaseProducts,
  onUpdateSection,
  onSaveSection,
}) => {
  const { t: tContent } = useTranslation('content');
  const { t: tCommon } = useTranslation('common');

  const initialBgImage = section.rawSection?.image || (section as any).image || null;
  const [bgImage, setBgImage] = useState<string | null>(initialBgImage);
  const [isEditingBg, setIsEditingBg] = useState(false);
  const [bgUrlInput, setBgUrlInput] = useState('');
  const [isUploadingBg, setIsUploadingBg] = useState(false);

  // Category Picker State (from DialogListData)
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
    return extractCategorySlugs(rawContent, showcaseCategories);
  }, [rawContent, showcaseCategories]);

  const currentLimit = Number(rawContent?.limit) || 12;

  const currentEntries: ShowcaseCategorySlugRESP[] = useMemo(() => {
    const raw: ShowcaseCategorySlugRESP[] = Array.isArray(rawContent?.category_slugs) ? rawContent.category_slugs : [];
    return currentSlugs.map((slug) => ({ slug, image_url: raw.find((s) => s?.slug === slug)?.image_url ?? null }));
  }, [currentSlugs, rawContent]);

  // Category tabs sliced up to currentLimit
  const displayEntries = useMemo(() => {
    return currentEntries.slice(0, currentLimit);
  }, [currentEntries, currentLimit]);

  const [imageTarget, setImageTarget] = useState<{ slug: string; label: string; isNew: boolean } | null>(null);
  const [imageValue, setImageValue] = useState<string | File>('');
  const hasImage = typeof imageValue === 'string' ? !!imageValue.trim() : !!imageValue;

  const openImageDialog = (target: NonNullable<typeof imageTarget>, imageUrl?: string | null) => {
    setImageTarget(target);
    setImageValue(imageUrl ?? '');
  };

  const saveEntries = (entries: ShowcaseCategorySlugRESP[], image = bgImage, limit = currentLimit) =>
    onSaveSection?.(
      buildCategoryShowcaseUpdatePayload(
        entries,
        section.rawSection?.title || 'Featured Products',
        section.rawSection?.subtitle || 'Our featured product categories',
        image,
        limit,
      ),
    );

  const dialogItems: DialogListDataItem[] = useMemo(() => {
    return transformCategoriesToDialogItems(flatCategories);
  }, [flatCategories]);

  const uploadFile = async (file: File, type: FileType): Promise<string | null> => {
    try {
      const resp = await uploadFileAPI(file, type);
      const url = resp?.data?.file?.url;
      appToast.success(tCommon('notify.success_upload') || 'Uploaded successfully');
      return url;
    } catch (err: any) {
      appToast.error(err?.response?.data?.message || tCommon('notify.fail_upload'));
      return null;
    }
  };

  const handleUpdateBg = async (newUrl: string | null, actionType: string = 'update_bg') => {
    return runWithLoading(actionType, async () => {
      setBgImage(newUrl);
      setIsEditingBg(false);
      if (onSaveSection) {
        await saveEntries(currentEntries, newUrl);
      } else if (onUpdateSection && section.rawSection) {
        onUpdateSection({
          rawSection: {
            ...section.rawSection,
            image: newUrl,
          },
        });
      }
    });
  };

  const handleBgUpload = async (val?: string | File | (string | File)[]) => {
    if (!val) return;
    if (typeof val === 'string') {
      await handleUpdateBg(val);
    } else if (val instanceof File) {
      setIsUploadingBg(true);
      const url = await uploadFile(val, FileType.BANNERS);
      setIsUploadingBg(false);
      if (url) {
        await handleUpdateBg(url);
      }
    }
  };

  const initialSlug = rawContent.category_slug || currentSlugs[0] || '';
  const [selectedSlug, setSelectedSlug] = useState<string>(initialSlug);

  const activeCategory = useMemo(() => {
    return showcaseCategories.find((c) => (c.category_slug || c.category_name) === selectedSlug) || showcaseCategories[0];
  }, [showcaseCategories, selectedSlug]);

  // Product cards display all products under active category
  const currentProducts: ProductItemData[] = useMemo(() => {
    if (activeCategory?.products && activeCategory.products.length > 0) {
      return activeCategory.products.map(transformShowcaseProductToCardItem);
    }
    return showcaseProducts;
  }, [activeCategory, showcaseProducts]);

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

  const handleConfirmAddCategories = (selectedSlugs: string[], selectedItems: CategorynNode[]) =>
    openImageDialog({ slug: selectedSlugs[0], label: selectedItems[0]?.name || selectedSlugs[0], isNew: true });

  const handleSaveImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageTarget || !hasImage) return;

    return runWithLoading('save_image', async () => {
      const image_url = typeof imageValue === 'string' ? imageValue.trim() : await uploadFile(imageValue, FileType.PAGE_IMAGES);
      if (!image_url) return;

      const entry = { slug: imageTarget.slug, image_url };
      await saveEntries(
        imageTarget.isNew ? [...currentEntries, entry] : currentEntries.map((s) => (s.slug === entry.slug ? entry : s)),
      );
      setImageTarget(null);
    });
  };

  const handleDeleteCategory = (slugToDelete: string) =>
    runWithLoading(slugToDelete, () => saveEntries(currentEntries.filter((s) => s.slug !== slugToDelete)));

  const handleLimitChange = (newLimit: number) => runWithLoading('limit', () => saveEntries(currentEntries, bgImage, newLimit));

  return (
    <div className='space-y-6'>
      {/* Background Image Panel */}
      <div className='bg-card space-y-3.5 rounded-xl border p-4 shadow-2xs'>
        <div className='flex flex-wrap items-center justify-between gap-3 border-b pb-3'>
          <div className='space-y-0.5'>
            <div className='flex items-center gap-2'>
              <ImageIcon className='text-primary h-4 w-4' />
              <h5 className='text-foreground text-xs font-bold'>{tContent('homepage.showcase_bg_image_title')}</h5>
              <Badge variant='outline' className='font-mono text-[9px]'>
                field: image
              </Badge>
            </div>
            <p className='text-muted-foreground text-[11px]'>{tContent('homepage.showcase_bg_image_desc')}</p>
          </div>

          <div className='flex items-center gap-2'>
            {bgImage && !isEditingBg && (
              <Button size='sm' variant='outline' onClick={() => setIsEditingBg(true)} className='h-7 gap-1 text-xs'>
                <Upload className='h-3 w-3' /> {tContent('homepage.change_background')}
              </Button>
            )}
            {bgImage && (
              <Button
                size='sm'
                variant='ghost'
                disabled={isLoading || isUploadingBg}
                onClick={() => handleUpdateBg(null, 'delete_bg')}
                className='text-destructive hover:bg-destructive/10 h-7 gap-1 text-xs'>
                {isLoadingTarget('delete_bg') ? <Loader2 className='h-3 w-3 animate-spin' /> : <Trash2 className='h-3 w-3' />}{' '}
                {tCommon('button.delete')}
              </Button>
            )}
          </div>
        </div>

        {bgImage && !isEditingBg ? (
          <div className='relative h-32 w-full overflow-hidden rounded-xl border bg-slate-950 shadow-inner'>
            <img src={bgImage} alt='Showcase Background' className='h-full w-full object-cover' />
            <div className='absolute inset-0 flex flex-col justify-between bg-black/50 p-4 text-white backdrop-blur-[0.5px]'>
              <div className='flex items-center justify-between'>
                <Badge className='bg-black/60 font-mono text-[10px] text-white backdrop-blur-xs'>
                  {tContent('homepage.active_bg_cover')}
                </Badge>
                <span className='max-w-[280px] truncate font-mono text-[10px] text-slate-300'>{bgImage}</span>
              </div>
              <p className='text-xs font-semibold text-slate-200'>
                {activeCategory?.category_name || activeCategory?.category_slug} {tContent('homepage.banner_preview_suffix')}
              </p>
            </div>
          </div>
        ) : (
          <div className='space-y-3 rounded-xl border border-dashed p-4'>
            <div className='flex flex-wrap items-center gap-2'>
              <Input
                placeholder={tContent('homepage.ph_enter_image_url')}
                value={bgUrlInput}
                onChange={(e) => setBgUrlInput(e.target.value)}
                className='h-8 flex-1 text-xs'
              />
              <Button
                size='sm'
                disabled={!bgUrlInput.trim() || isLoading || isUploadingBg}
                onClick={() => {
                  if (bgUrlInput.trim()) {
                    handleUpdateBg(bgUrlInput.trim(), 'update_bg');
                    setBgUrlInput('');
                  }
                }}
                className='h-8 text-xs font-semibold'>
                {isLoadingTarget('update_bg') || isUploadingBg ? <Loader2 className='mr-1 h-3 w-3 animate-spin' /> : null}
                {tContent('homepage.set_image_url')}
              </Button>
              {isEditingBg && (
                <Button size='sm' variant='ghost' onClick={() => setIsEditingBg(false)} className='h-8 text-xs'>
                  {tCommon('button.cancel')}
                </Button>
              )}
            </div>

            <div className='space-y-1.5 pt-1'>
              <span className='text-muted-foreground text-[11px] font-semibold'>{tContent('homepage.or_upload_file')}</span>
              <div className='max-w-xs'>
                <AppUpload
                  type='image'
                  disabled={isUploadingBg || isLoading}
                  onChange={handleBgUpload}
                  previewHeight='h-20 w-full'
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Category Tabs Panel */}
      <div className='space-y-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Layers className='text-primary h-4 w-4' />
            <h4 className='text-sm font-semibold'>
              {tContent('homepage.category_tabs_count', { count: displayEntries.length })}
            </h4>
            <Badge variant='outline' className='font-mono text-[10px]'>
              {tContent('homepage.flag_limit', { count: currentLimit })}
            </Badge>
          </div>
          <div className='flex items-center gap-2'>
            <Button size='sm' onClick={handleOpenAddCatModal} disabled={isLoading} className='h-7 gap-1 text-xs font-semibold'>
              <Plus className='h-3 w-3' />
              {tContent('homepage.add_category')}
            </Button>
          </div>
        </div>

        {isCategoriesLoading ? (
          <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5'>
            {Array.from({ length: currentLimit || 10 }).map((_, i) => (
              <div key={i} className='space-y-2 rounded-xl border p-2.5'>
                <Skeleton className='aspect-square w-full rounded-lg' />
                <Skeleton className='mx-auto h-3 w-3/4' />
              </div>
            ))}
          </div>
        ) : displayEntries.length > 0 ? (
          <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5'>
            {displayEntries.map(({ slug, image_url: slugImage }, idx) => {
              const matchedCat = flatCategories.find((c) => c.slug === slug || c.name === slug);
              const fallbackCat =
                showcaseCategories.find((c) => c.category_slug === slug || c.category_name === slug) || showcaseCategories[idx];
              const isSelected = slug === (selectedSlug || currentSlugs[0]);
              const label = fallbackCat?.category_name || matchedCat?.name || slug;
              const productCount = fallbackCat?.products?.length ?? 0;
              const imageUrls = [
                ...new Set(
                  [slugImage, matchedCat?.icon, matchedCat?.banner_image, matchedCat?.image, fallbackCat?.image_url].filter(
                    Boolean,
                  ) as string[],
                ),
              ];

              return (
                <div
                  key={slug || idx}
                  onClick={() => setSelectedSlug(slug)}
                  className={`group relative flex cursor-pointer flex-col items-center rounded-xl border p-2.5 text-center transition-all duration-200 ${
                    isSelected
                      ? 'border-primary bg-primary/5 ring-primary/30 shadow-sm ring-2'
                      : 'border-border bg-card hover:border-primary/50 hover:bg-accent/30'
                  }`}>
                  {isSelected && (
                    <div className='bg-primary text-primary-foreground absolute top-1.5 right-1.5 z-10 flex h-4 w-4 items-center justify-center rounded-full shadow-xs'>
                      <CheckCircle2 className='h-3 w-3' />
                    </div>
                  )}

                  <div className='bg-muted relative mb-2 aspect-square w-full overflow-hidden rounded-lg border'>
                    <TabImage key={imageUrls.join('|')} urls={imageUrls} alt={label} placeholder={`#${idx + 1}`} />
                    {productCount > 0 && (
                      <Badge
                        variant='secondary'
                        className='absolute right-1 bottom-1 h-4 px-1 text-[9px] font-semibold backdrop-blur-xs'>
                        {tContent('homepage.items_count', { count: productCount })}
                      </Badge>
                    )}
                  </div>

                  <div className='relative w-full min-w-0 pr-14 text-left'>
                    <p
                      className={`truncate text-xs font-bold transition-colors ${
                        isSelected ? 'text-primary' : 'text-foreground'
                      }`}>
                      {label}
                    </p>
                    {slug && <span className='text-muted-foreground block truncate font-mono text-[9px]'>{slug}</span>}

                    <SectionCardActions
                      variant='ghost'
                      positionClass='top-1/2 right-0 -translate-y-1/2'
                      alwaysVisible
                      onEdit={() => openImageDialog({ slug, label, isNew: false }, slugImage)}
                      onDelete={() => handleDeleteCategory(slug)}
                      isDeleting={isLoadingTarget(slug)}
                      disabled={isLoading}
                    />
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
              <Plus className='h-3 w-3' /> {tContent('homepage.add_category_shortcut')}
            </Button>
          </div>
        )}

        <SectionItemLimitControl
          limit={currentLimit}
          onChange={handleLimitChange}
          disabled={isLoading}
          options={[6, 12, 18, 24, 30]}
        />
      </div>

      {/* Products in Active Category Panel */}
      <div className='bg-card space-y-4 rounded-xl border p-4 shadow-2xs'>
        <div className='flex flex-wrap items-center justify-between gap-3 border-b pb-3.5'>
          <div className='space-y-0.5'>
            <div className='flex items-center gap-2'>
              <Sparkles className='text-primary h-4 w-4' />
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
            <Sparkles className='text-muted-foreground mx-auto h-8 w-8' />
            <p className='text-foreground text-xs font-semibold'>{tContent('homepage.no_showcase_products')}</p>
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
        title={tContent('homepage.add_category_shortcut')}
        description={tContent('homepage.add_showcase_cat_dialog_desc')}
        items={dialogItems}
        isLoading={isCategoriesLoading}
        hasMore={hasMoreCategories}
        isLoadingMore={isFetchingMoreCategories}
        onLoadMore={fetchMoreCategories}
        existingKeys={currentSlugs}
        onConfirm={handleConfirmAddCategories}
      />

      <CategoryTabImageDialog
        target={imageTarget}
        value={imageValue}
        onValueChange={setImageValue}
        saving={isLoading}
        onClose={() => setImageTarget(null)}
        onSubmit={handleSaveImage}
      />
    </div>
  );
};

export default CategoryShowcaseEditor;
