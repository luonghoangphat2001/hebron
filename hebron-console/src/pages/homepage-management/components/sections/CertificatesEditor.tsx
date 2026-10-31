import { ImageColumnPreview } from '@/components/dialog/ImagePreviewDialog';
import { appToast } from '@/components/toast/AppToast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppUpload from '@/components/upload/AppUpload';
import { uploadFileAPI } from '@/data/file/file.api';
import type { UpdatePageSectionREQ } from '@/data/homepage-management/homepage.request';
import { buildCertificatesUpdatePayload, normalizeCertificatesData } from '@/data/homepage-management/homepage.service';
import type { CompanyInfoItem, MallSection } from '@/data/homepage-management/homepage.type';
import { FileType } from '@/utils/enums/file.enum';
import { Building2, Edit2, ImageIcon, Loader2, Plus, Trash2 } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSectionActionLoading } from '../../hooks/useSectionActionLoading';
import SectionHeader from '../ui/SectionHeader';
import SectionHeadingDescription from '../ui/SectionHeadingDescription';

type Props = {
  section: MallSection;
  onSaveSection?: (payload?: Partial<UpdatePageSectionREQ>) => Promise<any> | void;
};

export const CertificatesEditor: React.FC<Props> = ({ section, onSaveSection }) => {
  const { t: tCommon } = useTranslation('common');
  const { t: tContent } = useTranslation('content');
  const { t: tEnum } = useTranslation('enum');

  const initialData = useMemo(() => normalizeCertificatesData(section), [section]);

  const [heading, setHeading] = useState(initialData.heading);
  const [description, setDescription] = useState(initialData.description);
  const [imageUrl, setImageUrl] = useState(initialData.image_url);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfoItem[]>(initialData.company_info);

  const [isOpen, setIsOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const { isLoading, isLoadingTarget, runWithLoading } = useSectionActionLoading<number | 'save_all' | 'save_item'>();

  const [form, setForm] = useState<CompanyInfoItem>({
    label: '',
    value: '',
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
      setImageUrl(fileOrUrl);
    } else if (fileOrUrl instanceof File) {
      const url = await uploadFile(fileOrUrl, FileType.BANNERS);
      if (url) {
        setImageUrl(url);
      }
    }
  };

  const handleOpenAdd = () => {
    setEditingIndex(null);
    setForm({
      label: '',
      value: '',
    });
    setIsOpen(true);
  };

  const handleOpenEdit = (index: number) => {
    setEditingIndex(index);
    const target = companyInfo[index];
    if (target) {
      setForm({ ...target });
      setIsOpen(true);
    }
  };

  const handleDelete = (indexToDelete: number) =>
    runWithLoading(indexToDelete, async () => {
      const nextInfo = companyInfo.filter((_, idx) => idx !== indexToDelete);
      setCompanyInfo(nextInfo);
      return onSaveSection?.(
        buildCertificatesUpdatePayload(
          {
            heading,
            description,
            image_url: imageUrl,
            company_info: nextInfo,
          },
          section,
        ),
      );
    });

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.label.trim() || !form.value.trim()) return;

    return runWithLoading('save_item', async () => {
      const sanitizedItem: CompanyInfoItem = {
        label: form.label.trim(),
        value: form.value.trim(),
      };

      const nextInfo =
        editingIndex !== null
          ? companyInfo.map((item, idx) => (idx === editingIndex ? sanitizedItem : item))
          : [...companyInfo, sanitizedItem];

      setCompanyInfo(nextInfo);
      await onSaveSection?.(
        buildCertificatesUpdatePayload(
          {
            heading,
            description,
            image_url: imageUrl,
            company_info: nextInfo,
          },
          section,
        ),
      );
      setIsOpen(false);
    });
  };

  const handleSaveAll = () =>
    runWithLoading('save_all', () =>
      onSaveSection?.(
        buildCertificatesUpdatePayload(
          {
            heading,
            description,
            image_url: imageUrl,
            company_info: companyInfo,
          },
          section,
        ),
      ),
    );

  return (
    <div className='space-y-6'>
      {/* 1. Header Bar with Actions */}
      <SectionHeader
        title={section.name || tEnum('content.certificates')}
        icon={Building2}
        badgeText='certificates'
        onCreate={handleOpenAdd}
        createLabel={tContent('company_info.add_info', '정보 추가')}
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

      {/* 3. Company Image Upload */}
      <div className='bg-card space-y-4 rounded-2xl border p-5 shadow-2xs'>
        <div className='flex items-center justify-between border-b pb-3'>
          <label className='text-foreground flex items-center gap-1.5 text-xs font-semibold'>
            <ImageIcon className='h-3.5 w-3.5 text-blue-500' />
            {tContent('company_info.company_image', '회사소개 이미지 (Image)')}
          </label>
          {imageUrl && (
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={() => setImageUrl('')}
              className='text-destructive hover:text-destructive h-6 gap-1 px-2 text-[10px]'>
              <Trash2 className='h-3 w-3' />
              {tContent('homepage.delete_image')}
            </Button>
          )}
        </div>
        <div className='space-y-3'>
          <div className={imageUrl ? 'hidden' : 'block'}>
            <AppUpload value={imageUrl} onChange={handleImageUpload} accept='image/*' />
          </div>
          {imageUrl && (
            <div className='relative w-full overflow-hidden rounded-xl border'>
              <ImageColumnPreview
                src={imageUrl}
                alt='Company'
                className='h-80 w-full rounded-xl sm:h-96'
                previewLabel={tCommon('button.preview', '미리보기')}
              />
            </div>
          )}
        </div>
      </div>

      {/* 4. Company Info List (Table) */}
      <div className='bg-card space-y-3 rounded-2xl border p-5 shadow-2xs'>
        <div className='flex items-center justify-between border-b pb-3'>
          <h4 className='text-foreground text-sm font-bold'>
            {tContent('company_info.list_title', '회사 정보 항목 (Company Info)')} ({companyInfo.length})
          </h4>
          <Button type='button' variant='outline' size='sm' onClick={handleOpenAdd} className='h-7 gap-1 px-2.5 text-xs'>
            <Plus className='h-3.5 w-3.5' />
            {tContent('company_info.add_info', '정보 추가')}
          </Button>
        </div>

        {companyInfo.length === 0 ? (
          <div className='border-muted-foreground/20 flex flex-col items-center justify-center rounded-xl border border-dashed py-10 text-center'>
            <Building2 className='text-muted-foreground/40 mb-2 h-7 w-7' />
            <p className='text-muted-foreground text-xs'>{tContent('homepage.no_items')}</p>
            <Button type='button' variant='outline' size='sm' onClick={handleOpenAdd} className='mt-3 h-8 text-xs'>
              {tContent('company_info.add_info', '정보 추가')}
            </Button>
          </div>
        ) : (
          <div className='overflow-hidden rounded-xl border'>
            <Table>
              <TableHeader>
                <TableRow className='bg-muted/40'>
                  <TableHead className='w-1/3 text-xs font-semibold'>
                    {tContent('company_info.field_label', '항목명 (Label)')}
                  </TableHead>
                  <TableHead className='text-xs font-semibold'>{tContent('company_info.field_value', '내용 (Value)')}</TableHead>
                  <TableHead className='w-20 text-right text-xs font-semibold'>{tContent('column.actions', '작업')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companyInfo.map((item, idx) => (
                  <TableRow key={`${item.label}_${idx}`} className='hover:bg-muted/30'>
                    <TableCell className='text-foreground text-xs font-semibold'>{item.label}</TableCell>
                    <TableCell className='text-muted-foreground text-xs leading-relaxed'>{item.value}</TableCell>
                    <TableCell className='text-right'>
                      <div className='flex items-center justify-end gap-1'>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          onClick={() => handleOpenEdit(idx)}
                          className='h-7 w-7 text-neutral-500 hover:text-blue-600'>
                          <Edit2 className='h-3.5 w-3.5' />
                        </Button>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          onClick={() => handleDelete(idx)}
                          disabled={isLoadingTarget(idx)}
                          className='text-destructive hover:text-destructive hover:bg-destructive/10 h-7 w-7'>
                          {isLoadingTarget(idx) ? (
                            <Loader2 className='h-3.5 w-3.5 animate-spin' />
                          ) : (
                            <Trash2 className='h-3.5 w-3.5' />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* 5. Add / Edit Company Info Item Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className='sm:max-w-md'>
          <form onSubmit={handleSaveItem}>
            <DialogHeader>
              <DialogTitle>
                {editingIndex !== null
                  ? tContent('company_info.edit_title', '회사 정보 수정')
                  : tContent('company_info.create_title', '회사 정보 추가')}
              </DialogTitle>
              <DialogDescription>
                {tContent('company_info.dialog_desc', '회사소개 섹션에 표시할 항목명과 내용을 입력하세요.')}
              </DialogDescription>
            </DialogHeader>

            <div className='space-y-4 py-4'>
              <div className='space-y-1.5'>
                <label className='text-foreground text-xs font-semibold'>
                  {tContent('company_info.field_label', '항목명 (Label)')} <span className='text-destructive'>*</span>
                </label>
                <Input
                  value={form.label}
                  onChange={(e) => setForm((prev) => ({ ...prev, label: e.target.value }))}
                  placeholder='회사명, 창립, Tel, Web...'
                  className='h-8 text-xs'
                  required
                />
              </div>

              <div className='space-y-1.5'>
                <label className='text-foreground text-xs font-semibold'>
                  {tContent('company_info.field_value', '내용 (Value)')} <span className='text-destructive'>*</span>
                </label>
                <Input
                  value={form.value}
                  onChange={(e) => setForm((prev) => ({ ...prev, value: e.target.value }))}
                  placeholder='(주)헤브론, 02-2264-7911...'
                  className='h-8 text-xs'
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type='button' variant='outline' size='sm' onClick={() => setIsOpen(false)}>
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

export default CertificatesEditor;
