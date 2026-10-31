import { useAuth } from '@/contexts/AuthContext';
import { useBankAccountQuery } from '@/data/bank-account/bank-account.query';
import { useCartQuery } from '@/data/cart/cart.query';
import {
  getCheckoutMemberFormDefaultValues,
  getCheckoutMode,
  getCheckoutQueryParams,
  getCheckoutSelectedOptions,
  readCheckoutProductDesign,
} from '@/data/orders/orders.service';
import { useProductDesignContentDetailQuery, useProductDetailBySlugQuery } from '@/data/products/products.query';
import { useProfileQuery } from '@/data/profile/profile.query';
import { useShippingAddressesQuery } from '@/data/shipping-addresses/shipping-addresses.query';
import { checkoutFormDefaultValues, checkoutFormSchema, type CheckoutFormValues } from '@/schemas/checkout/checkout.schema';
import { MY_ROUTE } from '@/utils/constants/route.constant';
import { OrderPaymentMethod } from '@/utils/enums/order.enum';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Navigate, useSearchParams } from 'react-router-dom';
import CheckoutAmountCard from './components/CheckoutAmountCard';
import OrdererInformationForm from './components/OrdererInformationForm';
import OrderItemSection from './components/OrderItemSection';
import PaymentMethodSection from './components/PaymentMethodSection';
import ShippingInformationForm from './components/ShippingInformationForm';

const CheckoutPage = () => {
  const { t: tCommon } = useTranslation('common');
  const { t: tValidation } = useTranslation('validation');
  const { isAdmin, isLoggedIn } = useAuth();
  const [searchParams] = useSearchParams();
  const checkoutMode = useMemo(() => getCheckoutMode(searchParams), [searchParams]);
  const isCartCheckout = checkoutMode === 'cart';
  const checkoutQuery = useMemo(() => getCheckoutQueryParams(searchParams), [searchParams]);
  const [loadedDesign, setLoadedDesign] = useState<{
    id: string;
    design?: Awaited<ReturnType<typeof readCheckoutProductDesign>>;
  }>();
  const { data: product } = useProductDetailBySlugQuery(checkoutQuery.productSlug);
  const { data: cartItems = [] } = useCartQuery({ enabled: isCartCheckout });
  const [paymentMethod, setPaymentMethod] = useState<OrderPaymentMethod>(OrderPaymentMethod.TOSS);
  const { data: bankAccountData, isLoading: isBankAccountLoading } = useBankAccountQuery({
    enabled: paymentMethod === OrderPaymentMethod.TRANSFER,
  });
  const { data: profileData } = useProfileQuery({ enabled: isLoggedIn });
  const { data: shippingAddressesData, isPending: isShippingAddressesPending } = useShippingAddressesQuery(
    { per_page: 100 },
    { enabled: isLoggedIn },
  );
  const hasPrefilledMemberInfo = useRef(false);

  useEffect(() => {
    if (!checkoutQuery.designId) return;

    let cancelled = false;
    void readCheckoutProductDesign(checkoutQuery.designId, checkoutQuery.productSlug).then((design) => {
      if (cancelled) return;
      setLoadedDesign({
        id: checkoutQuery.designId,
        design,
      });
    });

    return () => {
      cancelled = true;
    };
  }, [checkoutQuery.designId, checkoutQuery.productSlug]);

  const productDesign = loadedDesign?.id === checkoutQuery.designId ? loadedDesign.design : undefined;
  const { data: designContentDetail } = useProductDesignContentDetailQuery(checkoutQuery.designContentId ?? 0, {
    enabled: !isCartCheckout && Boolean(checkoutQuery.designContentId),
  });
  const productDesignContent = designContentDetail?.order_design_content
    ? {
        title: designContentDetail.order_design_content.title,
        recipientName: designContentDetail.order_design_content.recipient_name,
        message: designContentDetail.order_design_content.main_text,
        date: designContentDetail.order_design_content.event_date_ko || designContentDetail.order_design_content.event_date,
        sender: designContentDetail.order_design_content.sender_name,
      }
    : undefined;

  const selectedOptions = useMemo(
    () => getCheckoutSelectedOptions(product, checkoutQuery.optionIds),
    [checkoutQuery.optionIds, product],
  );
  const form = useForm<CheckoutFormValues>({
    defaultValues: checkoutFormDefaultValues,
    resolver: zodResolver(checkoutFormSchema(tCommon, tValidation)),
  });

  useEffect(() => {
    if (!isLoggedIn) {
      hasPrefilledMemberInfo.current = false;
      return;
    }

    const profile = profileData?.data.profile;
    if (!profile || isShippingAddressesPending || hasPrefilledMemberInfo.current) return;

    // Preserve values entered while the member data was still loading.
    if (form.formState.isDirty) {
      hasPrefilledMemberInfo.current = true;
      return;
    }

    form.reset(getCheckoutMemberFormDefaultValues(profile, shippingAddressesData?.data.addresses));
    hasPrefilledMemberInfo.current = true;
  }, [form, isLoggedIn, isShippingAddressesPending, profileData, shippingAddressesData]);

  if (isAdmin) {
    return <Navigate to={MY_ROUTE.HOME} replace />;
  }

  return (
    <section className='mx-auto max-w-278 pb-6'>
      <h2 className='md:text-display-xs text-xl font-bold'>{tCommon('title.order_form')}</h2>
      <FormProvider {...form}>
        <div className='mt-2 flex flex-col gap-2 md:flex-row md:items-start md:gap-4'>
          <section className='flex-1 space-y-2'>
            <OrdererInformationForm />
            <ShippingInformationForm />
            <PaymentMethodSection
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              isBankAccountLoading={isBankAccountLoading}
              isBankTransferAvailable={Boolean(bankAccountData?.data.bank_account)}
            />
            <OrderItemSection
              product={product}
              productDesign={productDesign}
              productDesignContent={productDesignContent}
              selectedOptions={selectedOptions}
              quantity={checkoutQuery.quantity}
              cartItems={isCartCheckout ? cartItems : undefined}
            />
          </section>
          <CheckoutAmountCard
            mode={checkoutMode}
            productId={product?.id}
            selectedOptions={selectedOptions}
            quantity={checkoutQuery.quantity}
            designId={checkoutQuery.designId}
            designContentId={checkoutQuery.designContentId}
            cartItems={cartItems}
            paymentMethod={paymentMethod}
            isBankAccountLoading={isBankAccountLoading}
            isBankTransferAvailable={Boolean(bankAccountData?.data.bank_account)}
          />
        </div>
      </FormProvider>
    </section>
  );
};

export default CheckoutPage;
