import { appToast } from '@/components/toast/AppToast';
import { useCreateInquiryMutation, useInquiryDetailQuery, useUpdateInquiryMutation } from '@/data/inquiries/inquiries.query';
import { useMyPageFormMobileFooterDock } from '@/hooks/useMyPageFormMobileFooterDock';
import { MyPageFormDesktopActions, MyPageFormMobileActions } from '@/pages/ecommerce/my-page/components/MyPageFormActions';
import MyPageDetailBackLink from '@/pages/ecommerce/my-page/components/MyPageDetailBackLink';
import ShippingInquiryFormFields from '@/pages/ecommerce/my-page/shipping-inquiry/components/ShippingInquiryFormFields';
import type { ShippingInquiryFormValues } from '@/schemas/shipping-inquiry/shipping-inquiry-form.schema';
import { shippingInquiryFormSchema } from '@/schemas/shipping-inquiry/shipping-inquiry-form.schema';
import {
  mapInquiryToShippingFormValues,
  mapShippingFormToCreateREQ,
  mapShippingFormToUpdateREQ,
  SHIPPING_INQUIRY_FORM_DEFAULT_VALUES,
  SHIPPING_INQUIRY_FORM_LABELS,
} from '@/utils/constants/shipping-inquiry-form.constant';
import { getMyPageShippingInquiryEditPath, getMyPageShippingInquiryPath } from '@/utils/constants/route.constant';
import { FileType } from '@/utils/enums/file.enum';
import { resolveAttachmentFiles } from '@/utils/helper/file.helper';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Navigate, useMatch, useNavigate, useParams } from 'react-router-dom';

type ShippingInquiryFormMode = 'create' | 'edit' | 'view';

const MyPageShippingInquiryForm = () => {
  const navigate = useNavigate();
  const { inquiryId } = useParams();
  const isEditRoute = Boolean(useMatch(getMyPageShippingInquiryEditPath(':inquiryId')));
  const { formRef, isDocked } = useMyPageFormMobileFooterDock();
  const [uploadingAttachments, setUploadingAttachments] = useState(false);

  const mode: ShippingInquiryFormMode = !inquiryId ? 'create' : isEditRoute ? 'edit' : 'view';
  const isView = mode === 'view';

  const {
    data: detailData,
    isLoading: isDetailLoading,
    isError: isDetailError,
  } = useInquiryDetailQuery(inquiryId ?? '', {
    enabled: Boolean(inquiryId),
  });

  const createMutation = useCreateInquiryMutation();
  const updateMutation = useUpdateInquiryMutation();
  const isSubmitting = createMutation.isPending || updateMutation.isPending || uploadingAttachments;

  const form = useForm<ShippingInquiryFormValues>({
    resolver: zodResolver(shippingInquiryFormSchema),
    defaultValues: SHIPPING_INQUIRY_FORM_DEFAULT_VALUES,
    shouldUnregister: false,
  });

  useEffect(() => {
    if (!detailData?.data.inquiry) return;
    form.reset(mapInquiryToShippingFormValues(detailData.data.inquiry));
  }, [detailData, form]);

  if (inquiryId && isDetailError) {
    return <Navigate to={getMyPageShippingInquiryPath()} replace />;
  }

  const goToList = () => navigate(getMyPageShippingInquiryPath());

  const onSubmit = async (values: ShippingInquiryFormValues) => {
    if (isView || isSubmitting) return;

    try {
      setUploadingAttachments(true);
      const attachments = await resolveAttachmentFiles(values.attachments, FileType.INQUIRY_ATTACHMENTS);

      if (mode === 'edit' && inquiryId) {
        updateMutation.mutate(
          { id: inquiryId, body: mapShippingFormToUpdateREQ(values, attachments) },
          {
            onSuccess: (response) => {
              appToast.success(response.message || SHIPPING_INQUIRY_FORM_LABELS.updateSuccess);
              goToList();
            },
            onError: (error) => {
              appToast.error(error.response?.data.message || SHIPPING_INQUIRY_FORM_LABELS.submitFailed);
            },
          },
        );
        return;
      }

      createMutation.mutate(mapShippingFormToCreateREQ(values, attachments), {
        onSuccess: (response) => {
          appToast.success(response.message || SHIPPING_INQUIRY_FORM_LABELS.createSuccess);
          goToList();
        },
        onError: (error) => {
          appToast.error(error.response?.data.message || SHIPPING_INQUIRY_FORM_LABELS.submitFailed);
        },
      });
    } catch {
      appToast.error(SHIPPING_INQUIRY_FORM_LABELS.submitFailed);
    } finally {
      setUploadingAttachments(false);
    }
  };

  if (inquiryId && isDetailLoading) {
    return (
      <div className='flex w-full min-w-0 flex-col gap-6'>
        <MyPageDetailBackLink to={getMyPageShippingInquiryPath()} label={SHIPPING_INQUIRY_FORM_LABELS.backToList} />
        <p className='text-md text-neutral-500'>{SHIPPING_INQUIRY_FORM_LABELS.loading}</p>
      </div>
    );
  }

  const cancelLabel = isView ? SHIPPING_INQUIRY_FORM_LABELS.backToListButton : SHIPPING_INQUIRY_FORM_LABELS.cancel;
  const submitLabel = mode === 'edit' ? SHIPPING_INQUIRY_FORM_LABELS.submitUpdate : SHIPPING_INQUIRY_FORM_LABELS.submitCreate;
  const inquiry = detailData?.data.inquiry;

  return (
    <FormProvider {...form}>
      <form
        ref={formRef}
        className='relative flex w-full min-w-0 flex-col gap-6 pb-20 md:pb-0'
        onSubmit={form.handleSubmit(onSubmit)}>
        <div className='flex items-center justify-between gap-4'>
          <MyPageDetailBackLink to={getMyPageShippingInquiryPath()} label={SHIPPING_INQUIRY_FORM_LABELS.backToList} />
          <MyPageFormDesktopActions
            cancelLabel={cancelLabel}
            submitLabel={submitLabel}
            onCancel={goToList}
            loading={isSubmitting}
            hideSubmit={isView}
          />
        </div>

        <ShippingInquiryFormFields
          readOnly={isView}
          uploadingAttachments={uploadingAttachments}
          comments={inquiry?.comments ?? []}
          inquiryStatus={inquiry?.status}
        />

        <MyPageFormMobileActions
          isDocked={isDocked}
          cancelLabel={cancelLabel}
          submitLabel={submitLabel}
          mobileSubmitLabel={SHIPPING_INQUIRY_FORM_LABELS.submitMobile}
          onCancel={goToList}
          loading={isSubmitting}
          hideSubmit={isView}
        />
      </form>
    </FormProvider>
  );
};

export default MyPageShippingInquiryForm;
