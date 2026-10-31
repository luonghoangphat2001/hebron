import { appToast } from '@/components/toast/AppToast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import AppUpload from '@/components/upload/AppUpload';
import { uploadFileAPI } from '@/data/file/file.api';
import type { UpdatePageSectionREQ } from '@/data/homepage-management/homepage.request';
import { buildCustomProcessUpdatePayload } from '@/data/homepage-management/homepage.service';
import type { CustomProcessContent, CustomProcessStep, MallSection } from '@/data/homepage-management/homepage.type';
import { FileType } from '@/utils/enums/file.enum';
import { GitFork, ImageIcon, Loader2, Trash2 } from 'lucide-react';
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

export const CustomProcessEditor: React.FC<Props> = ({ section, onSaveSection }) => {
  const { t: tCommon } = useTranslation('common');
  const { t: tContent } = useTranslation('content');
  const { t: tEnum } = useTranslation('enum');

  const rawContent = (section.rawSection?.content || {}) as CustomProcessContent;
  const steps: CustomProcessStep[] = useMemo(() => rawContent.steps || [], [rawContent.steps]);

  const [heading, setHeading] = useState(section.rawSection?.title || '트로피 맞춤제작과정');
  const [description, setDescription] = useState(
    section.rawSection?.description ||
      section.rawSection?.subtitle ||
      '정성 어린 손길과 검증된 공정으로,\n당신의 순간을 완성합니다',
  );
  const [layout] = useState(rawContent.layout || 'alternating');

  const [isOpen, setIsOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const { isLoading, isLoadingTarget, runWithLoading } = useSectionActionLoading<number | 'save_all' | 'save_step'>();

  const [form, setForm] = useState<CustomProcessStep>({
    key: '',
    number: '01',
    title: '',
    description: '',
    image_url: '',
    image_alt: '',
  });

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

  const handleImageUpload = async (val?: string | File | (string | File)[]) => {
    if (!val) return;
    const fileOrUrl = Array.isArray(val) ? val[0] : val;
    if (typeof fileOrUrl === 'string') {
      setForm((prev) => ({ ...prev, image_url: fileOrUrl }));
    } else if (fileOrUrl instanceof File) {
      setIsUploadingImage(true);
      const url = await uploadFile(fileOrUrl, FileType.BANNERS);
      setIsUploadingImage(false);
      if (url) {
        setForm((prev) => ({ ...prev, image_url: url }));
      }
    }
  };

  const handleOpenAdd = () => {
    setEditingIndex(null);
    const nextNum = String(steps.length + 1).padStart(2, '0');
    setForm({
      key: `step_${steps.length + 1}`,
      number: nextNum,
      title: '',
      description: '',
      image_url: '',
      image_alt: '',
    });
    setIsOpen(true);
  };

  const handleOpenEdit = (index: number) => {
    setEditingIndex(index);
    const target = steps[index];
    setForm({
      key: target.key || `step_${index + 1}`,
      number: target.number || String(index + 1).padStart(2, '0'),
      title: target.title,
      description: target.description || '',
      image_url: target.image_url || '',
      image_alt: target.image_alt || '',
    });
    setIsOpen(true);
  };

  const handleDelete = (indexToDelete: number) =>
    runWithLoading(indexToDelete, () => {
      const nextSteps = steps.filter((_, idx) => idx !== indexToDelete);
      return onSaveSection?.(buildCustomProcessUpdatePayload(nextSteps, heading, description, layout, section.name, section));
    });

  const handleSaveStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.image_url.trim()) return;

    return runWithLoading('save_step', async () => {
      let nextSteps: CustomProcessStep[];
      const sanitizedStep: CustomProcessStep = {
        key: form.key?.trim() || `step_${editingIndex !== null ? editingIndex + 1 : steps.length + 1}`,
        number: form.number?.trim() || String(editingIndex !== null ? editingIndex + 1 : steps.length + 1).padStart(2, '0'),
        title: form.title.trim(),
        description: form.description?.trim() || '',
        image_url: form.image_url.trim(),
        image_alt: form.image_alt?.trim() || '',
      };

      if (editingIndex !== null) {
        nextSteps = steps.map((item, idx) => (idx === editingIndex ? sanitizedStep : item));
      } else {
        nextSteps = [...steps, sanitizedStep];
      }

      await onSaveSection?.(buildCustomProcessUpdatePayload(nextSteps, heading, description, layout, section.name, section));
      setIsOpen(false);
    });
  };

  const handleSaveOverview = () => {
    return runWithLoading('save_all', () =>
      onSaveSection?.(buildCustomProcessUpdatePayload(steps, heading, description, layout, section.name, section)),
    );
  };

  return (
    <div className='space-y-6'>
      {/* Header bar */}
      <SectionHeader
        title={section.name || tEnum('content.custom_process', '트로피 맞춤제작과정')}
        icon={GitFork}
        badgeText={tContent('homepage.items_count_suffix', { count: steps.length })}
        onCreate={handleOpenAdd}
        createLabel={tContent('homepage.create_step')}
        createDisabled={isLoading}
        onSave={handleSaveOverview}
        isSaving={isLoadingTarget('save_all')}
        saveDisabled={isLoading}
      />

      {/* Section overview inputs */}
      <SectionHeadingDescription
        heading={heading}
        onChangeHeading={setHeading}
        description={description}
        onChangeDescription={setDescription}
        headingLabel={tContent('homepage.section_heading')}
        descriptionLabel={tContent('homepage.section_description')}
      />

      {/* Steps List */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {steps.map((step, idx) => (
          <div
            key={step.key || idx}
            onClick={() => handleOpenEdit(idx)}
            className='group bg-card hover:border-primary/50 relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border shadow-2xs transition-all hover:shadow-md'>
            <div className='bg-muted/40 relative aspect-16/10 w-full overflow-hidden'>
              {step.image_url ? (
                <img
                  src={step.image_url}
                  alt={step.image_alt || step.title}
                  className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
                />
              ) : (
                <div className='text-muted-foreground flex h-full w-full items-center justify-center'>
                  <ImageIcon className='h-8 w-8' />
                </div>
              )}

              <div className='bg-primary text-primary-foreground absolute top-2.5 left-2.5 flex h-6 w-6 items-center justify-center rounded-full font-mono text-xs font-bold shadow-xs'>
                {step.number || String(idx + 1).padStart(2, '0')}
              </div>

              {step.key && (
                <Badge className='absolute bottom-2.5 left-2.5 bg-black/70 font-mono text-[9px] text-white backdrop-blur-xs'>
                  {step.key}
                </Badge>
              )}

              <SectionCardActions
                onEdit={() => handleOpenEdit(idx)}
                onDelete={() => handleDelete(idx)}
                isDeleting={isLoadingTarget(idx)}
                disabled={isLoading}
              />
            </div>

            <div className='space-y-1.5 p-4'>
              <h5 className='text-foreground line-clamp-1 text-sm font-bold'>{step.title}</h5>
              {step.description && (
                <p className='text-muted-foreground line-clamp-2 text-xs leading-relaxed whitespace-pre-line'>
                  {step.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Step Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-xl'>
          <form onSubmit={handleSaveStep} className='space-y-4'>
            <DialogHeader>
              <DialogTitle className='text-base font-bold'>
                {editingIndex !== null ? tContent('homepage.edit_step') : tContent('homepage.create_step')}
              </DialogTitle>
              <DialogDescription className='text-xs'>{tContent('homepage.step_modal_desc')}</DialogDescription>
            </DialogHeader>

            <div className='space-y-3.5 text-xs'>
              <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
                <div className='space-y-1.5'>
                  <label className='font-semibold'>{tContent('homepage.step_number')}</label>
                  <Input
                    value={form.number}
                    onChange={(e) => setForm({ ...form, number: e.target.value })}
                    placeholder='01'
                    className='h-8 font-mono text-xs'
                    required
                  />
                </div>

                <div className='space-y-1.5'>
                  <label className='font-semibold'>{tContent('homepage.process_key')}</label>
                  <Input
                    value={form.key || ''}
                    onChange={(e) => setForm({ ...form, key: e.target.value })}
                    placeholder='sketch, 3d-design'
                    className='h-8 font-mono text-xs'
                    required
                  />
                </div>

                <div className='space-y-1.5'>
                  <label className='font-semibold'>{tContent('homepage.step_title')}</label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder='스케치, 3D 제품디자인'
                    className='h-8 text-xs'
                    required
                  />
                </div>
              </div>

              <div className='space-y-1.5'>
                <label className='font-semibold'>{tContent('homepage.step_desc')}</label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder='고객의 요구사항을 바탕으로...'
                  rows={3}
                  className='resize-none text-xs leading-relaxed'
                />
              </div>

              {/* Step Image Upload */}
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <label className='font-semibold'>{tContent('homepage.cover_image_label')}</label>
                  {form.image_url && (
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={() => setForm((prev) => ({ ...prev, image_url: '' }))}
                      className='text-destructive hover:text-destructive h-6 gap-1 px-2 text-[10px]'>
                      <Trash2 className='h-3 w-3' /> {tContent('homepage.delete_image')}
                    </Button>
                  )}
                </div>

                <AppUpload
                  value={form.image_url}
                  onChange={handleImageUpload}
                  type='image'
                  accept='image/png,image/jpeg,image/jpg,image/webp'
                  disabled={isUploadingImage}
                  previewHeight='h-24 w-full'
                />

                <Input
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder='https://...'
                  className='h-8 font-mono text-xs'
                  required
                />
              </div>

              <div className='space-y-1.5'>
                <label className='font-semibold'>Image Alt</label>
                <Input
                  value={form.image_alt || ''}
                  onChange={(e) => setForm({ ...form, image_alt: e.target.value })}
                  placeholder='맞춤 트로피 스케치 작업'
                  className='h-8 text-xs'
                />
              </div>
            </div>

            <DialogFooter className='gap-2 pt-2'>
              <Button type='button' variant='outline' size='sm' onClick={() => setIsOpen(false)}>
                {tCommon('button.cancel')}
              </Button>
              <Button type='submit' size='sm' disabled={isLoading || isUploadingImage}>
                {isLoadingTarget('save_step') || isUploadingImage ? (
                  <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' />
                ) : null}
                {tCommon('button.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomProcessEditor;
