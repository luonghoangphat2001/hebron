import { ImageColumnPreview, ImagePreviewDialog } from '@/components/dialog/ImagePreviewDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { UpdatePageSectionREQ } from '@/data/homepage-management/homepage.request';
import { buildPortfolioPreviewUpdatePayload } from '@/data/homepage-management/homepage.service';
import type { MallSection } from '@/data/homepage-management/homepage.type';
import { sanitizeHtml, stripHtml } from '@/utils/helper/string.helper';
import { Briefcase, Building2, Calendar, Eye, Hash, ImageIcon, Layers, Sparkles, Tag } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSectionActionLoading } from '../../hooks/useSectionActionLoading';
import SectionItemLimitControl from '../SectionItemLimitControl';
import SectionHeader from '../ui/SectionHeader';
import SectionHeadingDescription from '../ui/SectionHeadingDescription';

type Props = {
  section: MallSection;
  onSaveSection?: (payload?: Partial<UpdatePageSectionREQ>) => Promise<any> | void;
};

type PortfolioItem = {
  id?: number;
  site_type?: string;
  title: string;
  client?: string | null;
  category?: string | null;
  year?: number | null;
  description?: string | null;
  cover_image?: string | null;
  gallery?: string[];
  is_featured?: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
};

export const PortfolioPreviewView: React.FC<Props> = ({ section, onSaveSection }) => {
  const { t: tCommon } = useTranslation('common');
  const { t: tContent } = useTranslation('content');
  const { t: tEnum } = useTranslation('enum');

  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [selectedPortfolio, setSelectedPortfolio] = useState<PortfolioItem | null>(null);

  const rawSection: any = section.rawSection || section;
  const content = useMemo(() => rawSection?.content || {}, [rawSection?.content]);

  const [heading, setHeading] = useState(rawSection?.title || '포트폴리오');
  const [description, setDescription] = useState(rawSection?.description || rawSection?.subtitle || '');

  const { isLoading, isLoadingTarget, runWithLoading } = useSectionActionLoading<'save_all' | 'limit'>();

  const items: PortfolioItem[] = useMemo(() => {
    if (Array.isArray(content.items)) {
      return content.items;
    }
    return [];
  }, [content.items]);

  const currentLimit = Number(content.limit);

  const displayItems = useMemo(() => {
    return items.slice(0, currentLimit);
  }, [items, currentLimit]);

  const handleLimitChange = (newLimit: number) =>
    runWithLoading('limit', () =>
      onSaveSection?.(
        buildPortfolioPreviewUpdatePayload(
          heading,
          description,
          rawSection?.title || section.name,
          rawSection?.subtitle,
          section,
          newLimit,
        ),
      ),
    );

  const handleSaveAll = () =>
    runWithLoading('save_all', () =>
      onSaveSection?.(
        buildPortfolioPreviewUpdatePayload(
          heading,
          description,
          rawSection?.title || section.name,
          rawSection?.subtitle,
          section,
          currentLimit,
        ),
      ),
    );

  return (
    <div className='space-y-6'>
      {/* 1. Header Information / Save Action */}
      <SectionHeader
        title={section?.name || tEnum('content.portfolio_preview', '포트폴리오')}
        icon={Briefcase}
        badgeText='portfolio_preview'
        onSave={handleSaveAll}
        isSaving={isLoadingTarget('save_all')}
        saveDisabled={isLoading}
      />

      {/* 2. Section Heading & Description Editor */}
      <SectionHeadingDescription
        heading={heading}
        onChangeHeading={setHeading}
        headingLabel={tContent('homepage.section_heading', '섹션 헤딩 (Title)')}
        descriptionLabel={tContent('homepage.section_description', '설명 문구 (Subtitle)')}
        headingType='textarea'
        headingPlaceholder='주요 포트폴리오를 확인해보세요'
        description={description}
        onChangeDescription={setDescription}
        descriptionPlaceholder='수십 년의 장인 정신과 노하우로 제작된...'
        descriptionRows={2}
      />
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h4 className='text-foreground flex items-center gap-2 text-sm font-bold'>
            <Eye className='text-primary h-4 w-4' />
            {tContent('homepage.portfolio_items_list')}
          </h4>
          <span className='text-muted-foreground text-xs'>{tContent('homepage.total_items_count', { count: items.length })}</span>
        </div>

        {displayItems.length === 0 ? (
          <div className='border-muted text-muted-foreground flex flex-col items-center justify-center rounded-2xl border-2 border-dashed py-14 text-center'>
            <Briefcase className='mb-2 h-10 w-10 opacity-30' />
            <p className='text-xs font-medium'>{tContent('homepage.no_portfolio_items')}</p>
            <p className='mt-1 text-[11px] opacity-70'>{tContent('homepage.no_portfolio_items_desc')}</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {displayItems.map((item, idx) => {
              const plainDescription = item.description ? stripHtml(item.description) : '';
              const categoryLabel = item.category ? tEnum(`content.${item.category}`, item.category) : '';

              return (
                <div
                  key={item.id ?? idx}
                  onClick={() => setSelectedPortfolio(item)}
                  className='group bg-card hover:border-primary/50 relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border shadow-2xs transition-all hover:shadow-md'>
                  {/* Cover Image Container */}
                  <div className='bg-muted relative aspect-16/10 w-full overflow-hidden'>
                    {item.cover_image ? (
                      <img
                        src={item.cover_image}
                        alt={item.title}
                        className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
                      />
                    ) : (
                      <div className='text-muted-foreground flex h-full w-full items-center justify-center'>
                        <ImageIcon className='h-8 w-8 opacity-30' />
                      </div>
                    )}

                    {/* Top Badges */}
                    <div className='pointer-events-none absolute top-2.5 left-2.5 flex items-center gap-1.5'>
                      <Badge className='bg-black/70 font-mono text-[10px] font-bold text-white backdrop-blur-xs'>
                        #{idx + 1}
                      </Badge>
                      {item.is_featured && (
                        <Badge className='bg-amber-500/90 text-[10px] font-bold text-white shadow-xs'>
                          <Sparkles className='mr-1 h-2.5 w-2.5' /> {tContent('homepage.featured')}
                        </Badge>
                      )}
                    </div>

                    {categoryLabel && (
                      <div className='pointer-events-none absolute right-2.5 bottom-2.5'>
                        <Badge variant='outline' className='bg-background/90 text-[10px] font-bold shadow-xs backdrop-blur-xs'>
                          {categoryLabel}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className='flex flex-1 flex-col justify-between space-y-3 p-4'>
                    <div className='space-y-1.5'>
                      <div className='flex items-center justify-between gap-2'>
                        <h5 className='text-foreground line-clamp-1 text-sm font-bold'>{item.title}</h5>
                        {item.year && (
                          <span className='text-muted-foreground flex items-center gap-0.5 font-mono text-[11px] font-medium'>
                            <Calendar className='h-3 w-3' />
                            {item.year}
                          </span>
                        )}
                      </div>

                      {item.client && (
                        <p className='text-muted-foreground line-clamp-1 text-xs font-semibold'>
                          {tContent('homepage.client_label')} <span className='text-foreground'>{item.client}</span>
                        </p>
                      )}

                      {plainDescription && (
                        <p className='text-muted-foreground line-clamp-2 text-xs leading-relaxed'>{plainDescription}</p>
                      )}
                    </div>

                    {/* Gallery Thumbnails if present */}
                    {item.gallery && item.gallery.length > 0 && (
                      <div className='border-border/60 flex items-center gap-1.5 border-t pt-2.5'>
                        <span className='text-muted-foreground text-[10px] font-medium'>
                          {tContent('homepage.gallery_label')}
                        </span>
                        <div className='flex items-center gap-1.5 py-0.5'>
                          {item.gallery.slice(0, 4).map((gImg, gIdx) => (
                            <button
                              key={gIdx}
                              type='button'
                              title={tContent('homepage.click_to_preview')}
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewImageUrl(gImg);
                              }}
                              className='group/g border-border/80 hover:border-primary relative h-7 w-7 shrink-0 cursor-pointer overflow-hidden rounded-md border shadow-2xs transition-all hover:scale-105'>
                              <img src={gImg} alt={`gallery-${gIdx}`} className='h-full w-full object-cover' />
                              <div className='absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition-opacity group-hover/g:opacity-100'>
                                <Eye className='h-3 w-3 text-white' />
                              </div>
                            </button>
                          ))}
                          {item.gallery.length > 4 && (
                            <span className='text-muted-foreground bg-muted rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold'>
                              +{item.gallery.length - 4}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <SectionItemLimitControl limit={currentLimit} onChange={handleLimitChange} disabled={isLoading} options={[3, 6, 9, 12]} />

      {/* Portfolio Detail Dialog */}
      <Dialog open={!!selectedPortfolio} onOpenChange={(open) => !open && setSelectedPortfolio(null)}>
        <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-2xl'>
          {selectedPortfolio && (
            <div className='space-y-5'>
              <DialogHeader>
                <div className='flex flex-wrap items-center gap-2'>
                  <DialogTitle className='text-lg font-bold'>{selectedPortfolio.title}</DialogTitle>
                  {selectedPortfolio.is_featured && (
                    <Badge className='bg-amber-500/90 text-xs font-bold text-white shadow-xs'>
                      <Sparkles className='mr-1 h-3 w-3' /> {tContent('homepage.featured')}
                    </Badge>
                  )}
                  {selectedPortfolio.category && (
                    <Badge variant='outline' className='text-xs font-bold'>
                      {tEnum(`content.${selectedPortfolio.category}`, selectedPortfolio.category)}
                    </Badge>
                  )}
                </div>
                <DialogDescription className='text-xs'>{tContent('homepage.portfolio_detail_desc')}</DialogDescription>
              </DialogHeader>

              {/* Cover Image Banner */}
              {selectedPortfolio.cover_image && (
                <div className='bg-muted/40 relative aspect-16/9 w-full overflow-hidden rounded-xl border'>
                  <ImageColumnPreview
                    src={selectedPortfolio.cover_image}
                    alt={selectedPortfolio.title}
                    className='h-full w-full'
                    previewLabel={tCommon('button.preview')}
                  />
                </div>
              )}

              {/* Metadata Info Pills */}
              <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
                {selectedPortfolio.client && (
                  <div className='bg-muted/20 border-border/80 flex items-center gap-2.5 rounded-xl border p-3'>
                    <Building2 className='text-primary h-4 w-4 shrink-0' />
                    <div className='min-w-0 flex-1'>
                      <p className='text-muted-foreground text-[10px] font-medium'>{tContent('homepage.client_label')}</p>
                      <p className='text-foreground truncate text-xs font-bold'>{selectedPortfolio.client}</p>
                    </div>
                  </div>
                )}

                {selectedPortfolio.year && (
                  <div className='bg-muted/20 border-border/80 flex items-center gap-2.5 rounded-xl border p-3'>
                    <Calendar className='text-primary h-4 w-4 shrink-0' />
                    <div className='min-w-0 flex-1'>
                      <p className='text-muted-foreground text-[10px] font-medium'>{tContent('homepage.year_label')}</p>
                      <p className='text-foreground font-mono text-xs font-bold'>{selectedPortfolio.year}</p>
                    </div>
                  </div>
                )}

                {selectedPortfolio.category && (
                  <div className='bg-muted/20 border-border/80 flex items-center gap-2.5 rounded-xl border p-3'>
                    <Tag className='text-primary h-4 w-4 shrink-0' />
                    <div className='min-w-0 flex-1'>
                      <p className='text-muted-foreground text-[10px] font-medium'>{tContent('homepage.category_label')}</p>
                      <p className='text-foreground truncate text-xs font-bold'>
                        {tEnum(`content.${selectedPortfolio.category}`, selectedPortfolio.category)}
                      </p>
                    </div>
                  </div>
                )}

                {selectedPortfolio.sort_order !== undefined && selectedPortfolio.sort_order !== null && (
                  <div className='bg-muted/20 border-border/80 flex items-center gap-2.5 rounded-xl border p-3'>
                    <Hash className='text-primary h-4 w-4 shrink-0' />
                    <div className='min-w-0 flex-1'>
                      <p className='text-muted-foreground text-[10px] font-medium'>{tContent('homepage.sort_order_label')}</p>
                      <p className='text-foreground font-mono text-xs font-bold'>{selectedPortfolio.sort_order}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Rich Description */}
              {Boolean(stripHtml(selectedPortfolio.description)) && (
                <div className='space-y-2'>
                  <h6 className='text-foreground text-xs font-bold'>{tContent('homepage.brand_statement_desc_label')}</h6>
                  <div
                    className='bg-muted/20 text-foreground/90 border-border/70 rounded-xl border p-4 text-xs leading-relaxed'
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(selectedPortfolio.description) }}
                  />
                </div>
              )}

              {/* Gallery Grid */}
              {selectedPortfolio.gallery && selectedPortfolio.gallery.length > 0 && (
                <div className='space-y-2.5'>
                  <div className='flex items-center justify-between'>
                    <h6 className='text-foreground flex items-center gap-1.5 text-xs font-bold'>
                      <Layers className='text-primary h-3.5 w-3.5' />
                      {tContent('homepage.showcase_images_gallery')}
                    </h6>
                    <span className='text-muted-foreground font-mono text-[11px]'>
                      {tContent('homepage.total_images_count', { count: selectedPortfolio.gallery.length })}
                    </span>
                  </div>

                  <div className='grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4'>
                    {selectedPortfolio.gallery.map((gImg, gIdx) => (
                      <div key={gIdx} className='bg-muted group relative aspect-4/3 overflow-hidden rounded-xl border shadow-2xs'>
                        <ImageColumnPreview
                          src={gImg}
                          alt={`gallery-detail-${gIdx}`}
                          className='h-full w-full object-cover'
                          previewLabel={tCommon('button.preview')}
                        />
                        <div className='pointer-events-none absolute top-1.5 left-1.5'>
                          <Badge className='bg-background/90 text-foreground font-mono text-[9px] font-bold shadow-xs backdrop-blur-xs'>
                            #{gIdx + 1}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <DialogFooter className='border-t pt-3'>
                <Button variant='outline' size='sm' onClick={() => setSelectedPortfolio(null)}>
                  {tCommon('button.close')}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Fullscreen Image Preview Dialog */}
      <ImagePreviewDialog url={previewImageUrl} onClose={() => setPreviewImageUrl(null)} />
    </div>
  );
};

export default PortfolioPreviewView;
