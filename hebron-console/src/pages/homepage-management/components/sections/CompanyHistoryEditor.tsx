import { appToast } from '@/components/toast/AppToast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import AppUpload from '@/components/upload/AppUpload';
import { uploadFileAPI } from '@/data/file/file.api';
import type { UpdatePageSectionREQ } from '@/data/homepage-management/homepage.request';
import { buildCompanyHistoryUpdatePayload, normalizeCompanyHistoryData } from '@/data/homepage-management/homepage.service';
import type { CompanyHistoryItem, CompanyHistoryPeriod, MallSection } from '@/data/homepage-management/homepage.type';
import { FileType } from '@/utils/enums/file.enum';
import { Calendar, History, ImageIcon, Loader2, Plus, Trash2 } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSectionActionLoading } from '../../hooks/useSectionActionLoading';
import SectionCardActions from '../ui/SectionCardActions';
import SectionHeader from '../ui/SectionHeader';
import SectionHeadingDescription from '../ui/SectionHeadingDescription';

type Props = {
  section: MallSection;
  onSaveSection?: (payload?: Partial<UpdatePageSectionREQ>) => Promise<any> | void;
};

export const CompanyHistoryEditor: React.FC<Props> = ({ section, onSaveSection }) => {
  const { t: tCommon } = useTranslation('common');
  const { t: tContent } = useTranslation('content');
  const { t: tEnum } = useTranslation('enum');

  const initialData = useMemo(() => normalizeCompanyHistoryData(section), [section]);

  const [heading, setHeading] = useState(initialData.heading);
  const [description, setDescription] = useState(initialData.description);
  const [timeline, setTimeline] = useState<CompanyHistoryPeriod[]>(initialData.timeline);

  // Period Dialog state
  const [isPeriodOpen, setIsPeriodOpen] = useState(false);
  const [periodInput, setPeriodInput] = useState('');
  const [editingPeriodIdx, setEditingPeriodIdx] = useState<number | null>(null);

  // Item Dialog state
  const [isItemOpen, setIsItemOpen] = useState(false);
  const [targetPeriodIdx, setTargetPeriodIdx] = useState<number | null>(null);
  const [editingItemIdx, setEditingItemIdx] = useState<number | null>(null);

  const [itemForm, setItemForm] = useState<CompanyHistoryItem>({
    year: '',
    title: '',
    description: '',
    images: [],
  });

  const { isLoading, isLoadingTarget, runWithLoading } = useSectionActionLoading<
    string | number | 'save_all' | 'save_item' | 'save_period'
  >();

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

  // --- Period Handlers ---
  const handleOpenAddPeriod = () => {
    setEditingPeriodIdx(null);
    setPeriodInput('');
    setIsPeriodOpen(true);
  };

  const handleOpenEditPeriod = (periodIdx: number) => {
    setEditingPeriodIdx(periodIdx);
    setPeriodInput(timeline[periodIdx].period || timeline[periodIdx].title || '');
    setIsPeriodOpen(true);
  };

  const handleSavePeriod = (e: React.FormEvent) => {
    e.preventDefault();
    const periodStr = periodInput.trim();
    if (!periodStr) return;

    let nextTimeline: CompanyHistoryPeriod[];
    if (editingPeriodIdx !== null) {
      nextTimeline = timeline.map((p, idx) => (idx === editingPeriodIdx ? { ...p, period: periodStr, title: periodStr } : p));
    } else {
      nextTimeline = [...timeline, { period: periodStr, title: periodStr, items: [] }];
    }

    setTimeline(nextTimeline);
    setIsPeriodOpen(false);
  };

  const handleDeletePeriod = (periodIdx: number) =>
    runWithLoading(`period_${periodIdx}`, async () => {
      const nextTimeline = timeline.filter((_, idx) => idx !== periodIdx);
      setTimeline(nextTimeline);
      return onSaveSection?.(
        buildCompanyHistoryUpdatePayload(
          {
            heading,
            description,
            timeline: nextTimeline,
          },
          section,
        ),
      );
    });

  // --- Item Handlers ---
  const handleOpenAddItem = (periodIdx: number) => {
    setTargetPeriodIdx(periodIdx);
    setEditingItemIdx(null);
    setItemForm({
      year: '',
      title: '',
      description: '',
      images: [],
    });
    setIsItemOpen(true);
  };

  const handleOpenEditItem = (periodIdx: number, itemIdx: number) => {
    setTargetPeriodIdx(periodIdx);
    setEditingItemIdx(itemIdx);
    const target = timeline[periodIdx]?.items[itemIdx];
    if (target) {
      setItemForm({
        year: target.year || '',
        title: target.title || '',
        description: target.description || '',
        images: target.images ? [...target.images] : [],
      });
      setIsItemOpen(true);
    }
  };

  const handleImageUpload = async (val?: string | File | (string | File)[]) => {
    if (!val) return;
    const fileOrUrl = Array.isArray(val) ? val[0] : val;
    if (typeof fileOrUrl === 'string') {
      setItemForm((prev) => ({
        ...prev,
        images: [...(prev.images || []), { image_url: fileOrUrl }],
      }));
    } else if (fileOrUrl instanceof File) {
      const url = await uploadFile(fileOrUrl, FileType.BANNERS);
      if (url) {
        setItemForm((prev) => ({
          ...prev,
          images: [...(prev.images || []), { image_url: url }],
        }));
      }
    }
  };

  const handleRemoveImage = (imgIdx: number) => {
    setItemForm((prev) => ({
      ...prev,
      images: (prev.images || []).filter((_, idx) => idx !== imgIdx),
    }));
  };

  const handleDeleteItem = (periodIdx: number, itemIdx: number) =>
    runWithLoading(`item_${periodIdx}_${itemIdx}`, async () => {
      const nextTimeline = timeline.map((p, pIdx) => {
        if (pIdx !== periodIdx) return p;
        return {
          ...p,
          items: p.items.filter((_, iIdx) => iIdx !== itemIdx),
        };
      });
      setTimeline(nextTimeline);
      return onSaveSection?.(
        buildCompanyHistoryUpdatePayload(
          {
            heading,
            description,
            timeline: nextTimeline,
          },
          section,
        ),
      );
    });

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (targetPeriodIdx === null || !itemForm.year.trim() || !itemForm.title.trim()) return;

    return runWithLoading('save_item', async () => {
      const sanitizedItem: CompanyHistoryItem = {
        year: itemForm.year.trim(),
        title: itemForm.title.trim(),
        description: itemForm.description.trim(),
        images: itemForm.images || [],
      };

      const nextTimeline = timeline.map((p, pIdx) => {
        if (pIdx !== targetPeriodIdx) return p;
        const nextItems =
          editingItemIdx !== null
            ? p.items.map((item, iIdx) => (iIdx === editingItemIdx ? sanitizedItem : item))
            : [...p.items, sanitizedItem];
        return {
          ...p,
          items: nextItems,
        };
      });

      setTimeline(nextTimeline);
      await onSaveSection?.(
        buildCompanyHistoryUpdatePayload(
          {
            heading,
            description,
            timeline: nextTimeline,
          },
          section,
        ),
      );
      setIsItemOpen(false);
    });
  };

  const handleSaveAll = () =>
    runWithLoading('save_all', () =>
      onSaveSection?.(
        buildCompanyHistoryUpdatePayload(
          {
            heading,
            description,
            timeline,
          },
          section,
        ),
      ),
    );

  return (
    <div className='space-y-6'>
      {/* 1. Header Bar with Actions */}
      <SectionHeader
        title={section.name || tEnum('content.company_history')}
        icon={History}
        badgeText='company_history'
        onCreate={handleOpenAddPeriod}
        createLabel={tContent('company_history.add_period', '기간(연대) 추가')}
        createDisabled={isLoading}
        onSave={handleSaveAll}
        isSaving={isLoadingTarget('save_all')}
        saveDisabled={isLoading}
      />

      {/* 2. Section Heading & Description */}
      <SectionHeadingDescription
        heading={heading}
        onChangeHeading={setHeading}
        headingLabel={tContent('homepage.section_heading')}
        descriptionLabel={tContent('homepage.section_description')}
        headingType='textarea'
        description={description}
        onChangeDescription={setDescription}
        descriptionRows={2}
      />

      {/* 3. Timeline Periods & Items List */}
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <h4 className='text-foreground text-sm font-bold'>
            {tContent('company_history.timeline_title', '연혁 타임라인 (Timeline)')} ({timeline.length})
          </h4>
          <Button type='button' variant='outline' size='sm' onClick={handleOpenAddPeriod} className='h-7 gap-1 px-2.5 text-xs'>
            <Plus className='h-3.5 w-3.5' />
            {tContent('company_history.add_period', '기간(연대) 추가')}
          </Button>
        </div>

        {timeline.length === 0 ? (
          <div className='border-muted-foreground/20 flex flex-col items-center justify-center rounded-2xl border border-dashed py-12 text-center'>
            <History className='text-muted-foreground/40 mb-2 h-8 w-8' />
            <p className='text-muted-foreground text-xs'>{tContent('homepage.no_items')}</p>
            <Button type='button' variant='outline' size='sm' onClick={handleOpenAddPeriod} className='mt-3 h-8 text-xs'>
              {tContent('company_history.add_period', '기간(연대) 추가')}
            </Button>
          </div>
        ) : (
          <div className='space-y-6'>
            {timeline.map((period, periodIdx) => (
              <div key={period.period || periodIdx} className='bg-card space-y-4 rounded-2xl border p-5 shadow-2xs'>
                {/* Period Header */}
                <div className='flex items-center justify-between border-b pb-3'>
                  <div className='flex items-center gap-2.5'>
                    <div className='bg-primary/10 text-primary flex h-8 items-center justify-center rounded-lg px-2.5 font-mono text-sm font-bold'>
                      {period.period || period.title}
                    </div>
                    <Badge variant='outline' className='text-[10px]'>
                      {period.items.length} {tContent('company_history.items_count', '항목')}
                    </Badge>
                  </div>

                  <div className='flex items-center gap-1.5'>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={() => handleOpenAddItem(periodIdx)}
                      className='h-7 gap-1 px-2 text-xs'>
                      <Plus className='h-3 w-3' />
                      {tContent('company_history.add_item', '연도 항목 추가')}
                    </Button>
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={() => handleOpenEditPeriod(periodIdx)}
                      className='h-7 px-2 text-xs text-neutral-500 hover:text-blue-600'>
                      {tCommon('button.edit')}
                    </Button>
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={() => handleDeletePeriod(periodIdx)}
                      disabled={isLoadingTarget(`period_${periodIdx}`)}
                      className='text-destructive hover:text-destructive hover:bg-destructive/10 h-7 px-2 text-xs'>
                      {isLoadingTarget(`period_${periodIdx}`) ? (
                        <Loader2 className='h-3.5 w-3.5 animate-spin' />
                      ) : (
                        <Trash2 className='h-3.5 w-3.5' />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Period Items */}
                {period.items.length === 0 ? (
                  <div className='border-muted-foreground/20 flex flex-col items-center justify-center rounded-xl border border-dashed py-6 text-center'>
                    <Calendar className='text-muted-foreground/30 mb-1.5 h-6 w-6' />
                    <p className='text-muted-foreground text-xs'>
                      {tContent('company_history.no_items_in_period', '등록된 연도 항목이 없습니다.')}
                    </p>
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={() => handleOpenAddItem(periodIdx)}
                      className='mt-2 h-6 text-xs text-blue-600'>
                      {tContent('company_history.add_item', '연도 항목 추가')}
                    </Button>
                  </div>
                ) : (
                  <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                    {period.items.map((item, itemIdx) => (
                      <div
                        key={`${item.year}_${itemIdx}`}
                        onClick={() => handleOpenEditItem(periodIdx, itemIdx)}
                        className='group bg-muted/20 hover:border-primary/50 relative flex cursor-pointer flex-col justify-between rounded-xl border p-4 shadow-2xs transition-all hover:shadow-md'>
                        <div className='space-y-2'>
                          <div className='flex items-center justify-between'>
                            <span className='bg-background text-primary rounded-md border px-2 py-0.5 font-mono text-xs font-bold'>
                              {item.year}
                            </span>
                            <h5 className='text-foreground line-clamp-1 text-xs font-bold'>{item.title}</h5>
                          </div>

                          <p className='text-muted-foreground line-clamp-2 text-xs leading-relaxed'>{item.description || '-'}</p>

                          {/* Image preview thumbnails */}
                          {item.images && item.images.length > 0 && (
                            <div className='flex items-center gap-1.5 pt-1'>
                              {item.images.slice(0, 3).map((img, i) => (
                                <div key={i} className='bg-muted relative h-8 w-12 overflow-hidden rounded border'>
                                  <img src={img.image_url} alt='' className='h-full w-full object-cover' />
                                </div>
                              ))}
                              {item.images.length > 3 && (
                                <span className='text-muted-foreground text-[10px]'>+{item.images.length - 3}</span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className='mt-3 flex items-center justify-end border-t pt-2'>
                          <SectionCardActions
                            onEdit={() => handleOpenEditItem(periodIdx, itemIdx)}
                            onDelete={() => handleDeleteItem(periodIdx, itemIdx)}
                            isDeleting={isLoadingTarget(`item_${periodIdx}_${itemIdx}`)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Add / Edit Period Dialog */}
      <Dialog open={isPeriodOpen} onOpenChange={setIsPeriodOpen}>
        <DialogContent className='sm:max-w-xs'>
          <form onSubmit={handleSavePeriod}>
            <DialogHeader>
              <DialogTitle>
                {editingPeriodIdx !== null
                  ? tContent('company_history.edit_period', '기간(연대) 수정')
                  : tContent('company_history.add_period', '기간(연대) 추가')}
              </DialogTitle>
              <DialogDescription>
                {tContent('company_history.period_dialog_desc', '연대 구간을 입력하세요 (예: 2020s, 2010s).')}
              </DialogDescription>
            </DialogHeader>

            <div className='py-4'>
              <div className='space-y-1.5'>
                <label className='text-foreground text-xs font-semibold'>
                  {tContent('company_history.period_label', '기간(연대)')} <span className='text-destructive'>*</span>
                </label>
                <Input
                  value={periodInput}
                  onChange={(e) => setPeriodInput(e.target.value)}
                  placeholder='2020s, 2010s, 2000s...'
                  className='h-8 text-xs font-bold'
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type='button' variant='outline' size='sm' onClick={() => setIsPeriodOpen(false)}>
                {tCommon('button.cancel')}
              </Button>
              <Button type='submit' size='sm'>
                {tCommon('button.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 5. Add / Edit History Item Dialog */}
      <Dialog open={isItemOpen} onOpenChange={setIsItemOpen}>
        <DialogContent className='sm:max-w-lg'>
          <form onSubmit={handleSaveItem}>
            <DialogHeader>
              <DialogTitle>
                {editingItemIdx !== null
                  ? tContent('company_history.edit_item', '연도 항목 수정')
                  : tContent('company_history.add_item', '연도 항목 추가')}
              </DialogTitle>
              <DialogDescription>
                {tContent('company_history.item_dialog_desc', '연도, 타이틀, 설명 및 이미지를 입력하세요.')}
              </DialogDescription>
            </DialogHeader>

            <div className='space-y-4 py-4'>
              <div className='grid grid-cols-3 gap-3'>
                <div className='space-y-1.5'>
                  <label className='text-foreground text-xs font-semibold'>
                    {tContent('company_history.year_label', '연도 (Year)')} <span className='text-destructive'>*</span>
                  </label>
                  <Input
                    value={itemForm.year}
                    onChange={(e) => setItemForm((prev) => ({ ...prev, year: e.target.value }))}
                    placeholder='2020'
                    className='h-8 font-mono text-xs font-bold'
                    required
                  />
                </div>

                <div className='col-span-2 space-y-1.5'>
                  <label className='text-foreground text-xs font-semibold'>
                    {tContent('company_history.item_title', '타이틀 (Title)')} <span className='text-destructive'>*</span>
                  </label>
                  <Input
                    value={itemForm.title}
                    onChange={(e) => setItemForm((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder='New Decade, Brand Growth...'
                    className='h-8 text-xs'
                    required
                  />
                </div>
              </div>

              <div className='space-y-1.5'>
                <label className='text-foreground text-xs font-semibold'>
                  {tContent('company_history.item_desc', '설명 (Description)')}
                </label>
                <Textarea
                  value={itemForm.description}
                  onChange={(e) => setItemForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder='주요 실적 및 행사 내역을 입력하세요.'
                  rows={2}
                  className='resize-none text-xs leading-relaxed'
                />
              </div>

              {/* Images Gallery Management */}
              <div className='space-y-2 border-t pt-3'>
                <label className='text-foreground flex items-center gap-1.5 text-xs font-semibold'>
                  <ImageIcon className='h-3.5 w-3.5 text-blue-500' />
                  {tContent('company_history.item_images', '관련 이미지 (Images)')}
                </label>

                <div className='space-y-2'>
                  <AppUpload onChange={handleImageUpload} accept='image/*' />

                  {itemForm.images && itemForm.images.length > 0 && (
                    <div className='grid grid-cols-3 gap-2 pt-1'>
                      {itemForm.images.map((img, imgIdx) => (
                        <div key={imgIdx} className='bg-muted/40 group relative aspect-video overflow-hidden rounded-lg border'>
                          <img src={img.image_url} alt='' className='h-full w-full object-cover' />
                          <Button
                            type='button'
                            variant='destructive'
                            size='icon'
                            onClick={() => handleRemoveImage(imgIdx)}
                            className='absolute top-1 right-1 h-5 w-5 opacity-0 transition-opacity group-hover:opacity-100'>
                            <Trash2 className='h-3 w-3' />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type='button' variant='outline' size='sm' onClick={() => setIsItemOpen(false)}>
                {tCommon('button.cancel')}
              </Button>
              <Button type='submit' size='sm' disabled={isLoading}>
                {isLoadingTarget('save_item') && <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' />}
                {tCommon('button.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompanyHistoryEditor;
