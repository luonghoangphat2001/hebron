import { appToast } from '@/components/toast/AppToast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import AppUpload from '@/components/upload/AppUpload';
import { uploadFileAPI } from '@/data/file/file.api';
import type { UpdatePageSectionREQ } from '@/data/homepage-management/homepage.request';
import { buildClientLogosUpdatePayload } from '@/data/homepage-management/homepage.service';
import type { ClientLogoItem, ClientLogosContent, MallSection } from '@/data/homepage-management/homepage.type';
import { FileType } from '@/utils/enums/file.enum';
import { ExternalLink, ImageIcon, Layers, Loader2, Trash2 } from 'lucide-react';
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

export const ClientLogosEditor: React.FC<Props> = ({ section, onSaveSection }) => {
  const { t: tCommon } = useTranslation('common');
  const { t: tContent } = useTranslation('content');
  const { t: tEnum } = useTranslation('enum');

  const rawContent = (section.rawSection?.content || {}) as ClientLogosContent;
  const logos: ClientLogoItem[] = useMemo(() => rawContent.logos || [], [rawContent.logos]);
  const marquee = rawContent.marquee ?? true;
  const grayscale = rawContent.grayscale ?? true;

  const [isOpen, setIsOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { isLoading, isLoadingTarget, runWithLoading } = useSectionActionLoading<
    number | 'save_logo' | 'toggle_marquee' | 'toggle_grayscale'
  >();

  const [form, setForm] = useState<ClientLogoItem>({
    name: '',
    logo_url: '',
    link: '',
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

  const handleFileUpload = async (val?: string | File | (string | File)[]) => {
    if (!val) return;
    if (typeof val === 'string') {
      setForm((prev) => ({ ...prev, logo_url: val }));
    } else if (val instanceof File) {
      setIsUploading(true);
      const url = await uploadFile(val, FileType.BANNERS);
      setIsUploading(false);
      if (url) {
        setForm((prev) => ({ ...prev, logo_url: url }));
      }
    }
  };

  const handleOpenAdd = () => {
    setEditingIndex(null);
    setForm({ name: '', logo_url: '', link: '' });
    setIsOpen(true);
  };

  const handleOpenEdit = (index: number) => {
    setEditingIndex(index);
    setForm({ ...logos[index] });
    setIsOpen(true);
  };

  const handleDelete = (indexToDelete: number) =>
    runWithLoading(indexToDelete, () => {
      const nextLogos = logos.filter((_, idx) => idx !== indexToDelete);
      return onSaveSection?.(buildClientLogosUpdatePayload(nextLogos, marquee, grayscale, section.name, section));
    });

  const handleSaveLogo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.logo_url.trim()) return;

    return runWithLoading('save_logo', async () => {
      let nextLogos: ClientLogoItem[];
      if (editingIndex !== null) {
        nextLogos = logos.map((item, idx) => (idx === editingIndex ? { ...form } : item));
      } else {
        nextLogos = [...logos, { ...form }];
      }

      await onSaveSection?.(buildClientLogosUpdatePayload(nextLogos, marquee, grayscale, section.name, section));
      setIsOpen(false);
    });
  };

  return (
    <div className='space-y-6'>
      <SectionHeader
        title={section.name || tEnum('content.client_logos', '파트너사')}
        icon={Layers}
        badgeText={logos.length}
        onCreate={handleOpenAdd}
        createDisabled={isLoading}
      />

      {/* Grid of Logos */}
      {logos.length > 0 ? (
        <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
          {logos.map((logo, idx) => (
            <div
              key={idx}
              onClick={() => handleOpenEdit(idx)}
              className='group bg-card hover:border-primary/50 relative flex cursor-pointer flex-col items-center justify-between rounded-xl border p-4 shadow-2xs transition-all hover:shadow-xs'>
              <div className='relative flex h-16 w-full items-center justify-center overflow-hidden rounded-lg border bg-[#ebe9e9] p-2'>
                {logo.logo_url ? (
                  <img
                    src={logo.logo_url}
                    alt={logo.name}
                    className={`max-h-full max-w-full object-contain transition-all ${
                      grayscale ? 'contrast-125 grayscale group-hover:grayscale-0' : ''
                    }`}
                  />
                ) : (
                  <ImageIcon className='text-muted-foreground h-6 w-6' />
                )}
              </div>

              <div className='mt-3 w-full text-center'>
                <p className='text-foreground truncate text-xs font-bold'>{logo.name}</p>
                {logo.link && (
                  <a
                    href={logo.link}
                    target='_blank'
                    rel='noreferrer'
                    onClick={(e) => e.stopPropagation()}
                    className='text-muted-foreground hover:text-primary mt-0.5 inline-flex items-center gap-1 truncate font-mono text-[10px]'>
                    <span className='break-all'>{logo.link}</span>
                    <ExternalLink className='h-2.5 w-2.5 shrink-0' />
                  </a>
                )}
              </div>

              <SectionCardActions
                variant='ghost'
                positionClass='top-1.5 right-1.5'
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
          icon={Layers}
          message={tContent('homepage.no_items')}
          description={tContent('homepage.no_items_desc')}
          onAction={handleOpenAdd}
          actionDisabled={isLoading}
        />
      )}

      {/* Add / Edit Logo Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className='sm:max-w-md'>
          <form onSubmit={handleSaveLogo} className='space-y-4'>
            <DialogHeader>
              <DialogTitle className='text-base font-bold'>
                {editingIndex !== null ? tCommon('button.edit') : tCommon('button.create')}{' '}
                {tEnum('content.client_logos', '파트너사')}
              </DialogTitle>
              <DialogDescription className='text-xs'>{tContent('homepage.logo_modal_desc')}</DialogDescription>
            </DialogHeader>

            <div className='space-y-3.5 text-xs'>
              <div className='space-y-1.5'>
                <label className='font-semibold'>{tContent('homepage.partner_name')}</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder={tContent('homepage.partner_name_ph')}
                  className='h-8 text-xs'
                  required
                />
              </div>

              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <label className='font-semibold'>{tContent('homepage.logo_image')}</label>
                  {form.logo_url && (
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={() => setForm((prev) => ({ ...prev, logo_url: '' }))}
                      className='text-destructive hover:text-destructive h-6 gap-1 px-2 text-[10px]'>
                      <Trash2 className='h-3 w-3' /> {tContent('homepage.delete_image')}
                    </Button>
                  )}
                </div>

                <AppUpload
                  value={form.logo_url}
                  onChange={handleFileUpload}
                  type='image'
                  disabled={isUploading}
                  previewHeight='h-24 w-full'
                />

                <Input
                  value={form.logo_url}
                  onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
                  placeholder='https://...'
                  className='h-8 font-mono text-xs'
                  required
                />
              </div>

              <div className='space-y-1.5'>
                <label className='font-semibold'>{tContent('homepage.link_optional')}</label>
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
                {isLoadingTarget('save_logo') || isUploading ? <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' /> : null}
                {tCommon('button.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientLogosEditor;
