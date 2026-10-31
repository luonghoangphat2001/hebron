import { Badge } from '@/components/ui/badge';
import type { UpdatePageSectionREQ } from '@/data/homepage-management/homepage.request';
import { buildCraftsmanshipValuesUpdatePayload } from '@/data/homepage-management/homepage.service';
import type { MallSection } from '@/data/homepage-management/homepage.type';
import { ImageIcon, Layers, Package } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSectionActionLoading } from '../../hooks/useSectionActionLoading';
import SectionHeader from '../ui/SectionHeader';
import SectionHeadingDescription from '../ui/SectionHeadingDescription';

type Props = {
  section: MallSection;
  onSaveSection?: (payload?: Partial<UpdatePageSectionREQ>) => Promise<any> | void;
};

type CraftsmanshipProduct = {
  product_id: number;
  product_code?: string;
  name: { ko?: string; en?: string } | string;
  slug?: string;
  selling_price?: number;
  original_price?: number;
  first_image?: string;
  is_popular?: boolean;
  is_featured?: boolean;
  is_active?: boolean;
  sort_order?: number;
  has_discount?: boolean;
  discount_percentage?: number;
  category_ids?: number[];
};

type CraftsmanshipItem = {
  id?: number | string;
  title: string;
  subtitle?: string | null;
  image_url?: string | null;
  description?: string | null;
  button_label?: string | null;
  products?: CraftsmanshipProduct[];
  sort_order?: number;
  is_active?: boolean;
};

const getProductName = (name?: { ko?: string; en?: string } | string | null, isKo = true): string => {
  if (!name) return '-';
  if (typeof name === 'string') return name;
  return isKo ? name.ko || name.en || '-' : name.en || name.ko || '-';
};

export const CraftsmanshipValuesView: React.FC<Props> = ({ section, onSaveSection }) => {
  const { t: tContent } = useTranslation('content');
  const { t: tEnum } = useTranslation('enum');
  const { i18n } = useTranslation();
  const isKo = i18n.language === 'kr';

  const rawSection: any = section.rawSection || section;
  const content = useMemo(() => rawSection?.content || {}, [rawSection?.content]);

  const [heading, setHeading] = useState(rawSection?.title || '장인의 손끝에서 탄생하는 가치');
  const [description, setDescription] = useState(
    rawSection?.description ||
      rawSection?.subtitle ||
      '1998년부터 이어온 헤브론의 제조 철학—최고의 소재, 정밀한 공정, 그리고 장인의 이야기.',
  );

  const items: CraftsmanshipItem[] = useMemo(() => (Array.isArray(content.items) ? content.items : []), [content.items]);

  const { isLoading, isLoadingTarget, runWithLoading } = useSectionActionLoading<'save_overview'>();

  const handleSaveOverview = () => {
    return runWithLoading('save_overview', () =>
      onSaveSection?.(buildCraftsmanshipValuesUpdatePayload(heading, description, section)),
    );
  };

  return (
    <div className='space-y-6'>
      {/* 1. Header Bar with Save button */}
      <SectionHeader
        title={heading || section.name || tEnum('content.craftsmanship_values', '장인의 손끝에서 탄생하는 가치')}
        icon={Layers}
        badgeText={tContent('homepage.items_count_suffix', { count: items.length })}
        onSave={handleSaveOverview}
        isSaving={isLoadingTarget('save_overview')}
        saveDisabled={isLoading}
      />

      {/* 2. Heading & Description Editor Inputs */}
      <SectionHeadingDescription
        heading={heading}
        onChangeHeading={setHeading}
        description={description}
        onChangeDescription={setDescription}
        headingLabel={tContent('homepage.section_heading')}
        descriptionLabel={tContent('homepage.section_description')}
        headingPlaceholder='장인의 손끝에서 탄생하는 가치'
        descriptionPlaceholder='헤브론의 제조 철학과 가치를 설명해주세요.'
        descriptionRows={3}
      />

      {/* 3. Craftsmanship Values Items List (Full Width Cards, Full Content) */}
      <div className='space-y-6'>
        {items.map((item, idx) => {
          const displayImage = item.image_url;
          const productList = item.products || [];

          return (
            <div
              key={item.id ?? idx}
              className='bg-card hover:border-border/80 overflow-hidden rounded-2xl border shadow-2xs transition-all'>
              {/* Card Main Info: Split Image + Full Details */}
              <div className='grid grid-cols-1 gap-6 p-6 lg:grid-cols-12'>
                {/* Left: Showcase Image */}
                <div className='lg:col-span-4'>
                  <div className='bg-muted relative aspect-4/3 w-full overflow-hidden rounded-xl border'>
                    {displayImage ? (
                      <img src={displayImage} alt={item.title} className='h-full w-full object-cover' />
                    ) : (
                      <div className='text-muted-foreground flex h-full w-full items-center justify-center'>
                        <ImageIcon className='h-10 w-10 opacity-30' />
                      </div>
                    )}

                    <div className='absolute top-3 left-3 flex items-center gap-1.5'>
                      <Badge className='bg-background/90 text-foreground font-mono text-xs font-bold shadow-xs backdrop-blur-xs'>
                        #{idx + 1}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Right: Full Title, Subtitle, Description, Badges */}
                <div className='flex flex-col justify-between space-y-4 lg:col-span-8'>
                  <div className='space-y-3'>
                    <div className='flex flex-wrap items-center justify-between gap-2'>
                      <div>
                        <h4 className='text-foreground text-lg leading-tight font-bold'>{item.title}</h4>
                        {item.subtitle && <p className='text-muted-foreground mt-0.5 text-sm font-medium'>{item.subtitle}</p>}
                      </div>
                      {item.button_label && (
                        <Badge variant='outline' className='text-xs font-semibold'>
                          {item.button_label}
                        </Badge>
                      )}
                    </div>

                    {/* Full Description text */}
                    {item.description ? (
                      <p className='text-foreground/90 bg-muted/20 border-border/50 rounded-xl border p-4 text-sm leading-relaxed whitespace-pre-line'>
                        {item.description}
                      </p>
                    ) : (
                      <p className='text-muted-foreground text-xs italic'>{tContent('homepage.no_details_desc')}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Linked Products Section */}
              <div className='border-border/60 bg-muted/15 border-t p-6'>
                <div className='mb-3 flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <Package className='text-primary h-4 w-4' />
                    <h5 className='text-foreground text-sm font-bold'>{tContent('homepage.linked_products')}</h5>
                    <Badge variant='outline' className='font-bold'>
                      {productList.length}
                    </Badge>
                  </div>
                </div>

                {productList.length === 0 ? (
                  <div className='border-muted-foreground/20 text-muted-foreground rounded-xl border border-dashed py-8 text-center text-xs'>
                    {tContent('homepage.no_linked_products')}
                  </div>
                ) : (
                  <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3'>
                    {productList.map((prod) => {
                      const name = getProductName(prod.name, isKo);
                      const price = prod.selling_price || prod.original_price || 0;
                      const hasDiscount = prod.has_discount && prod.original_price && prod.original_price > price;

                      return (
                        <div
                          key={prod.product_id}
                          className='bg-card hover:border-primary/40 flex items-start gap-3 rounded-xl border p-3 shadow-2xs transition-all'>
                          {/* Product Thumbnail */}
                          <div className='bg-muted relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border'>
                            {prod.first_image ? (
                              <img src={prod.first_image} alt={name} className='h-full w-full object-cover' />
                            ) : (
                              <div className='text-muted-foreground flex h-full w-full items-center justify-center'>
                                <Package className='h-4 w-4 opacity-40' />
                              </div>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className='min-w-0 flex-1 space-y-1'>
                            <div className='flex flex-wrap items-center gap-1.5'>
                              {prod.product_code && (
                                <span className='bg-muted text-muted-foreground rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold'>
                                  {prod.product_code}
                                </span>
                              )}
                              {prod.is_popular && (
                                <Badge className='h-4 bg-amber-500/10 px-1 text-[9px] font-bold text-amber-600 hover:bg-amber-500/10'>
                                  {tContent('homepage.popular')}
                                </Badge>
                              )}
                              {prod.is_featured && (
                                <Badge className='h-4 bg-blue-500/10 px-1 text-[9px] font-bold text-blue-600 hover:bg-blue-500/10'>
                                  {tContent('homepage.featured')}
                                </Badge>
                              )}
                            </div>

                            {/* Product Name */}
                            <p className='text-foreground text-xs leading-snug font-bold'>{name}</p>

                            {/* Price details */}
                            <div className='flex flex-wrap items-baseline gap-1.5 pt-0.5'>
                              <span className='text-foreground text-xs font-bold'>₩{Number(price).toLocaleString()}</span>
                              {hasDiscount && (
                                <>
                                  <span className='text-muted-foreground text-[10px] line-through'>
                                    ₩{Number(prod.original_price).toLocaleString()}
                                  </span>
                                  {prod.discount_percentage ? (
                                    <span className='text-[10px] font-bold text-red-500'>{prod.discount_percentage}% OFF</span>
                                  ) : null}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CraftsmanshipValuesView;
