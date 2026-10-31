import type { AppDialogProps } from '@/components/dialog/AppDialog';
import AppDialog from '@/components/dialog/AppDialog';
import FormDatePicker from '@/components/form/FormDatePicker';
import FormFileDropzone from '@/components/form/FormFileDropzone';
import FormInput from '@/components/form/FormInput';
import FormTextarea from '@/components/form/FormTextarea';
import { appToast } from '@/components/toast/AppToast';
import { Button } from '@/components/ui/button';
import type { GeneratedPlaqueText } from '@/data/ai/ai.api';
import {
  mapDesignContentFormToCreateREQ,
  mapDesignContentFormToUpdateREQ,
  mapProductDesignContentToFormValues,
} from '@/data/products/product.service';
import {
  useCreateProductDesignContentDetailMutation,
  useProductDesignContentDetailQuery,
  useUpdateProductDesignContentDetailMutation,
} from '@/data/products/products.query';
import {
  DESIGN_CONTENT_DEFAULT_VALUES,
  designContentFormSchema,
  type DesignContentFormValues,
} from '@/schemas/design-content/design-content.schema';
import { FileType } from '@/utils/enums/file.enum';
import { normalizeDateInput } from '@/utils/helper/date.helper';
import { resolveAttachmentFiles } from '@/utils/helper/file.helper';
import { zodResolver } from '@hookform/resolvers/zod';
import { MagicWandIcon } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

type WritingTextModalProps = Omit<AppDialogProps, 'children'> & {
  designContentId?: number;
  handleOpenAIModal?: () => void;
  appliedAIPhrase?: GeneratedPlaqueText | null;
};

const WritingTextModal = ({ designContentId, handleOpenAIModal, appliedAIPhrase, ...props }: WritingTextModalProps) => {
  const { t: tCommon } = useTranslation('common');
  const { t: tValidation } = useTranslation('validation');
  const [, setSearchParams] = useSearchParams();
  const [isUploadingAttachments, setIsUploadingAttachments] = useState(false);

  //api create
  const createDesignContentMutation = useCreateProductDesignContentDetailMutation();
  const updateDesignContentMutation = useUpdateProductDesignContentDetailMutation();
  const { data: designContentDetail, isLoading: isDesignContentLoading } = useProductDesignContentDetailQuery(
    designContentId ?? 0,
    { enabled: Boolean(props.open && designContentId) },
  );

  const form = useForm<DesignContentFormValues>({
    mode: 'all',
    resolver: zodResolver(designContentFormSchema(tCommon, tValidation)),
    defaultValues: DESIGN_CONTENT_DEFAULT_VALUES,
  });
  const { control } = form;
  const isSubmitting =
    createDesignContentMutation.isPending ||
    updateDesignContentMutation.isPending ||
    isUploadingAttachments ||
    isDesignContentLoading;

  useEffect(() => {
    if (!props.open || appliedAIPhrase) return;

    if (!designContentId) {
      form.reset(DESIGN_CONTENT_DEFAULT_VALUES);
      return;
    }

    const designContent = designContentDetail?.order_design_content;
    if (designContent) {
      form.reset(mapProductDesignContentToFormValues(designContent));
    }
  }, [appliedAIPhrase, designContentDetail, designContentId, form, props.open]);

  useEffect(() => {
    if (!appliedAIPhrase) return;

    form.setValue('title', appliedAIPhrase.title, { shouldValidate: true });
    form.setValue('recipientName', appliedAIPhrase.recipient ?? '', { shouldValidate: true });
    form.setValue('date', normalizeDateInput(appliedAIPhrase.date ?? ''), { shouldValidate: true });
    form.setValue('message', appliedAIPhrase.message, { shouldValidate: true });
    form.setValue('sender', appliedAIPhrase.sender ?? '', { shouldValidate: true });
  }, [appliedAIPhrase, form]);

  const handleConfirm = async (values: DesignContentFormValues) => {
    if (isSubmitting) return;

    try {
      setIsUploadingAttachments(true);
      const attachments = await resolveAttachmentFiles(values.file, FileType.ORDER_DESIGN_CONTENT, 'path');
      const response = designContentId
        ? await updateDesignContentMutation.mutateAsync(mapDesignContentFormToUpdateREQ(designContentId, values, attachments))
        : await createDesignContentMutation.mutateAsync(mapDesignContentFormToCreateREQ(values, attachments));

      if (!designContentId) {
        setSearchParams((params) => {
          const nextParams = new URLSearchParams(params);
          nextParams.set('designContentId', String(response.data.order_design_content.id));
          return nextParams;
        });
      }

      form.reset(DESIGN_CONTENT_DEFAULT_VALUES);
      appToast.success(tCommon(designContentId ? 'notify.success_update' : 'notify.success_create'));
      props.onOpenChange(false);
      props.onConfirm?.();
    } catch {
      appToast.error(tCommon(designContentId ? 'notify.fail_update' : 'notify.fail_create'));
    } finally {
      setIsUploadingAttachments(false);
    }
  };

  return (
    <AppDialog {...props} onConfirm={form.handleSubmit(handleConfirm)} isConfirming={isSubmitting}>
      <div>
        <div className='flex flex-col gap-3 rounded-lg bg-[linear-gradient(107deg,#1E50A2_0%,#E60013_100%)] p-3 md:flex-row md:items-center md:gap-4 md:px-6 md:py-5'>
          <MagicWandIcon className='size-8 text-white' weight='duotone' />
          <p className='text-lg font-bold text-white md:text-xl'>{tCommon('title.ai_help_note')}</p>
          {handleOpenAIModal ? (
            <Button variant='outline' className='w-fit md:ml-auto' onClick={handleOpenAIModal}>
              {tCommon('button.ai_phrase_assit')}
            </Button>
          ) : null}
        </div>

        <FormProvider {...form}>
          <div className='mt-4 space-y-4 md:mt-10'>
            <FormInput
              control={control}
              name='title'
              label={tCommon('title.title')}
              required
              placeholder='예) 감사패, 기념패, 공로패 등'
              containerClassName='md:gap-12'
            />
            <FormInput
              control={control}
              name='recipientName'
              label={`${tCommon('title.recipient')}/${tCommon('title.organization_name')}`}
              required
              placeholder='홍길동 사무님'
              containerClassName='md:gap-11'
              labelClassName='md:w-25'
            />
            <FormDatePicker
              control={control}
              name='date'
              label={tCommon('title.date_2')}
              required
              placeholder={tCommon('placeholder.select_date')}
              containerClassName='md:gap-12'
            />
            <FormTextarea
              control={control}
              name='message'
              label={tCommon('title.greeting')}
              required
              placeholder={'상패에 새길 문안을 작성해주세요.\nAI 문구 도우미를 이용하시면 자동으로 작성됩니다.'}
              className='h-32 min-h-32 placeholder:whitespace-pre-line'
              containerClassName='md:gap-12'
            />
            <FormInput
              control={control}
              name='sender'
              label={`${tCommon('title.giver')} (${tCommon('title.organization_name')})`}
              required
              placeholder='예) 전축공학회 임직원 일동, 동반자 백제수 등'
              containerClassName='md:gap-10'
              labelClassName='md:w-26 tracking-tight'
            />
            <FormFileDropzone
              control={control}
              name='file'
              label={tCommon('title.attachment')}
              secondaryInfoMessage='로고, 사진, 직인 파일을 원하시면 이곳에 첨부해주세요.'
              containerClassName='md:gap-12'
            />
          </div>
        </FormProvider>
      </div>
    </AppDialog>
  );
};

export default WritingTextModal;
