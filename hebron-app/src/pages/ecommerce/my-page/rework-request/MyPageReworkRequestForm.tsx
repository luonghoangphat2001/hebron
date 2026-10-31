import { appToast } from '@/components/toast/AppToast';
import { useCreateInquiryMutation, useInquiryDetailQuery, useUpdateInquiryMutation } from '@/data/inquiries/inquiries.query';
import { useMyPageFormMobileFooterDock } from '@/hooks/useMyPageFormMobileFooterDock';
import { MyPageFormDesktopActions, MyPageFormMobileActions } from '@/pages/ecommerce/my-page/components/MyPageFormActions';
import MyPageDetailBackLink from '@/pages/ecommerce/my-page/components/MyPageDetailBackLink';
import ReworkRequestFormFields from '@/pages/ecommerce/my-page/rework-request/components/ReworkRequestFormFields';
import type { ReworkRequestFormValues } from '@/schemas/rework-request/rework-request-form.schema';
import { reworkRequestFormSchema } from '@/schemas/rework-request/rework-request-form.schema';
import {
  mapInquiryToReworkFormValues,
  mapReworkFormToCreateREQ,
  mapReworkFormToUpdateREQ,
  REWORK_REQUEST_FORM_DEFAULT_VALUES,
  REWORK_REQUEST_FORM_LABELS,
} from '@/utils/constants/rework-request-form.constant';
import { getMyPageReworkRequestEditPath, getMyPageReworkRequestPath } from '@/utils/constants/route.constant';
import { FileType } from '@/utils/enums/file.enum';
import { resolveAttachmentFiles } from '@/utils/helper/file.helper';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Navigate, useMatch, useNavigate, useParams } from 'react-router-dom';

type ReworkRequestFormMode = 'create' | 'edit' | 'view';

const MyPageReworkRequestForm = () => {
  const navigate = useNavigate();
  const { requestId } = useParams();
  const isEditRoute = Boolean(useMatch(getMyPageReworkRequestEditPath(':requestId')));
  const { formRef, isDocked } = useMyPageFormMobileFooterDock();
  const [uploadingAttachments, setUploadingAttachments] = useState(false);

  const mode: ReworkRequestFormMode = !requestId ? 'create' : isEditRoute ? 'edit' : 'view';
  const isView = mode === 'view';

  const {
    data: detailData,
    isLoading: isDetailLoading,
    isError: isDetailError,
  } = useInquiryDetailQuery(requestId ?? '', {
    enabled: Boolean(requestId),
  });

  const createMutation = useCreateInquiryMutation();
  const updateMutation = useUpdateInquiryMutation();
  const isSubmitting = createMutation.isPending || updateMutation.isPending || uploadingAttachments;

  const form = useForm<ReworkRequestFormValues>({
    resolver: zodResolver(reworkRequestFormSchema),
    defaultValues: REWORK_REQUEST_FORM_DEFAULT_VALUES,
    shouldUnregister: false,
  });

  useEffect(() => {
    if (!detailData?.data.inquiry) return;
    form.reset(mapInquiryToReworkFormValues(detailData.data.inquiry));
  }, [detailData, form]);

  if (requestId && isDetailError) {
    return <Navigate to={getMyPageReworkRequestPath()} replace />;
  }

  const goToList = () => navigate(getMyPageReworkRequestPath());

  const onSubmit = async (values: ReworkRequestFormValues) => {
    if (isView || isSubmitting) return;

    if (mode === 'create' && values.attachments.length === 0) {
      form.setError('attachments', { message: REWORK_REQUEST_FORM_LABELS.attachmentRequired });
      return;
    }

    try {
      setUploadingAttachments(true);
      const attachments = await resolveAttachmentFiles(values.attachments, FileType.INQUIRY_ATTACHMENTS);

      if (mode === 'edit' && requestId) {
        updateMutation.mutate(
          { id: requestId, body: mapReworkFormToUpdateREQ(values, attachments) },
          {
            onSuccess: (response) => {
              appToast.success(response.message || REWORK_REQUEST_FORM_LABELS.updateSuccess);
              goToList();
            },
            onError: (error) => {
              appToast.error(error.response?.data.message || REWORK_REQUEST_FORM_LABELS.submitFailed);
            },
          },
        );
        return;
      }

      createMutation.mutate(mapReworkFormToCreateREQ(values, attachments), {
        onSuccess: (response) => {
          appToast.success(response.message || REWORK_REQUEST_FORM_LABELS.createSuccess);
          goToList();
        },
        onError: (error) => {
          appToast.error(error.response?.data.message || REWORK_REQUEST_FORM_LABELS.submitFailed);
        },
      });
    } catch {
      appToast.error(REWORK_REQUEST_FORM_LABELS.submitFailed);
    } finally {
      setUploadingAttachments(false);
    }
  };

  if (requestId && isDetailLoading) {
    return (
      <div className='flex w-full min-w-0 flex-col gap-6'>
        <MyPageDetailBackLink to={getMyPageReworkRequestPath()} label={REWORK_REQUEST_FORM_LABELS.backToList} />
        <p className='text-md text-neutral-500'>{REWORK_REQUEST_FORM_LABELS.loading}</p>
      </div>
    );
  }

  const cancelLabel = isView ? REWORK_REQUEST_FORM_LABELS.backToListButton : REWORK_REQUEST_FORM_LABELS.cancel;
  const submitLabel = mode === 'edit' ? REWORK_REQUEST_FORM_LABELS.submitUpdate : REWORK_REQUEST_FORM_LABELS.submitCreate;
  const inquiry = detailData?.data.inquiry;

  return (
    <FormProvider {...form}>
      <form
        ref={formRef}
        className='relative flex w-full min-w-0 flex-col gap-6 pb-20 md:pb-0'
        onSubmit={form.handleSubmit(onSubmit)}>
        <div className='flex items-center justify-between gap-4'>
          <MyPageDetailBackLink to={getMyPageReworkRequestPath()} label={REWORK_REQUEST_FORM_LABELS.backToList} />
          <MyPageFormDesktopActions
            cancelLabel={cancelLabel}
            submitLabel={submitLabel}
            onCancel={goToList}
            loading={isSubmitting}
            hideSubmit={isView}
          />
        </div>

        <ReworkRequestFormFields
          readOnly={isView}
          uploadingAttachments={uploadingAttachments}
          comments={inquiry?.comments ?? []}
          inquiryStatus={inquiry?.status}
        />

        <MyPageFormMobileActions
          isDocked={isDocked}
          cancelLabel={cancelLabel}
          submitLabel={submitLabel}
          mobileSubmitLabel={REWORK_REQUEST_FORM_LABELS.submitMobile}
          onCancel={goToList}
          loading={isSubmitting}
          hideSubmit={isView}
        />
      </form>
    </FormProvider>
  );
};

export default MyPageReworkRequestForm;
