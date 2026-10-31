import { appToast } from '@/components/toast/AppToast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import AppUpload from '@/components/upload/AppUpload';
import { uploadFileAPI } from '@/data/file/file.api';
import type { UpdatePageSectionREQ } from '@/data/homepage-management/homepage.request';
import { buildSecondaryBannerUpdatePayload } from '@/data/homepage-management/homepage.service';
import type { MallSection, SecondaryBannerItem } from '@/data/homepage-management/homepage.type';
import { FileType } from '@/utils/enums/file.enum';
import { ExternalLink, ImageIcon, Loader2, Trash2 } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSectionActionLoading } from '../../hooks/useSectionActionLoading';
import SectionCardActions from '../ui/SectionCardActions';
import SectionEmptyState from '../ui/SectionEmptyState';
import SectionHeader from '../ui/SectionHeader';

type Props = {
  section: MallSection;
  onSaveSection?: (payload?: Partial<UpdatePageSectionREQ>) => Promise<any> | void;
};

export const SecondaryBannerEditor: React.FC<Props> = ({ section, onSaveSection }) => {
  const { t: tCommon } = useTranslation('common');
  const { t: tContent } = useTranslation('content');
  const { t: tEnum } = useTranslation('enum');

  const items: SecondaryBannerItem[] = useMemo(() => {
    const raw = (section.rawSection?.content || {}) as any;
    if (Array.isArray(raw)) return raw;
    return Array.isArray(raw.items) ? (raw.items as SecondaryBannerItem[]) : [];
  }, [section.rawSection?.content]);

  const [isOpen, setIsOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { isLoading, isLoadingTarget, runWithLoading } = useSectionActionLoading<number | 'save_banner'>();

  const [form, setForm] = useState<SecondaryBannerItem>({
    name: '',
    image: '',
    link: '',
  });

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const resp = await uploadFileAPI(file, FileType.BANNERS);
      const url = resp?.data?.file?.url;
      appToast.success(tCommon('notify.success_upload') || 'Uploaded successfully');
      return url;
    } catch (err: any) {
      appToast.error(err?.response?.data?.message || tCommon('notify.fail_upload'));
      return null;
    }
  };

  const handleFileUpload = async (val?: string | File | (string | File)[]) => {
    if (!val) return;
    if (typeof val === 'string') {
      setForm((prev) => ({ ...prev, image: val }));
    } else if (val instanceof File) {
      setIsUploading(true);
      const url = await uploadFile(val);
      setIsUploading(false);
      if (url) {
        setForm((prev) => ({ ...prev, image: url }));
      }
    }
  };

  const isMaxReached = items.length >= 2;

  const handleOpenAdd = () => {
    if (isMaxReached) return;
    setEditingIndex(null);
    setForm({ name: '', image: '', link: '' });
    setIsOpen(true);
  };

  const handleOpenEdit = (index: number) => {
    setEditingIndex(index);
    setForm({ ...items[index] });
    setIsOpen(true);
  };

  const handleDelete = (indexToDelete: number) =>
    runWithLoading(indexToDelete, () => {
      const nextItems = items.filter((_, idx) => idx !== indexToDelete);
      return onSaveSection?.(buildSecondaryBannerUpdatePayload(nextItems, section.enabled, section));
    });

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.image.trim()) return;

    return runWithLoading('save_banner', async () => {
      if (editingIndex === null && isMaxReached) return;

      const nextItems =
        editingIndex !== null ? items.map((item, idx) => (idx === editingIndex ? { ...form } : item)) : [...items, { ...form }];

      await onSaveSection?.(buildSecondaryBannerUpdatePayload(nextItems, section.enabled, section));
      setIsOpen(false);
    });
  };

  return (
    <div className='space-y-6'>
      <SectionHeader
        title={section.name || tEnum('secondary_banner', 'Secondary Banner')}
        icon={ImageIcon}
        badgeText={`${items.length} / 2`}
        onCreate={handleOpenAdd}
        createDisabled={isLoading || isMaxReached}
      />

      {/* Grid of Banners */}
      {items.length > 0 ? (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          {items.map((item, idx) => (
            <div
              key={idx}
              onClick={() => handleOpenEdit(idx)}
              className='group bg-card hover:border-primary/50 relative flex cursor-pointer flex-col overflow-hidden rounded-xl border p-3.5 shadow-2xs transition-all hover:shadow-xs'>
              {/* Banner Image Preview */}
              <div className='bg-muted/20 relative aspect-[16/5] w-full overflow-hidden rounded-lg border'>
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
                  />
                ) : (
                  <div className='flex h-full w-full items-center justify-center'>
                    <ImageIcon className='text-muted-foreground h-8 w-8' />
                  </div>
                )}
              </div>

              {/* Banner Details */}
              <div className='mt-3 flex items-center justify-between gap-2'>
                <div className='min-w-0 flex-1'>
                  <p className='text-foreground truncate text-xs font-bold'>{item.name}</p>
                  {item.link ? (
                    <a
                      href={item.link}
                      target='_blank'
                      rel='noreferrer'
                      onClick={(e) => e.stopPropagation()}
                      className='text-muted-foreground hover:text-primary mt-0.5 inline-flex items-center gap-1 truncate font-mono text-[10px]'>
                      <span className='break-all'>{item.link}</span>
                      <ExternalLink className='h-2.5 w-2.5 shrink-0' />
                    </a>
                  ) : (
                    <span className='text-muted-foreground/60 text-[10px]'>No link</span>
                  )}
                </div>
              </div>

              <SectionCardActions
                variant='ghost'
                positionClass='top-2 right-2'
                onEdit={() => handleOpenEdit(idx)}
                onDelete={() => handleDelete(idx)}
                isDeleting={isLoadingTarget(idx)}
                disabled={isLoading}
              />
            </div>
          ))}
        </div>
      ) : (
        <SectionEmptyState
          icon={ImageIcon}
          message={tContent('homepage.no_items', 'No banner items')}
          description={tContent('homepage.no_items_desc', 'Please add banner items to display.')}
          onAction={handleOpenAdd}
          actionDisabled={isLoading || isMaxReached}
        />
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className='sm:max-w-md'>
          <form onSubmit={handleSaveBanner} className='space-y-4'>
            <DialogHeader>
              <DialogTitle className='text-base font-bold'>
                {editingIndex !== null ? tCommon('button.edit') : tCommon('button.create')}{' '}
                {tEnum('secondary_banner', 'Secondary Banner')}
              </DialogTitle>
              <DialogDescription className='text-xs'>
                {tContent('homepage.banner_modal_desc', 'Configure secondary banner image, title and destination link.')}
              </DialogDescription>
            </DialogHeader>

            <div className='space-y-3.5 text-xs'>
              <div className='space-y-1.5'>
                <label className='font-semibold'>{tContent('homepage.banner_name', 'Banner Name')}</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder='Secondary Banner 01'
                  className='h-8 text-xs'
                  required
                />
              </div>

              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <label className='font-semibold'>{tContent('homepage.banner_image', 'Banner Image')}</label>
                  {form.image && (
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={() => setForm((prev) => ({ ...prev, image: '' }))}
                      className='text-destructive hover:text-destructive h-6 gap-1 px-2 text-[10px]'>
                      <Trash2 className='h-3 w-3' /> {tContent('homepage.delete_image')}
                    </Button>
                  )}
                </div>

                <AppUpload
                  value={form.image}
                  onChange={handleFileUpload}
                  type='image'
                  disabled={isUploading}
                  previewHeight='h-24 w-full'
                />

                <Input
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder='https://...'
                  className='h-8 font-mono text-xs'
                  required
                />
              </div>

              <div className='space-y-1.5'>
                <label className='font-semibold'>{tContent('homepage.link_optional', 'Link (Optional)')}</label>
                <Input
                  value={form.link || ''}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  placeholder='https://...'
                  className='h-8 font-mono text-xs'
                />
              </div>
            </div>

            <DialogFooter className='gap-2 pt-2'>
              <Button type='button' variant='outline' size='sm' onClick={() => setIsOpen(false)}>
                {tCommon('button.cancel')}
              </Button>
              <Button type='submit' size='sm' disabled={isLoading || isUploading}>
                {isLoadingTarget('save_banner') || isUploading ? <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' /> : null}
                {tCommon('button.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SecondaryBannerEditor;
