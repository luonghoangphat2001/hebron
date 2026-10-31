import { appToast } from '@/components/toast/AppToast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import AppUpload from '@/components/upload/AppUpload';
import { uploadFileAPI } from '@/data/file/file.api';
import type { UpdatePageSectionREQ } from '@/data/homepage-management/homepage.request';
import {
  buildManufacturingProcessUpdatePayload,
  normalizeManufacturingProcessData,
} from '@/data/homepage-management/homepage.service';
import type { MallSection, ManufacturingProcessItem } from '@/data/homepage-management/homepage.type';
import { FileType } from '@/utils/enums/file.enum';
import { Film, ImageIcon, Loader2, PlayCircle, Plus, Trash2, Video } from 'lucide-react';
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

const INITIAL_PROCESS_FORM: ManufacturingProcessItem = {
  key: '',
  title: '',
  subtitle: '',
  description: '',
  image_url: '',
  video_url: '',
  media_type: 'image',
};

export const ManufacturingProcessEditor: React.FC<Props> = ({ section, onSaveSection }) => {
  const { t: tCommon } = useTranslation('common');
  const { t: tContent } = useTranslation('content');
  const { t: tEnum } = useTranslation('enum');

  const normalized = useMemo(() => normalizeManufacturingProcessData(section), [section]);

  const [heading, setHeading] = useState(normalized.heading);
  const [description, setDescription] = useState(normalized.description);
  const [items, setItems] = useState<ManufacturingProcessItem[]>(normalized.items);

  const [isOpen, setIsOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const { isLoading, isLoadingTarget, runWithLoading } = useSectionActionLoading<number | 'save_all' | 'save_item'>();

  const [form, setForm] = useState<ManufacturingProcessItem>(INITIAL_PROCESS_FORM);

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
      return;
    }
    if (fileOrUrl instanceof File) {
      setIsUploadingImage(true);
      const url = await uploadFile(fileOrUrl, FileType.BANNERS);
      setIsUploadingImage(false);
      if (url) {
        setForm((prev) => ({ ...prev, image_url: url }));
      }
    }
  };

  const handleVideoUpload = async (val?: string | File | (string | File)[]) => {
    if (!val) return;
    const fileOrUrl = Array.isArray(val) ? val[0] : val;
    if (typeof fileOrUrl === 'string') {
      setForm((prev) => ({ ...prev, video_url: fileOrUrl, media_type: 'video' }));
      return;
    }
    if (fileOrUrl instanceof File) {
      setIsUploadingVideo(true);
      const url = await uploadFile(fileOrUrl, FileType.PAGE_VIDEO);
      setIsUploadingVideo(false);
      if (url) {
        setForm((prev) => ({ ...prev, video_url: url, media_type: 'video' }));
      }
    }
  };

  const handleOpenAdd = () => {
    setEditingIndex(null);
    setForm({
      ...INITIAL_PROCESS_FORM,
      key: `공정 ${items.length + 1}`,
    });
    setIsOpen(true);
  };

  const handleOpenEdit = (index: number) => {
    const target = items[index];
    if (!target) return;
    setEditingIndex(index);
    setForm({
      key: target.key ?? '',
      title: target.title ?? '',
      subtitle: target.subtitle ?? '',
      description: target.description ?? '',
      image_url: target.image_url ?? target.image ?? '',
      video_url: target.video_url ?? '',
      media_type: target.media_type ?? (target.video_url ? 'video' : 'image'),
    });
    setIsOpen(true);
  };

  const handleDelete = (indexToDelete: number) =>
    runWithLoading(indexToDelete, () => {
      const nextItems = items.filter((_, idx) => idx !== indexToDelete);
      setItems(nextItems);
      return onSaveSection?.(
        buildManufacturingProcessUpdatePayload(nextItems, description, heading, section.rawSection?.subtitle, section),
      );
    });

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = form.title.trim();
    const imageUrl = form.image_url?.trim() ?? '';
    if (!title || !imageUrl) return;

    return runWithLoading('save_item', async () => {
      const sanitizedItem: ManufacturingProcessItem = {
        key: form.key?.trim() || title || `process_${editingIndex !== null ? editingIndex + 1 : items.length + 1}`,
        title,
        subtitle: form.subtitle?.trim() ?? '',
        description: form.description?.trim() ?? '',
        image_url: imageUrl,
        video_url: form.video_url?.trim() || null,
        media_type: form.video_url?.trim() ? 'video' : form.media_type || 'image',
      };

      const nextItems =
        editingIndex !== null
          ? items.map((item, idx) => (idx === editingIndex ? sanitizedItem : item))
          : [...items, sanitizedItem];

      setItems(nextItems);
      await onSaveSection?.(
        buildManufacturingProcessUpdatePayload(nextItems, description, heading, section.rawSection?.subtitle, section),
      );
      setIsOpen(false);
    });
  };

  const handleSaveOverview = () => {
    return runWithLoading('save_all', () =>
      onSaveSection?.(buildManufacturingProcessUpdatePayload(items, description, heading, section.rawSection?.subtitle, section)),
    );
  };

  return (
    <div className='space-y-6'>
      {/* Header bar */}
      <SectionHeader
        title={section.name || tEnum('content.manufacturing_process', '제조공정')}
        icon={Film}
        badgeText={tContent('homepage.items_count_suffix', { count: items.length })}
        onCreate={handleOpenAdd}
        createLabel={tContent('homepage.create_process', '공정 단계 추가')}
        createDisabled={isLoading}
        onSave={handleSaveOverview}
        isSaving={isLoadingTarget('save_all')}
        saveDisabled={isLoading}
      />

      {/* Section Overview: Heading & Description */}
      <SectionHeadingDescription
        heading={heading}
        onChangeHeading={setHeading}
        headingLabel={tContent('homepage.section_heading', '섹션 제목 (Heading)')}
        descriptionLabel={tContent('homepage.section_description', '섹션 설명 (Description)')}
        headingPlaceholder='제조공정'
        description={description}
        onChangeDescription={setDescription}
        descriptionPlaceholder='최고의 품질을 완성하는 헤브론의 제조 과정을 소개합니다.'
        descriptionRows={2}
      />

      {/* Process Steps List */}
      <div className='bg-card space-y-4 rounded-xl border p-4 shadow-2xs'>
        <div className='flex items-center justify-between border-b pb-3'>
          <div className='flex items-center gap-2'>
            <Film className='text-primary h-4 w-4' />
            <h4 className='text-foreground text-xs font-bold'>
              {tContent('homepage.process_steps_list', '공정 단계 목록 (Process Steps & Items)')}
            </h4>
            <Badge variant='outline' className='font-mono text-[10px]'>
              {items.length} steps
            </Badge>
          </div>
          <Button type='button' variant='outline' size='sm' onClick={handleOpenAdd} className='h-7 gap-1 text-xs'>
            <Plus className='h-3.5 w-3.5' />
            {tContent('homepage.create_process', '공정 단계 추가')}
          </Button>
        </div>

        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {items.map((item, idx) => {
            const displayImage = item.image_url || item.image;
            const hasVideo = Boolean(item.video_url || item.media_type === 'video');

            return (
              <div
                key={item.key || idx}
                onClick={() => handleOpenEdit(idx)}
                className='group bg-card hover:border-primary/50 relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border shadow-2xs transition-all hover:shadow-md'>
                <div className='bg-muted/40 relative aspect-16/10 w-full overflow-hidden'>
                  {displayImage ? (
                    <img
                      src={displayImage}
                      alt={item.title}
                      className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
                    />
                  ) : (
                    <div className='text-muted-foreground flex h-full w-full items-center justify-center'>
                      <ImageIcon className='h-8 w-8' />
                    </div>
                  )}

                  {hasVideo && (
                    <div className='pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20'>
                      <div className='flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-slate-900 shadow-md backdrop-blur-xs transition-transform group-hover:scale-110'>
                        <PlayCircle className='h-5 w-5' />
                      </div>
                    </div>
                  )}

                  <div className='absolute top-2.5 left-2.5 flex items-center gap-1.5'>
                    <Badge className='bg-primary/90 text-primary-foreground font-mono text-[9px] font-bold shadow-xs'>
                      Step {String(idx + 1).padStart(2, '0')}
                    </Badge>
                    {item.key && (
                      <Badge className='bg-black/70 font-sans text-[9px] text-white backdrop-blur-xs'>{item.key}</Badge>
                    )}
                  </div>

                  <SectionCardActions
                    onEdit={() => handleOpenEdit(idx)}
                    onDelete={() => handleDelete(idx)}
                    isDeleting={isLoadingTarget(idx)}
                    disabled={isLoading}
                  />
                </div>

                <div className='space-y-1 p-4'>
                  <div className='flex items-center justify-between gap-2'>
                    <div className='flex items-center gap-1.5 overflow-hidden'>
                      <span className='text-muted-foreground font-mono text-xs font-semibold'>
                        #{String(idx + 1).padStart(2, '0')}
                      </span>
                      <h5 className='text-foreground line-clamp-1 text-sm font-bold'>{item.title}</h5>
                    </div>
                    <Badge variant='outline' className='font-mono text-[9px] uppercase'>
                      {item.media_type || (hasVideo ? 'video' : 'image')}
                    </Badge>
                  </div>
                  {item.subtitle && <p className='text-primary line-clamp-1 text-[11px] font-medium'>{item.subtitle}</p>}
                  {item.description && <p className='text-muted-foreground line-clamp-2 text-xs'>{item.description}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add / Edit Process Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-xl'>
          <form onSubmit={handleSaveItem} className='space-y-4'>
            <DialogHeader>
              <div className='flex items-center gap-2'>
                <DialogTitle className='text-base font-bold'>
                  {editingIndex !== null
                    ? tContent('homepage.edit_process', '공정 단계 수정')
                    : tContent('homepage.create_process', '공정 단계 추가')}
                </DialogTitle>
                <Badge variant='secondary' className='font-mono text-[10px] font-semibold'>
                  Step {String((editingIndex !== null ? editingIndex : items.length) + 1).padStart(2, '0')}
                </Badge>
              </div>
              <DialogDescription className='text-xs'>
                {tContent('homepage.process_modal_desc', '공정 서클 명칭, 상세 타이틀, 설명 및 이미지를 입력하세요.')}
              </DialogDescription>
            </DialogHeader>

            <div className='space-y-3.5 text-xs'>
              <div className='grid grid-cols-1 gap-3 sm:grid-cols-4'>
                <div className='space-y-1.5 sm:col-span-1'>
                  <label className='font-semibold'>{tContent('homepage.step_order', '순서 (Step)')}</label>
                  <Input
                    value={`Step ${String((editingIndex !== null ? editingIndex : items.length) + 1).padStart(2, '0')}`}
                    disabled
                    className='bg-muted h-8 text-center font-mono text-xs font-bold'
                  />
                </div>
                <div className='space-y-1.5 sm:col-span-3'>
                  <label className='font-semibold'>
                    {tContent('homepage.step_circle_name', '단계명 / 서클 명칭 (Step Circle Name / Key)')}
                  </label>
                  <Input
                    value={form.key}
                    onChange={(e) => setForm((prev) => ({ ...prev, key: e.target.value }))}
                    placeholder='아이디어 도출, 원재료 선정, 리서치'
                    className='h-8 text-xs font-medium'
                    required
                  />
                </div>
              </div>

              <div className='space-y-1.5'>
                <label className='font-semibold'>{tContent('homepage.process_title', '상세 제목 (Title)')}</label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder='원재료 선정, 2D sketch'
                  className='h-8 text-xs'
                  required
                />
              </div>

              <div className='space-y-1.5'>
                <label className='font-semibold'>{tContent('homepage.process_desc', '설명 (Description)')}</label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder='제품에 적합한 고품질 소재를 엄선합니다.'
                  rows={2}
                  className='resize-none text-xs'
                />
              </div>

              {/* Image Upload */}
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <label className='font-semibold'>{tContent('homepage.cover_image_label', '대표 이미지')}</label>
                  {form.image_url && (
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={() => setForm((prev) => ({ ...prev, image_url: '' }))}
                      className='text-destructive hover:text-destructive h-6 gap-1 px-2 text-[10px]'>
                      <Trash2 className='h-3 w-3' /> {tContent('homepage.delete_image', '이미지 삭제')}
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
                  onChange={(e) => setForm((prev) => ({ ...prev, image_url: e.target.value }))}
                  placeholder='https://...'
                  className='h-8 font-mono text-xs'
                  required
                />
              </div>

              {/* Video Upload & URL Input */}
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <label className='flex items-center gap-1.5 font-semibold'>
                    <Video className='text-primary h-3.5 w-3.5' /> {tContent('homepage.video_file_or_url', '비디오 파일 / URL')}
                  </label>
                  {form.video_url && (
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={() => setForm((prev) => ({ ...prev, video_url: '', media_type: 'image' }))}
                      className='text-destructive hover:text-destructive h-6 gap-1 px-2 text-[10px]'>
                      <Trash2 className='h-3 w-3' /> {tContent('homepage.delete_image', '비디오 삭제')}
                    </Button>
                  )}
                </div>

                <AppUpload
                  value={form.video_url || ''}
                  onChange={handleVideoUpload}
                  type='file'
                  accept='video/mp4,video/webm,video/ogg,video/*'
                  disabled={isUploadingVideo}
                  previewHeight='h-20 w-full'
                />

                <Input
                  value={form.video_url || ''}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      video_url: e.target.value,
                      media_type: e.target.value.trim() ? 'video' : 'image',
                    }))
                  }
                  placeholder='https://... (MP4, WebM)'
                  className='h-8 font-mono text-xs'
                />
              </div>
            </div>

            <DialogFooter className='gap-2 pt-2'>
              <Button type='button' variant='outline' size='sm' onClick={() => setIsOpen(false)}>
                {tCommon('button.cancel', '취소')}
              </Button>
              <Button type='submit' size='sm' disabled={isLoading || isUploadingImage || isUploadingVideo}>
                {isLoadingTarget('save_item') || isUploadingImage || isUploadingVideo ? (
                  <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' />
                ) : null}
                {tCommon('button.save', '저장')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManufacturingProcessEditor;
