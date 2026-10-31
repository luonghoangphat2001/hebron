import Can from '@/components/Can';
import { ImagePreviewDialog } from '@/components/dialog/ImagePreviewDialog';
import FormItem from '@/components/form/FormItem';
import { appToast } from '@/components/toast/AppToast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { uploadFileAPI } from '@/data/file/file.api';
import type { MemberDetailItemRESP } from '@/data/member/member.respsonse';
import { transformMemberDetailToBusinessInput } from '@/data/member/member.service';
import { memberBusinessInfoSchema } from '@/schemas/member/member.schema';
import { BUSINESS_REG_ATTACHMENT_ACCEPT, BUSINESS_REG_MAX_SIZE_MB } from '@/utils/constants/attachment.constant';
import { FileType } from '@/utils/enums/file.enum';
import { getDirtyValues, getFileNameFromPath, getFileUrl } from '@/utils/helper/common.helper';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, FileText, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm, type Resolver } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export type BusinessInfoInput = {
  company_name: string;
  business_registration_number: string;
  business_registration_file: string;
  representative_name: string;
  industry_type: string;
  business_type: string;
  business_postcode: string;
  business_address: string;
  business_address_detail: string;
  tax_invoice_email: string;
  homepage_url: string;
};

export type BusinessInfoSavePayload = Partial<BusinessInfoInput & { business_registration_file?: string }>;

type MemberBusinessInfoTabProps = {
  member: MemberDetailItemRESP;
  isSaving?: boolean;
  onSave: (payload: BusinessInfoSavePayload) => void;
};

type BusinessFileInputProps = {
  currentFileName: string | null;
  fileUrl: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  pendingFile: File | null;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearPending: () => void;
  onDeleteExisting: () => void;
  onPreview: (url: string) => void;
};

const BusinessFileInput = ({
  currentFileName,
  fileUrl,
  fileInputRef,
  pendingFile,
  onFileSelect,
  onClearPending,
  onDeleteExisting,
  onPreview,
}: BusinessFileInputProps) => {
  const { t: tCommon } = useTranslation('common');

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (pendingFile) {
      onClearPending();
    } else {
      onDeleteExisting();
    }
  };

  return (
    <>
      <input ref={fileInputRef} type='file' accept={BUSINESS_REG_ATTACHMENT_ACCEPT} className='hidden' onChange={onFileSelect} />

      {currentFileName ? (
        <button
          type='button'
          onClick={() => fileInputRef.current?.click()}
          className='border-input flex w-full items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm dark:bg-gray-950'>
          <FileText className='text-primary size-4 shrink-0' />
          <span className='flex-1 truncate text-left text-gray-700 dark:text-gray-300'>{currentFileName}</span>
          {fileUrl && (
            <button
              type='button'
              onClick={(e) => {
                e.stopPropagation();
                onPreview(fileUrl);
              }}
              className='text-muted-foreground hover:text-foreground shrink-0 transition-colors'>
              <Eye className='size-4' />
            </button>
          )}
          <button
            type='button'
            onClick={handleClear}
            className='text-muted-foreground hover:text-destructive shrink-0 transition-colors'>
            <X className='size-4' />
          </button>
        </button>
      ) : (
        <button
          type='button'
          onClick={() => fileInputRef.current?.click()}
          className='border-input text-muted-foreground hover:bg-accent flex w-full items-center gap-2 rounded-md border border-dashed px-3 py-2 text-sm transition-colors'>
          <FileText className='size-4 shrink-0' />
          <span>{tCommon('title.click_to_upload')}</span>
        </button>
      )}
      <p className='text-muted-foreground mt-1 text-xs'>PDF, JPG, JPEG, or PNG. Max {BUSINESS_REG_MAX_SIZE_MB}MB.</p>
    </>
  );
};

const MemberBusinessInfoTab = ({ member, isSaving, onSave }: MemberBusinessInfoTabProps) => {
  const { t: tMember } = useTranslation('member');
  const { t: tCommon } = useTranslation('common');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [removeExistingFile, setRemoveExistingFile] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const defaultValues = useMemo<BusinessInfoInput>(() => transformMemberDetailToBusinessInput(member), [member]);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { dirtyFields, isDirty, errors },
  } = useForm<BusinessInfoInput>({
    mode: 'all',
    defaultValues,
    resolver: zodResolver(memberBusinessInfoSchema) as Resolver<BusinessInfoInput>,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const onSubmit = async (data: BusinessInfoInput) => {
    const dirty = getDirtyValues(dirtyFields, data) as BusinessInfoSavePayload;

    if (pendingFile) {
      setUploadingFile(true);
      try {
        const resp = await uploadFileAPI(pendingFile, FileType.BUSINESS_REGISTRATIONS);
        dirty.business_registration_file = resp.data?.file?.path || resp.data?.file?.url || resp.data?.file?.name || '';
        setPendingFile(null);
        setRemoveExistingFile(false);
      } catch (err: any) {
        appToast.error(err?.response?.data?.message || err?.message || tCommon('notify.fail_update'));
        setUploadingFile(false);
        return;
      }
      setUploadingFile(false);
    } else if (removeExistingFile) {
      dirty.business_registration_file = '';
      setRemoveExistingFile(false);
    }

    if (Object.keys(dirty).length === 0) return;
    onSave(dirty);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > BUSINESS_REG_MAX_SIZE_MB * 1024 * 1024) {
      appToast.error(tCommon('notify.file_too_large', { size: BUSINESS_REG_MAX_SIZE_MB }));
      return;
    }
    setPendingFile(file);
    setRemoveExistingFile(false);
    setValue('business_registration_file', file.name, { shouldValidate: true, shouldDirty: true });
  };

  const handleClearPending = () => {
    setPendingFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    const nextVal = !removeExistingFile ? member.business_registration_file || '' : '';
    setValue('business_registration_file', nextVal, { shouldValidate: true, shouldDirty: true });
  };

  const handleDeleteExisting = () => {
    setRemoveExistingFile(true);
    setValue('business_registration_file', '', { shouldValidate: true, shouldDirty: true });
  };

  const handleReset = () => {
    reset(defaultValues);
    setPendingFile(null);
    setRemoveExistingFile(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const currentFileName =
    pendingFile?.name ?? (!removeExistingFile ? getFileNameFromPath(member.business_registration_file) : null);

  const fileUrl =
    !pendingFile && !removeExistingFile && member.business_registration_file
      ? getFileUrl(member.business_registration_file)
      : null;

  const isBusy = isSaving || uploadingFile;
  const isFormDirty = isDirty || Boolean(pendingFile) || removeExistingFile;

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 rounded-md border border-gray-200 p-5 dark:border-gray-800'>
        <div className='grid grid-cols-2 gap-4'>
          <FormItem label={tMember('field.company_name')} required error={errors.company_name?.message}>
            <Controller control={control} name='company_name' render={({ field }) => <Input {...field} />} />
          </FormItem>

          <FormItem
            label={tMember('field.business_registration_number')}
            required
            error={errors.business_registration_number?.message}>
            <Controller control={control} name='business_registration_number' render={({ field }) => <Input {...field} />} />
          </FormItem>

          <FormItem label={tMember('field.representative_name')} required error={errors.representative_name?.message}>
            <Controller control={control} name='representative_name' render={({ field }) => <Input {...field} />} />
          </FormItem>

          <FormItem label={tMember('field.tax_invoice_email')} required error={errors.tax_invoice_email?.message}>
            <Controller control={control} name='tax_invoice_email' render={({ field }) => <Input type='email' {...field} />} />
          </FormItem>

          <FormItem label={tMember('field.industry_type')} required error={errors.industry_type?.message}>
            <Controller control={control} name='industry_type' render={({ field }) => <Input {...field} />} />
          </FormItem>

          <FormItem label={tMember('field.business_type')} required error={errors.business_type?.message}>
            <Controller control={control} name='business_type' render={({ field }) => <Input {...field} />} />
          </FormItem>

          <FormItem label={tMember('field.homepage_url')} required error={errors.homepage_url?.message}>
            <Controller control={control} name='homepage_url' render={({ field }) => <Input {...field} />} />
          </FormItem>

          <FormItem label={tMember('field.business_postcode')} required error={errors.business_postcode?.message}>
            <Controller control={control} name='business_postcode' render={({ field }) => <Input {...field} />} />
          </FormItem>

          <FormItem label={tMember('field.business_address')} required error={errors.business_address?.message}>
            <Controller control={control} name='business_address' render={({ field }) => <Input {...field} />} />
          </FormItem>

          <FormItem label={tMember('field.business_address_detail')} error={errors.business_address_detail?.message}>
            <Controller control={control} name='business_address_detail' render={({ field }) => <Input {...field} />} />
          </FormItem>

          <div className='col-span-2'>
            <FormItem
              label={tMember('field.business_registration_file')}
              required
              error={errors.business_registration_file?.message}>
              <BusinessFileInput
                currentFileName={currentFileName}
                fileUrl={fileUrl}
                fileInputRef={fileInputRef}
                pendingFile={pendingFile}
                onFileSelect={handleFileSelect}
                onClearPending={handleClearPending}
                onDeleteExisting={handleDeleteExisting}
                onPreview={setPreviewUrl}
              />
            </FormItem>
          </div>
        </div>

        <div className='flex justify-end gap-2'>
          <Button size='sm' type='button' variant='outline' onClick={handleReset} disabled={!isFormDirty || isBusy}>
            {tCommon('button.reset')}
          </Button>
          <Can action='edit'>
            <Button size='sm' type='submit' disabled={!isFormDirty || isBusy}>
              {isBusy && <Spinner className='mr-2 size-4' />}
              {tCommon('button.save')}
            </Button>
          </Can>
        </div>
      </form>

      <ImagePreviewDialog url={previewUrl} onClose={() => setPreviewUrl(null)} />
    </>
  );
};

export default MemberBusinessInfoTab;
