import { appToast } from '@/components/toast/AppToast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import FormItem from '@/components/form/FormItem';
import AppSelect from '@/components/select/AppSelect';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import AppUpload from '@/components/upload/AppUpload';
import { uploadFileAPI } from '@/data/file/file.api';
import type { CategoryShortcutItemRESP } from '@/data/homepage-management/homepage.response';
import { ERROR_MESSAGE } from '@/utils/constants/error-message.constant';
import { FileType } from '@/utils/enums/file.enum';
import { ShortcutLinkType } from '@/utils/enums/homepage.enum';
import { Download, ExternalLink, ImageIcon, Link2, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSectionActionLoading } from '../../hooks/useSectionActionLoading';
import SectionCardActions from '../ui/SectionCardActions';
import SectionEmptyState from '../ui/SectionEmptyState';
import SectionHeader from '../ui/SectionHeader';

type Props = {
  items: CategoryShortcutItemRESP[];
  onSave: (items: CategoryShortcutItemRESP[]) => Promise<any> | void;
};

type UploadField = 'icon' | 'link';
type ShortcutForm = {
  label: string;
  type: ShortcutLinkType;
  link: string | File;
  icon: string | File;
};

const EMPTY_FORM: ShortcutForm = { label: '', type: ShortcutLinkType.NAVIGATE, link: '', icon: '' };

const uploadIfFile = async (val: string | File): Promise<string> => {
  if (typeof val === 'string') return val;
  const url = (await uploadFileAPI(val, FileType.PAGE_IMAGES))?.data?.file?.url;
  if (!url) throw new Error('Upload returned no url');
  return url;
};

const requiredError = (val: string | File) =>
  (typeof val === 'string' ? val.trim() : val) ? undefined : ERROR_MESSAGE.FIELD_REQUIRED;

const getFormErrors = (form: ShortcutForm) => ({
  label: requiredError(form.label),
  icon: requiredError(form.icon),
  link: requiredError(form.link),
});

export const CategoryShortcutItemsEditor: React.FC<Props> = ({ items, onSave }) => {
  const { t: tCommon } = useTranslation('common');
  const { t: tContent } = useTranslation('content');

  const [isOpen, setIsOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [form, setForm] = useState<ShortcutForm>(EMPTY_FORM);
  // errors show after the first submit, then follow the form as the user types
  const [submitted, setSubmitted] = useState(false);
  const errors: Partial<ReturnType<typeof getFormErrors>> = submitted ? getFormErrors(form) : {};
  const { isLoading, isLoadingTarget, runWithLoading } = useSectionActionLoading<number | 'save_item'>();

  const handlePick = (field: UploadField, val?: string | File | (string | File)[]) => {
    if (Array.isArray(val)) return;
    setForm((prev) => ({ ...prev, [field]: val ?? '' }));
  };

  const openForm = (index: number | null) => {
    const item = index === null ? null : items[index];
    setEditingIndex(index);
    setSubmitted(false);
    setForm({
      label: item?.label ?? '',
      type: item?.type ?? ShortcutLinkType.NAVIGATE,
      link: item?.link ?? '',
      icon: item?.icon ?? '',
    });
    setIsOpen(true);
  };

  const handleDelete = (index: number) => runWithLoading(index, () => onSave(items.filter((_, i) => i !== index)));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.values(getFormErrors(form)).some(Boolean)) return;

    return runWithLoading('save_item', async () => {
      let icon: string;
      let link: string;
      try {
        [icon, link] = await Promise.all([uploadIfFile(form.icon), uploadIfFile(form.link)]);
      } catch (err: any) {
        appToast.error(err?.response?.data?.message || tCommon('notify.fail_upload'));
        return;
      }

      const item: CategoryShortcutItemRESP = {
        // keep fields the form doesn't edit (sort_order, is_active, ...)
        ...(editingIndex === null ? {} : items[editingIndex]),
        label: form.label.trim(),
        type: form.type,
        link: link.trim(),
        icon: icon || null,
      };
      const nextItems = editingIndex === null ? [...items, item] : items.map((it, i) => (i === editingIndex ? item : it));

      await onSave(nextItems);
      setIsOpen(false);
    });
  };

  return (
    <div className='space-y-4'>
      <SectionHeader
        title={tContent('homepage.shortcut_items_count', { count: items.length })}
        icon={Link2}
        onCreate={() => openForm(null)}
        createLabel={tContent('homepage.add_shortcut_item')}
        createDisabled={isLoading}
      />

      {items.length > 0 ? (
        <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'>
          {items.map((item, idx) => (
            <div
              key={idx}
              onClick={() => openForm(idx)}
              className='group bg-card hover:border-primary/40 relative flex cursor-pointer flex-col items-center rounded-xl border p-3 text-center shadow-2xs transition-all duration-200 hover:shadow-xs'>
              <div className='bg-muted/50 mb-2 flex h-20 w-full items-center justify-center overflow-hidden rounded-lg border p-3'>
                {item.icon ? (
                  <img src={item.icon} alt={item.label} className='max-h-full max-w-full object-contain' />
                ) : (
                  <ImageIcon className='text-muted-foreground h-6 w-6' />
                )}
              </div>

              <p className='text-foreground line-clamp-1 text-xs font-bold'>{item.label}</p>
              {item.link && (
                <span className='text-muted-foreground mt-0.5 inline-flex max-w-full items-center gap-1 font-mono text-[9px]'>
                  {item.type === ShortcutLinkType.DOWNLOAD ? (
                    <Download className='h-2.5 w-2.5 shrink-0' />
                  ) : (
                    <ExternalLink className='h-2.5 w-2.5 shrink-0' />
                  )}
                  <span className='truncate'>{item.link}</span>
                </span>
              )}

              <SectionCardActions
                variant='ghost'
                positionClass='top-1.5 right-1.5'
                onEdit={() => openForm(idx)}
                onDelete={() => handleDelete(idx)}
                isDeleting={isLoadingTarget(idx)}
                disabled={isLoading}
              />
            </div>
          ))}
        </div>
      ) : (
        <SectionEmptyState
          icon={Link2}
          message={tContent('homepage.no_items')}
          description={tContent('homepage.no_items_desc')}
          actionLabel={tContent('homepage.add_shortcut_item')}
          actionDisabled={isLoading}
        />
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-xl' aria-describedby={undefined}>
          <form onSubmit={handleSubmit} noValidate className='min-w-0 space-y-5'>
            <DialogHeader>
              <DialogTitle className='text-base font-bold'>
                {editingIndex !== null ? tCommon('button.edit') : tCommon('button.create')}
              </DialogTitle>
            </DialogHeader>

            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='sm:col-span-2'>
                <FormItem label={tContent('homepage.field_label')} error={errors.label} required>
                  <Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} required />
                </FormItem>
              </div>

              <div className='sm:col-span-2'>
                <FormItem label={tContent('homepage.field_link_type')} required>
                  <AppSelect
                    options={Object.values(ShortcutLinkType).map((value) => ({
                      value,
                      label: tContent(`homepage.link_type.${value}`),
                    }))}
                    value={form.type}
                    // the old link means nothing under the other type (path vs file url)
                    onChange={(type) => type && type !== form.type && setForm({ ...form, type, link: '' })}
                    clearable={false}
                  />
                </FormItem>
              </div>

              <div className='sm:col-span-2'>
                {form.type === ShortcutLinkType.DOWNLOAD ? (
                  <FormItem label={tContent('homepage.field_download_file')} error={errors.link} required>
                    <div className='space-y-2'>
                      <AppUpload
                        value={form.link || undefined}
                        onChange={(val) => handlePick('link', val)}
                        type='file'
                        disabled={isLoading}
                      />
                      {typeof form.link === 'string' && (
                        <Input
                          value={form.link}
                          onChange={(e) => setForm({ ...form, link: e.target.value })}
                          placeholder='https://...'
                          className='font-mono'
                          required
                        />
                      )}
                    </div>
                  </FormItem>
                ) : (
                  <FormItem label={tContent('homepage.field_link')} error={errors.link} required>
                    <InputGroup>
                      <InputGroupAddon>
                        <Link2 />
                      </InputGroupAddon>
                      <InputGroupInput
                        value={typeof form.link === 'string' ? form.link : ''}
                        onChange={(e) => setForm({ ...form, link: e.target.value })}
                        className='font-mono'
                        required
                      />
                    </InputGroup>
                  </FormItem>
                )}
              </div>
            </div>

            <div className='space-y-4 border-t pt-5'>
              <FormItem label={tContent('homepage.field_icon')} error={errors.icon} required>
                <div className='flex items-start gap-3'>
                  <AppUpload
                    value={form.icon || undefined}
                    onChange={(val) => handlePick('icon', val)}
                    type='image'
                    disabled={isLoading}
                    className='shrink-0'
                    previewHeight='size-24'
                  />
                  {typeof form.icon === 'string' && (
                    <Input
                      value={form.icon}
                      onChange={(e) => setForm({ ...form, icon: e.target.value })}
                      placeholder='https://...'
                      className='font-mono'
                      required
                    />
                  )}
                </div>
              </FormItem>
            </div>

            <DialogFooter className='border-t pt-4'>
              <Button type='button' variant='outline' onClick={() => setIsOpen(false)}>
                {tCommon('button.cancel')}
              </Button>
              <Button type='submit' disabled={isLoading}>
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

export default CategoryShortcutItemsEditor;
