import { appToast } from '@/components/toast/AppToast';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateInquiryMutation, useInquiryDetailQuery, useUpdateInquiryMutation } from '@/data/inquiries/inquiries.query';
import { useMyPageFormMobileFooterDock } from '@/hooks/useMyPageFormMobileFooterDock';
import MyPageDetailBackLink from '@/pages/ecommerce/my-page/components/MyPageDetailBackLink';
import { MyPageFormDesktopActions, MyPageFormMobileActions } from '@/pages/ecommerce/my-page/components/MyPageFormActions';
import QuoteFormFields from '@/pages/ecommerce/my-page/quote/components/QuoteFormFields';
import type { QuoteFormValues } from '@/schemas/quote/quote-form.schema';
import { quoteFormSchema } from '@/schemas/quote/quote-form.schema';
import {
  mapInquiryToQuoteFormValues,
  mapQuoteFormToCreateREQ,
  mapQuoteFormToUpdateREQ,
  QUOTE_FORM_DEFAULT_VALUES,
  QUOTE_FORM_LABELS,
} from '@/utils/constants/quote-form.constant';
import { getMyPageQuoteEditPath, getMyPageQuotePath } from '@/utils/constants/route.constant';
import { FileType } from '@/utils/enums/file.enum';
import { splitPhonePattern } from '@/utils/helper/common.helper';
import { resolveAttachmentFiles } from '@/utils/helper/file.helper';
import { readUserInfo } from '@/utils/helper/local-storagte.helper';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Navigate, useMatch, useNavigate, useParams } from 'react-router-dom';

type QuoteFormMode = 'create' | 'edit' | 'view';

const getInitialQuoteFormValues = (): QuoteFormValues => {
  const storedUser = readUserInfo();
  const userName = storedUser?.name || storedUser?.username || '';
  const phone = storedUser?.mobile || storedUser?.phone || '';
  return {
    ...QUOTE_FORM_DEFAULT_VALUES,
    managerName: userName,
    contact: phone ? (splitPhonePattern(phone)?.formatted ?? phone) : '',
  };
};

const MyPageQuoteForm = () => {
  const navigate = useNavigate();
  const { quoteId } = useParams();
  const { user } = useAuth();
  const isEditRoute = Boolean(useMatch(getMyPageQuoteEditPath(':quoteId')));
  const { formRef, isDocked } = useMyPageFormMobileFooterDock();
  const [uploadingAttachments, setUploadingAttachments] = useState(false);

  const mode: QuoteFormMode = !quoteId ? 'create' : isEditRoute ? 'edit' : 'view';
  const isView = mode === 'view';

  const {
    data: detailData,
    isLoading: isDetailLoading,
    isError: isDetailError,
  } = useInquiryDetailQuery(quoteId ?? '', {
    enabled: Boolean(quoteId),
  });

  const createMutation = useCreateInquiryMutation();
  const updateMutation = useUpdateInquiryMutation();
  const isSubmitting = createMutation.isPending || updateMutation.isPending || uploadingAttachments;

  const initialValues = useMemo(() => getInitialQuoteFormValues(), []);

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: initialValues,
    shouldUnregister: false,
  });

  useEffect(() => {
    if (mode !== 'create') return;

    const currentUser = user ?? readUserInfo();
    if (!currentUser) return;

    const username = currentUser.name || currentUser.username;
    if (username) {
      form.setValue('managerName', username);
    }

    const currentContact = form.getValues('contact');
    const phone = currentUser.mobile || currentUser.phone;
    if (!currentContact && phone) {
      form.setValue('contact', splitPhonePattern(phone)?.formatted ?? phone);
    }
  }, [mode, user, form]);

  useEffect(() => {
    if (!detailData?.data.inquiry) return;
    form.reset(mapInquiryToQuoteFormValues(detailData.data.inquiry));
  }, [detailData, form]);

  if (quoteId && isDetailError) {
    return <Navigate to={getMyPageQuotePath()} replace />;
  }

  const goToList = () => navigate(getMyPageQuotePath());

  const onSubmit = async (values: QuoteFormValues) => {
    if (isView || isSubmitting) return;

    if (mode === 'create' && values.attachments.length === 0) {
      form.setError('attachments', { message: QUOTE_FORM_LABELS.attachmentRequired });
      return;
    }

    try {
      setUploadingAttachments(true);
      const attachments = await resolveAttachmentFiles(values.attachments, FileType.INQUIRY_ATTACHMENTS);

      if (mode === 'edit' && quoteId) {
        updateMutation.mutate(
          { id: quoteId, body: mapQuoteFormToUpdateREQ(values, attachments) },
          {
            onSuccess: (response) => {
              appToast.success(response.message || QUOTE_FORM_LABELS.updateSuccess);
              goToList();
            },
            onError: (error) => {
              appToast.error(error.response?.data.message || QUOTE_FORM_LABELS.submitFailed);
            },
          },
        );
        return;
      }

      createMutation.mutate(mapQuoteFormToCreateREQ(values, attachments), {
        onSuccess: (response) => {
          appToast.success(response.message || QUOTE_FORM_LABELS.createSuccess);
          goToList();
        },
        onError: (error) => {
          appToast.error(error.response?.data.message || QUOTE_FORM_LABELS.submitFailed);
        },
      });
    } catch {
      appToast.error(QUOTE_FORM_LABELS.submitFailed);
    } finally {
      setUploadingAttachments(false);
    }
  };

  if (quoteId && isDetailLoading) {
    return (
      <div className='flex w-full min-w-0 flex-col gap-6'>
        <MyPageDetailBackLink to={getMyPageQuotePath()} label={QUOTE_FORM_LABELS.backToList} />
        <p className='text-md text-neutral-500'>{QUOTE_FORM_LABELS.loading}</p>
      </div>
    );
  }

  const cancelLabel = isView ? QUOTE_FORM_LABELS.backToListButton : QUOTE_FORM_LABELS.cancel;
  const submitLabel = mode === 'edit' ? QUOTE_FORM_LABELS.submitUpdate : QUOTE_FORM_LABELS.submitCreate;
  const inquiry = detailData?.data.inquiry;

  return (
    <FormProvider {...form}>
      <form
        ref={formRef}
        className='relative flex w-full min-w-0 flex-col gap-6 pb-20 md:pb-0'
        onSubmit={form.handleSubmit(onSubmit)}>
        <div className='flex items-center justify-between gap-4'>
          <MyPageDetailBackLink to={getMyPageQuotePath()} label={QUOTE_FORM_LABELS.backToList} />
          <MyPageFormDesktopActions
            cancelLabel={cancelLabel}
            submitLabel={submitLabel}
            onCancel={goToList}
            loading={isSubmitting}
            hideSubmit={isView}
          />
        </div>

        <QuoteFormFields
          readOnly={isView}
          uploadingAttachments={uploadingAttachments}
          comments={inquiry?.comments ?? []}
          inquiryStatus={inquiry?.status}
        />

        <MyPageFormMobileActions
          isDocked={isDocked}
          cancelLabel={cancelLabel}
          submitLabel={submitLabel}
          mobileSubmitLabel={QUOTE_FORM_LABELS.submitMobile}
          onCancel={goToList}
          loading={isSubmitting}
          hideSubmit={isView}
        />
      </form>
    </FormProvider>
  );
};

export default MyPageQuoteForm;
