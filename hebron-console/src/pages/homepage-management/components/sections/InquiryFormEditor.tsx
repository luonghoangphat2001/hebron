import { ImageColumnPreview } from '@/components/dialog/ImagePreviewDialog';
import { appToast } from '@/components/toast/AppToast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import AppUpload from '@/components/upload/AppUpload';
import { uploadFileAPI } from '@/data/file/file.api';
import type { UpdatePageSectionREQ } from '@/data/homepage-management/homepage.request';
import { buildInquiryFormUpdatePayload, normalizeInquiryFormData } from '@/data/homepage-management/homepage.service';
import type { InquiryFormInput, InquiryProcessStep, MallSection } from '@/data/homepage-management/homepage.type';
import { FileType } from '@/utils/enums/file.enum';
import { CheckCircle2, FileQuestion, HelpCircle, ImageIcon, Plus, Trash2 } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSectionActionLoading } from '../../hooks/useSectionActionLoading';
import SectionHeader from '../ui/SectionHeader';
import SectionHeadingDescription from '../ui/SectionHeadingDescription';

type Props = {
  section?: MallSection;
  onSaveSection?: (payload?: Partial<UpdatePageSectionREQ>) => Promise<any> | void;
};

export const InquiryFormEditor: React.FC<Props> = ({ section, onSaveSection }) => {
  const { t: tContent } = useTranslation('content');
  const { t: tCommon } = useTranslation('common');

  const normalized = useMemo(() => normalizeInquiryFormData(section), [section]);

  const [heading, setHeading] = useState(normalized.heading ?? '문의 폼');
  const [subtitle, setSubtitle] = useState(normalized.subtitle ?? '제작 상담을 신청해 주세요.');
  const [description, setDescription] = useState(
    normalized.description ?? '기업 행사, 시상식, 포상식, 기념일에 필요한 트로피와 상패를 제작해 드립니다.',
  );
  const [imageUrl, setImageUrl] = useState(normalized.image_url ?? '');
  const processTitle = normalized.process_title ?? '제작 과정';
  const [processSteps, setProcessSteps] = useState<InquiryProcessStep[]>(normalized.process_steps);

  const [isStepDialogOpen, setIsStepDialogOpen] = useState(false);
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);
  const [stepForm, setStepForm] = useState<InquiryProcessStep>({
    key: '',
    title: '',
    description: '',
  });

  const { isLoading, isLoadingTarget, runWithLoading } = useSectionActionLoading<number | 'save_inquiry' | 'save_step'>();

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
      setImageUrl(fileOrUrl);
    } else if (fileOrUrl instanceof File) {
      const url = await uploadFile(fileOrUrl, FileType.BANNERS);
      if (url) {
        setImageUrl(url);
      }
    }
  };

  const handleOpenAddStep = () => {
    setEditingStepIndex(null);
    setStepForm({
      key: `step_${processSteps.length + 1}`,
      title: '',
      description: '',
    });
    setIsStepDialogOpen(true);
  };

  const handleOpenEditStep = (index: number) => {
    setEditingStepIndex(index);
    setStepForm({ ...processSteps[index] });
    setIsStepDialogOpen(true);
  };

  const handleDeleteStep = (indexToDelete: number) => {
    const nextSteps = processSteps.filter((_, idx) => idx !== indexToDelete);
    setProcessSteps(nextSteps);
    const updatedInput: InquiryFormInput = {
      heading,
      subtitle,
      description,
      image_url: imageUrl,
      process_title: processTitle,
      process_steps: nextSteps,
    };
    return runWithLoading(indexToDelete, () => onSaveSection?.(buildInquiryFormUpdatePayload(updatedInput, section)));
  };

  const handleSaveStepModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stepForm.title.trim()) {
      appToast.error(tContent('inquiry_form.step_title_required', '스텝 제목을 입력해주세요.'));
      return;
    }

    const newStepItem: InquiryProcessStep = {
      key: stepForm.key.trim() || `step_${Date.now()}`,
      title: stepForm.title.trim(),
      description: stepForm.description.trim(),
    };

    let nextSteps: InquiryProcessStep[];
    if (editingStepIndex !== null) {
      nextSteps = processSteps.map((item, idx) => (idx === editingStepIndex ? newStepItem : item));
    } else {
      nextSteps = [...processSteps, newStepItem];
    }
    setProcessSteps(nextSteps);
    setIsStepDialogOpen(false);

    const updatedInput: InquiryFormInput = {
      heading,
      subtitle,
      description,
      image_url: imageUrl,
      process_title: processTitle,
      process_steps: nextSteps,
    };
    return runWithLoading('save_step', () => onSaveSection?.(buildInquiryFormUpdatePayload(updatedInput, section)));
  };

  const handleSaveAll = () => {
    const updatedInput: InquiryFormInput = {
      heading,
      subtitle,
      description,
      image_url: imageUrl,
      process_title: processTitle,
      process_steps: processSteps,
    };
    return runWithLoading('save_inquiry', () => onSaveSection?.(buildInquiryFormUpdatePayload(updatedInput, section)));
  };

  return (
    <div className='space-y-6'>
      {/* Top Save Action */}
      <SectionHeader
        title={section?.name || tContent('inquiry_form.title', '문의 폼 & 제작 과정 (Inquiry Form & Steps)')}
        icon={HelpCircle}
        badgeText='inquiry_form'
        onSave={handleSaveAll}
        isSaving={isLoadingTarget('save_inquiry')}
        saveDisabled={isLoading}
      />

      {/* Section Heading, Subtitle & Description */}
      <SectionHeadingDescription
        heading={heading}
        onChangeHeading={setHeading}
        headingLabel={tContent('homepage.section_heading', '섹션 제목 (Title)')}
        descriptionLabel={tContent('homepage.section_description', '설명 문구 (Description)')}
        headingPlaceholder='문의 폼'
        description={description ?? ''}
        onChangeDescription={setDescription}
        descriptionPlaceholder='기업 행사, 시상식, 포상식, 기념일에 필요한 트로피와 상패를 제작해 드립니다.'
        descriptionRows={2}
      />

      <div className='bg-card space-y-4 rounded-xl border p-4 shadow-2xs'>
        <div className='space-y-1.5'>
          <label className='text-foreground text-xs font-semibold'>
            {tContent('inquiry_form.subtitle_label', '부제목 (Subtitle)')}
          </label>
          <Input
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder='제작 상담을 신청해 주세요.'
            className='h-8 text-xs'
          />
        </div>
      </div>

      {/* Guide / Visual Single Image Management */}
      <div className='bg-card space-y-4 rounded-xl border p-4 shadow-2xs'>
        <div className='flex items-center justify-between border-b pb-3'>
          <div className='flex items-center gap-2'>
            <ImageIcon className='text-primary h-4 w-4' />
            <h4 className='text-foreground text-xs font-bold'>
              {tContent('inquiry_form.primary_image', '안내 이미지 (Visual Image)')}
            </h4>
          </div>
          {imageUrl && (
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={() => setImageUrl('')}
              className='text-destructive hover:text-destructive h-6 gap-1 px-2 text-[10px]'>
              <Trash2 className='h-3 w-3' />
              {tContent('homepage.delete_image', '이미지 삭제')}
            </Button>
          )}
        </div>
        <div className='space-y-3'>
          <div className={imageUrl ? 'hidden' : 'block'}>
            <AppUpload value={imageUrl} onChange={handleImageUpload} accept='image/*' />
          </div>
          {imageUrl && (
            <div className='relative w-full overflow-hidden rounded-xl border-none'>
              <ImageColumnPreview
                src={imageUrl}
                alt='Inquiry Guide'
                className='h-96 w-full rounded-xl border-none sm:h-[480px]'
                previewLabel={tCommon('button.preview', '미리보기')}
              />
            </div>
          )}
        </div>
      </div>

      {/* Process Steps Management */}
      <div className='bg-card space-y-4 rounded-xl border p-4 shadow-2xs'>
        <div className='flex items-center justify-between border-b pb-3'>
          <div className='flex items-center gap-2.5'>
            <CheckCircle2 className='text-primary h-4 w-4' />
            <h4 className='text-foreground text-xs font-bold'>
              {tContent('inquiry_form.process_steps_title', '제작 과정 단계 (Process Steps)')}
            </h4>
            <Badge variant='outline' className='font-mono text-[10px]'>
              {processSteps.length} steps
            </Badge>
          </div>

          <Button size='sm' onClick={handleOpenAddStep} disabled={isLoading} className='h-7 gap-1 px-2.5 text-xs'>
            <Plus className='h-3.5 w-3.5' />
            {tContent('inquiry_form.add_step', '단계 추가')}
          </Button>
        </div>

        {processSteps.length === 0 ? (
          <div className='border-muted-foreground/20 flex flex-col items-center justify-center rounded-xl border border-dashed py-8 text-center'>
            <FileQuestion className='text-muted-foreground/40 mb-2 h-7 w-7' />
            <p className='text-muted-foreground text-xs'>{tContent('homepage.no_items')}</p>
            <Button type='button' variant='outline' size='sm' onClick={handleOpenAddStep} className='mt-3 h-7 text-xs'>
              {tContent('inquiry_form.add_step', '단계 추가')}
            </Button>
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
            {processSteps.map((step, idx) => (
              <div
                key={step.key || idx}
                onClick={() => handleOpenEditStep(idx)}
                className='group bg-muted/20 hover:bg-card hover:border-primary/50 relative flex cursor-pointer flex-col justify-between rounded-xl border p-3.5 shadow-2xs transition-all hover:shadow-xs'>
                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <Badge variant='secondary' className='font-mono text-[10px] font-bold'>
                      0{idx + 1}. {step.key}
                    </Badge>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteStep(idx);
                      }}
                      disabled={isLoading}
                      className='text-muted-foreground hover:text-destructive h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100'>
                      <Trash2 className='h-3 w-3' />
                    </Button>
                  </div>
                  <h5 className='text-foreground text-xs font-bold'>{step.title}</h5>
                  <p className='text-muted-foreground line-clamp-2 text-xs leading-relaxed'>{step.description || '-'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Process Step Dialog */}
      <Dialog open={isStepDialogOpen} onOpenChange={setIsStepDialogOpen}>
        <DialogContent className='sm:max-w-md'>
          <form onSubmit={handleSaveStepModal} className='space-y-4'>
            <DialogHeader>
              <DialogTitle className='text-sm font-bold'>
                {editingStepIndex !== null
                  ? tContent('inquiry_form.edit_step', '제작 단계 수정')
                  : tContent('inquiry_form.add_step', '제작 단계 추가')}
              </DialogTitle>
              <DialogDescription className='text-xs'>
                {tContent('inquiry_form.step_dialog_desc', '제작 과정 단계의 키, 제목 및 설명을 입력하세요.')}
              </DialogDescription>
            </DialogHeader>

            <div className='space-y-3 py-1'>
              <div className='grid grid-cols-3 gap-3'>
                <div className='space-y-1.5'>
                  <label className='text-foreground text-xs font-semibold'>
                    {tContent('inquiry_form.step_key_label', 'Step Key')} <span className='text-destructive'>*</span>
                  </label>
                  <Input
                    value={stepForm.key}
                    onChange={(e) => setStepForm((prev) => ({ ...prev, key: e.target.value }))}
                    placeholder='e.g. inquiry, design'
                    className='h-8 font-mono text-xs'
                    required
                  />
                </div>
                <div className='col-span-2 space-y-1.5'>
                  <label className='text-foreground text-xs font-semibold'>
                    {tContent('inquiry_form.step_title_label', '단계명 (Title)')} <span className='text-destructive'>*</span>
                  </label>
                  <Input
                    value={stepForm.title}
                    onChange={(e) => setStepForm((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder='주문접수, 디자인 제안...'
                    className='h-8 text-xs'
                    required
                  />
                </div>
              </div>

              <div className='space-y-1.5'>
                <label className='text-foreground text-xs font-semibold'>
                  {tContent('inquiry_form.step_desc_label', '단계 설명 (Description)')}
                </label>
                <Textarea
                  value={stepForm.description}
                  onChange={(e) => setStepForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder='해당 단계에 대한 상세 설명을 입력하세요.'
                  rows={3}
                  className='resize-none text-xs leading-relaxed'
                />
              </div>
            </div>

            <DialogFooter className='gap-2'>
              <Button type='button' variant='outline' size='sm' onClick={() => setIsStepDialogOpen(false)}>
                {tCommon('button.cancel')}
              </Button>
              <Button type='submit' size='sm' disabled={isLoadingTarget('save_step')}>
                {tCommon('button.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InquiryFormEditor;
