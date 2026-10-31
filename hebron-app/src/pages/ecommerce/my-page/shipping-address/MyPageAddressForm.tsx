import { appToast } from '@/components/toast/AppToast';
import {
  useCreateShippingAddressMutation,
  useShippingAddressDetailQuery,
  useUpdateShippingAddressMutation,
} from '@/data/shipping-addresses/shipping-addresses.query';
import { useMyPageFormMobileFooterDock } from '@/hooks/useMyPageFormMobileFooterDock';
import { MyPageFormDesktopActions, MyPageFormMobileActions } from '@/pages/ecommerce/my-page/components/MyPageFormActions';
import MyPageDetailBackLink from '@/pages/ecommerce/my-page/components/MyPageDetailBackLink';
import ShippingAddressFormFields from '@/pages/ecommerce/my-page/shipping-address/components/ShippingAddressFormFields';
import type { ShippingAddressFormValues } from '@/schemas/shipping-address/shipping-address-form.schema';
import { shippingAddressFormSchema } from '@/schemas/shipping-address/shipping-address-form.schema';
import {
  mapShippingAddressFormToREQ,
  mapShippingAddressRESPToFormValues,
  SHIPPING_ADDRESS_FORM_DEFAULT_VALUES,
  SHIPPING_ADDRESS_FORM_LABELS,
} from '@/utils/constants/shipping-address-form.constant';
import { getMyPageAddressesPath } from '@/utils/constants/route.constant';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

const MyPageAddressForm = () => {
  const navigate = useNavigate();
  const { addressId } = useParams();
  const { formRef, isDocked } = useMyPageFormMobileFooterDock();
  const isEditMode = Boolean(addressId);

  const {
    data: detailData,
    isLoading: isDetailLoading,
    isError: isDetailError,
  } = useShippingAddressDetailQuery(addressId ?? '', {
    enabled: isEditMode,
  });

  const createMutation = useCreateShippingAddressMutation();
  const updateMutation = useUpdateShippingAddressMutation();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const form = useForm<ShippingAddressFormValues>({
    resolver: zodResolver(shippingAddressFormSchema),
    defaultValues: SHIPPING_ADDRESS_FORM_DEFAULT_VALUES,
    shouldUnregister: false,
  });

  useEffect(() => {
    if (!detailData?.data.address) return;
    form.reset(mapShippingAddressRESPToFormValues(detailData.data.address));
  }, [detailData, form]);

  if (isEditMode && isDetailError) {
    return <Navigate to={getMyPageAddressesPath()} replace />;
  }

  const handleCancel = () => {
    navigate(getMyPageAddressesPath());
  };

  const onSubmit = (values: ShippingAddressFormValues) => {
    const body = mapShippingAddressFormToREQ(values);

    if (isEditMode && addressId) {
      updateMutation.mutate(
        { id: addressId, body },
        {
          onSuccess: (response) => {
            appToast.success(response.message || SHIPPING_ADDRESS_FORM_LABELS.updateSuccess);
            navigate(getMyPageAddressesPath());
          },
          onError: (error) => {
            appToast.error(error.response?.data.message || SHIPPING_ADDRESS_FORM_LABELS.submitFailed);
          },
        },
      );
      return;
    }

    createMutation.mutate(body, {
      onSuccess: (response) => {
        appToast.success(response.message || SHIPPING_ADDRESS_FORM_LABELS.createSuccess);
        navigate(getMyPageAddressesPath());
      },
      onError: (error) => {
        appToast.error(error.response?.data.message || SHIPPING_ADDRESS_FORM_LABELS.submitFailed);
      },
    });
  };

  const submitLabel = isEditMode ? SHIPPING_ADDRESS_FORM_LABELS.submitUpdate : SHIPPING_ADDRESS_FORM_LABELS.submitCreate;
  const mobileSubmitLabel = isEditMode ? SHIPPING_ADDRESS_FORM_LABELS.submitUpdate : SHIPPING_ADDRESS_FORM_LABELS.submitMobile;
  const pageTitle = isEditMode ? SHIPPING_ADDRESS_FORM_LABELS.pageTitleEdit : SHIPPING_ADDRESS_FORM_LABELS.pageTitleCreate;

  if (isEditMode && isDetailLoading) {
    return (
      <div className='flex w-full min-w-0 flex-col gap-6'>
        <MyPageDetailBackLink to={getMyPageAddressesPath()} label={pageTitle} />
        <p className='text-sm text-neutral-500'>{SHIPPING_ADDRESS_FORM_LABELS.loading}</p>
      </div>
    );
  }

  return (
    <FormProvider {...form}>
      <form
        ref={formRef}
        className='relative flex w-full min-w-0 flex-col gap-6 pb-20 md:pb-0'
        onSubmit={form.handleSubmit(onSubmit)}>
        <div className='flex items-center justify-between gap-4'>
          <MyPageDetailBackLink to={getMyPageAddressesPath()} label={pageTitle} />

          <MyPageFormDesktopActions
            cancelLabel={SHIPPING_ADDRESS_FORM_LABELS.cancel}
            submitLabel={submitLabel}
            onCancel={handleCancel}
            loading={isSubmitting}
          />
        </div>

        <ShippingAddressFormFields />

        <MyPageFormMobileActions
          isDocked={isDocked}
          cancelLabel={SHIPPING_ADDRESS_FORM_LABELS.cancel}
          submitLabel={submitLabel}
          mobileSubmitLabel={mobileSubmitLabel}
          onCancel={handleCancel}
          loading={isSubmitting}
        />
      </form>
    </FormProvider>
  );
};

export default MyPageAddressForm;
