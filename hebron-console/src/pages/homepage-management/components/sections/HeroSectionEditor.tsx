import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { UpdatePageSectionREQ } from '@/data/homepage-management/homepage.request';
import type { HeroSlideItemRESP } from '@/data/homepage-management/homepage.response';
import { buildBrandHeroSectionUpdatePayload } from '@/data/homepage-management/homepage.service';
import type { HeroPrimaryCta, HeroStatItem, MallSection } from '@/data/homepage-management/homepage.type';
import { PageType, SiteType } from '@/utils/enums/homepage.enum';
import { ArrowUpRight, BarChart3, Eye, Image as ImageIcon, Info, Loader2, Plus, Sparkles } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSectionActionLoading } from '../../hooks/useSectionActionLoading';
import SectionCardActions from '../ui/SectionCardActions';
import SectionEmptyState from '../ui/SectionEmptyState';
import SectionHeader from '../ui/SectionHeader';
import SectionHeadingDescription from '../ui/SectionHeadingDescription';

type Props = {
  heroSlides?: HeroSlideItemRESP[];
  section?: MallSection;
  rawContent?: any;
  siteType?: SiteType;
  pageType?: PageType;
  onSaveSection?: (payload?: Partial<UpdatePageSectionREQ>) => Promise<any> | void;
};

export const HeroSectionEditor: React.FC<Props> = ({
  heroSlides = [],
  section,
  rawContent,
  siteType = SiteType.SHOPPING_MALL,
  pageType,
  onSaveSection,
}) => {
  const { t: tContent } = useTranslation('content');
  const { t: tCommon } = useTranslation('common');

  const isProcess = pageType === PageType.PROCESS;
  const isProductionInquiry = pageType === PageType.PRODUCTION_INQUIRY;
  const isBrandHome = pageType === PageType.HOME_PAGE;
  const isBrandStory = pageType === PageType.BRAND_STORY;

  const showPrimaryCta = !isProductionInquiry && !isProcess && (isBrandHome || Boolean(rawContent?.primary_cta));
  const showStats =
    !isProductionInquiry && !isProcess && (isBrandHome || Boolean(rawContent?.stats && rawContent.stats.length > 0));

  const isBrandSite = siteType === SiteType.BRAND_SITE || Boolean(rawContent?.stats || rawContent?.heading);

  const defaultHeading = isProductionInquiry ? '제작 문의' : isProcess ? '공정' : '그 순간을\n영원히 담다';
  const defaultDescription = isProductionInquiry
    ? ''
    : isProcess
      ? ''
      : '수십 년의 장인 정신으로 만들어낸\n고품격 트로피 · 상패 · 기념패';

  // Brand Site states
  const [heading, setHeading] = useState(section?.rawSection?.title ?? defaultHeading);
  const [description, setDescription] = useState(
    section?.rawSection?.description ?? section?.rawSection?.subtitle ?? defaultDescription,
  );
  const [primaryCta, setPrimaryCta] = useState<HeroPrimaryCta>({
    label: rawContent?.primary_cta?.label || '제작 문의',
    link: rawContent?.primary_cta?.link || '/inquiry',
  });

  React.useEffect(() => {
    if (section?.rawSection?.title !== undefined) {
      setHeading(section.rawSection.title);
    }
    if (section?.rawSection?.description !== undefined || section?.rawSection?.subtitle !== undefined) {
      setDescription(section?.rawSection?.description ?? section?.rawSection?.subtitle ?? '');
    }
  }, [section?.rawSection?.title, section?.rawSection?.description, section?.rawSection?.subtitle]);

  const initialStats: HeroStatItem[] = useMemo(() => {
    if (!Array.isArray(rawContent?.stats)) return [];
    return rawContent.stats.map((s: any) => ({
      value: s.value || '',
      label: s.label || (Array.isArray(s.lines) ? s.lines.join(' ') : ''),
      lines: Array.isArray(s.lines) && s.lines.length > 0 ? s.lines : s.label ? [s.label] : [],
    }));
  }, [rawContent]);

  const [stats, setStats] = useState<HeroStatItem[]>(initialStats);
  const [isStatDialogOpen, setIsStatDialogOpen] = useState(false);
  const [editingStatIndex, setEditingStatIndex] = useState<number | null>(null);
  const [statForm, setStatForm] = useState<{ value: string; linesText: string }>({
    value: '',
    linesText: '',
  });

  const { isLoading, isLoadingTarget, runWithLoading } = useSectionActionLoading<number | 'save_hero' | 'save_stat'>();

  // Slides from rawContent or props sorted ascending by sort_order
  const displaySlides = useMemo(() => {
    const rawSlides = (
      heroSlides.length > 0 ? heroSlides : Array.isArray(rawContent?.items) ? rawContent.items : []
    ) as HeroSlideItemRESP[];

    const sorted = [...rawSlides].sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0));

    if (!isBrandSite) return sorted;
    if (isBrandStory) return sorted.slice(0, 2);
    return sorted.slice(0, 1);
  }, [heroSlides, rawContent, isBrandSite, isBrandStory]);

  const handleOpenAddStat = () => {
    setEditingStatIndex(null);
    setStatForm({ value: '', linesText: '' });
    setIsStatDialogOpen(true);
  };

  const handleOpenEditStat = (index: number) => {
    setEditingStatIndex(index);
    const target = stats[index];
    const text = (target.lines && target.lines.length > 0 ? target.lines : target.label ? [target.label] : []).join('\n');
    setStatForm({
      value: target.value,
      linesText: text,
    });
    setIsStatDialogOpen(true);
  };

  const handleDeleteStat = (indexToDelete: number) => {
    const nextStats = stats.filter((_, idx) => idx !== indexToDelete);
    setStats(nextStats);
    return runWithLoading(indexToDelete, () =>
      onSaveSection?.(
        buildBrandHeroSectionUpdatePayload(rawContent, heading, description, primaryCta, nextStats, section?.name, section),
      ),
    );
  };

  const handleSaveStatModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!statForm.value.trim()) return;

    const lines = statForm.linesText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    const newStatItem: HeroStatItem = {
      value: statForm.value.trim(),
      label: lines.join(' '),
      lines,
    };

    let nextStats: HeroStatItem[];
    if (editingStatIndex !== null) {
      nextStats = stats.map((item, idx) => (idx === editingStatIndex ? newStatItem : item));
    } else {
      nextStats = [...stats, newStatItem];
    }
    setStats(nextStats);
    setIsStatDialogOpen(false);

    return runWithLoading('save_stat', () =>
      onSaveSection?.(
        buildBrandHeroSectionUpdatePayload(rawContent, heading, description, primaryCta, nextStats, section?.name, section),
      ),
    );
  };

  const handleSaveAll = () => {
    return runWithLoading('save_hero', () =>
      onSaveSection?.(
        buildBrandHeroSectionUpdatePayload(rawContent, heading, description, primaryCta, stats, section?.name, section),
      ),
    );
  };

  return (
    <div className='space-y-6'>
      {/* Top Banner / Save Action */}
      {isBrandSite ? (
        <SectionHeader
          title={section?.name || tContent('homepage.hero_section', '메인 배너 (Hero Section)')}
          icon={Sparkles}
          badgeText='hero_section'
          onSave={handleSaveAll}
          isSaving={isLoadingTarget('save_hero')}
          saveDisabled={isLoading}
        />
      ) : (
        <div className='bg-primary/5 border-primary/20 text-foreground flex items-center justify-between rounded-xl border p-3 text-xs shadow-2xs'>
          <div className='flex items-center gap-2'>
            <Info className='text-primary h-4 w-4 shrink-0' />
            <span className='text-muted-foreground text-[11px]'>{tContent('homepage.hero_view_only_desc')}</span>
          </div>
          <Badge variant='outline' className='bg-primary/10 text-primary border-primary/30 text-[10px] font-semibold'>
            <Eye className='mr-1 h-3 w-3' /> {tContent('homepage.view_only')}
          </Badge>
        </div>
      )}

      {/* Brand Hero Heading, Description & Primary CTA */}
      {isBrandSite && (
        <SectionHeadingDescription
          heading={heading}
          onChangeHeading={setHeading}
          headingLabel={tContent('homepage.section_heading', '섹션 헤딩 (Title)')}
          descriptionLabel={tContent('homepage.section_description', '설명 문구 (Subtitle)')}
          headingType='textarea'
          headingPlaceholder={isProductionInquiry ? '제작 문의' : '그 순간을\n영원히 담다'}
          description={description}
          onChangeDescription={setDescription}
          descriptionPlaceholder={isProductionInquiry ? '' : '수십 년의 장인 정신으로 만들어낸...'}
          descriptionRows={2}>
          {showPrimaryCta && (
            <div className='border-t pt-3'>
              <h5 className='text-foreground mb-2 text-xs font-bold'>{tContent('homepage.primary_cta_title')}</h5>
              <div className='grid grid-cols-1 gap-3'>
                <div className='space-y-1'>
                  <label className='text-muted-foreground text-xs font-semibold'>{tContent('homepage.button_text')}</label>
                  <Input
                    value={primaryCta.label}
                    onChange={(e) => setPrimaryCta({ ...primaryCta, label: e.target.value })}
                    placeholder={tContent('content.inquiry', '제작 문의')}
                    className='h-8 text-xs'
                  />
                </div>
              </div>
            </div>
          )}
        </SectionHeadingDescription>
      )}

      {isBrandSite && showStats && (
        <div className='bg-card space-y-3.5 rounded-xl border p-4 shadow-2xs'>
          <div className='flex items-center justify-between border-b pb-3'>
            <div className='flex items-center gap-2'>
              <BarChart3 className='text-primary h-4 w-4' />
              <h5 className='text-foreground text-xs font-bold'>{tContent('homepage.stats_title')}</h5>
              <Badge variant='outline' className='font-mono text-[10px]'>
                {stats.length} stats
              </Badge>
            </div>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={handleOpenAddStat}
              disabled={isLoading}
              className='h-7 gap-1 text-xs'>
              <Plus className='h-3.5 w-3.5' />
              {tContent('homepage.add_stat')}
            </Button>
          </div>

          {stats.length > 0 ? (
            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'>
              {stats.map((stat, idx) => (
                <div
                  key={idx}
                  className='group bg-muted/40 hover:border-primary/50 relative flex flex-col justify-between rounded-xl border p-3.5 shadow-2xs transition-all hover:shadow-xs'>
                  <div className='space-y-1.5'>
                    <div className='flex items-center gap-1.5'>
                      <Badge variant='secondary' className='font-mono text-[9px] font-bold'>
                        #{idx + 1}
                      </Badge>
                      <h6 className='text-primary font-mono text-sm font-black tracking-tight'>{stat.value}</h6>
                    </div>
                    <p className='text-muted-foreground line-clamp-2 text-xs font-medium whitespace-pre-line'>
                      {stat.lines && stat.lines.length > 0 ? stat.lines.join('\n') : stat.label}
                    </p>
                  </div>

                  <SectionCardActions
                    variant='ghost'
                    positionClass='top-2 right-2'
                    onEdit={() => handleOpenEditStat(idx)}
                    onDelete={() => handleDeleteStat(idx)}
                    isDeleting={isLoadingTarget(idx)}
                    disabled={isLoading}
                  />
                </div>
              ))}
            </div>
          ) : (
            <SectionEmptyState
              icon={BarChart3}
              message={tContent('homepage.no_stats')}
              description={tContent('homepage.no_stats_desc')}
              onAction={handleOpenAddStat}
              actionLabel={tContent('homepage.add_stat')}
              actionDisabled={isLoading}
            />
          )}
        </div>
      )}

      {/* Banner Slides List */}
      <div className='space-y-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <ImageIcon className='text-primary h-4 w-4' />
            <h4 className='text-sm font-semibold'>{tContent('homepage.banner_background', { count: displaySlides.length })}</h4>
          </div>
        </div>

        {/* Notice on banner sort order & rules (only for Brand Site) */}
        {isBrandSite && (
          <div className='flex items-start gap-2.5 rounded-lg border border-blue-200 bg-blue-50/60 p-3 text-xs text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-200'>
            <Info className='mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400' />
            <div className='space-y-1 leading-relaxed'>
              <p className='font-semibold'>
                {isBrandStory
                  ? tContent(
                      'homepage.hero_banner_notice_brand_story',
                      '브랜드 스토리(Brand Story)는 노출 순서(Sort Order)가 가장 낮은 상위 2개의 배너 이미지를 순서대로 노출합니다. (1순위: 가장 작은 sort order, 2순위: 두 번째로 작은 sort order)',
                    )
                  : tContent(
                      'homepage.hero_banner_notice_single',
                      '히어로 섹션은 노출 순서(Sort Order)가 가장 낮은 1개의 배너 이미지만 대표 이미지로 노출합니다.',
                    )}
              </p>
              <p className='text-[11px] text-blue-800/80 dark:text-blue-300/80'>
                {tContent(
                  'homepage.hero_banner_manage_hint',
                  '* 배너 이미지 추가, 삭제 및 노출 순서(Sort Order) 변경은 [배너 관리 (Banner Management)] 메뉴에서 설정하실 수 있습니다.',
                )}
              </p>
            </div>
          </div>
        )}

        {displaySlides.length > 0 ? (
          displaySlides.map((slide, idx) => (
            <div key={idx} className='bg-card space-y-3.5 rounded-xl border p-4 shadow-2xs'>
              <div className='flex flex-col items-start justify-between gap-4 md:flex-row md:items-center'>
                <div className='flex min-w-0 flex-1 items-start gap-3.5 sm:items-center'>
                  <div className='flex shrink-0 items-center gap-2'>
                    <div className='bg-muted group relative h-16 w-28 overflow-hidden rounded-lg border'>
                      <img src={slide.image_url} alt={slide.title} className='h-full w-full object-cover' />
                      <span className='absolute right-1 bottom-1 rounded bg-black/70 px-1 py-0 font-mono text-[8px] text-white'>
                        PC
                      </span>
                    </div>
                    {slide.mobile_image_url && (
                      <div className='bg-muted group relative h-16 w-12 overflow-hidden rounded-lg border'>
                        <img src={slide.mobile_image_url} alt='Mobile' className='h-full w-full object-cover' />
                        <span className='absolute right-1 bottom-1 rounded bg-black/70 px-1 py-0 font-mono text-[8px] text-white'>
                          MO
                        </span>
                      </div>
                    )}
                  </div>

                  <div className='min-w-0 flex-1 space-y-1.5'>
                    <div className='flex flex-wrap items-center gap-2'>
                      {isBrandSite ? (
                        <>
                          <Badge className='bg-primary/90 text-primary-foreground font-mono text-[10px] font-bold shadow-xs'>
                            {isBrandStory
                              ? idx === 0
                                ? tContent('homepage.banner_order_primary', '1순위 (상단 배너)')
                                : tContent('homepage.banner_order_secondary', '2순위 (하단 배너)')
                              : tContent('homepage.banner_order_main', '대표 배너 (Main)')}
                          </Badge>
                          <Badge variant='outline' className='font-mono text-[10px]'>
                            sort_order: <span className='text-foreground ml-1 font-bold'>{slide.sort_order ?? idx + 1}</span>
                          </Badge>
                        </>
                      ) : (
                        <Badge variant='outline' className='font-mono text-[10px]'>
                          {tContent('homepage.slide_badge', { index: slide.sort_order || idx + 1 })}
                        </Badge>
                      )}
                      <p className='text-foreground truncate text-xs font-bold'>{slide.title}</p>
                    </div>
                    {slide.link && (
                      <p className='text-primary flex items-center gap-1 font-mono text-[11px]'>
                        <ArrowUpRight className='h-3 w-3' /> {slide.link}
                      </p>
                    )}
                  </div>
                </div>

                <div className='flex shrink-0 items-center gap-2 self-end md:self-center'>
                  <Badge
                    className={
                      slide.is_active !== false
                        ? 'border-emerald-300 bg-emerald-500/15 text-[10px] text-emerald-700'
                        : 'bg-muted text-[10px]'
                    }>
                    {slide.is_active !== false ? tContent('homepage.badge_active') : tContent('homepage.badge_disabled')}
                  </Badge>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className='bg-muted/10 space-y-2.5 rounded-xl border border-dashed p-8 text-center'>
            <ImageIcon className='text-muted-foreground mx-auto h-8 w-8' />
            <p className='text-muted-foreground text-xs'>{tContent('homepage.no_hero_slides')}</p>
          </div>
        )}
      </div>

      {/* Add / Edit Stat Dialog */}
      <Dialog open={isStatDialogOpen} onOpenChange={setIsStatDialogOpen}>
        <DialogContent className='sm:max-w-md'>
          <form onSubmit={handleSaveStatModal} className='space-y-4'>
            <DialogHeader>
              <DialogTitle className='text-base font-bold'>
                {editingStatIndex !== null ? tContent('homepage.edit_stat') : tContent('homepage.create_stat')}
              </DialogTitle>
              <DialogDescription className='text-xs'>{tContent('homepage.stat_dialog_desc')}</DialogDescription>
            </DialogHeader>

            <div className='space-y-3 text-xs'>
              <div className='space-y-1.5'>
                <label className='font-semibold'>{tContent('homepage.stat_value_label')}</label>
                <Input
                  value={statForm.value}
                  onChange={(e) => setStatForm({ ...statForm, value: e.target.value })}
                  placeholder='예: 6,000 여개, 6,765+, One-Stop, 업계 유일'
                  className='h-8 font-mono text-xs'
                  required
                />
              </div>

              <div className='space-y-1.5'>
                <label className='font-semibold'>{tContent('homepage.stat_lines_label')}</label>
                <Textarea
                  value={statForm.linesText}
                  onChange={(e) => setStatForm({ ...statForm, linesText: e.target.value })}
                  placeholder={'판촉시장 도소매점\n납품실적'}
                  rows={3}
                  className='text-xs leading-relaxed'
                />
                <span className='text-muted-foreground text-[10px]'>{tContent('homepage.stat_lines_hint')}</span>
              </div>
            </div>

            <DialogFooter className='gap-2 pt-2'>
              <Button type='button' variant='outline' size='sm' onClick={() => setIsStatDialogOpen(false)}>
                {tCommon('button.cancel')}
              </Button>
              <Button type='submit' size='sm' disabled={isLoading}>
                {isLoadingTarget('save_stat') ? <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' /> : null}
                {tCommon('button.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HeroSectionEditor;
