import AppDialog from '@/components/dialog/AppDialog';
import { appToast } from '@/components/toast/AppToast';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCartQuoteQuery, useCheckoutCartOrderMutation } from '@/data/cart/cart.query';
import { useCreateOrderMutation } from '@/data/orders/orders.query';
import {
  mapCartCheckoutOrderToPaymentOrder,
  mapCheckoutFormToCartCheckoutREQ,
  mapCheckoutFormToOrderCreateREQ,
  mapOrderToPaymentOrder,
  type CheckoutMode,
  type CheckoutSelectedOption,
} from '@/data/orders/orders.service';
import { useProductQuotationQuery } from '@/data/products/products.query';
import type { CheckoutFormValues } from '@/schemas/checkout/checkout.schema';
import { formatPrice } from '@/utils/helper/common.helper';
import type { GuestCartItem } from '@/utils/helper/guest-cart.helper';
import { handlePayment } from '@/utils/helper/payment.helper';
import { MY_ROUTE } from '@/utils/constants/route.constant';
import { OrderPaymentMethod } from '@/utils/enums/order.enum';
import type { ErrorRESP } from '@/utils/types/response.type';
import type { AxiosError } from 'axios';
import { useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

type CheckoutAmountCardProps = {
  mode: CheckoutMode;
  productId?: number;
  selectedOptions: CheckoutSelectedOption[];
  quantity: number;
  designId: string;
  designContentId?: number;
  cartItems: GuestCartItem[];
  paymentMethod: OrderPaymentMethod;
  isBankAccountLoading: boolean;
  isBankTransferAvailable: boolean;
};

const CheckoutAmountCard = ({
  mode,
  productId,
  selectedOptions,
  quantity,
  designId,
  designContentId,
  cartItems,
  paymentMethod,
  isBankAccountLoading,
  isBankTransferAvailable,
}: CheckoutAmountCardProps) => {
  const { t: tCommon } = useTranslation('common');
  const navigate = useNavigate();
  const { handleSubmit } = useFormContext<CheckoutFormValues>();
  const { mutateAsync: createOrder, isPending: isCreatingOrder } = useCreateOrderMutation();
  const { mutateAsync: checkoutCartOrder, isPending: isCheckingOutCart } = useCheckoutCartOrderMutation();
  const [pendingFormValues, setPendingFormValues] = useState<CheckoutFormValues>();
  const isCartCheckout = mode === 'cart';
  const optionPayload = useMemo(
    () => selectedOptions.map((option) => ({ group_id: option.groupId, option_id: option.optionId })),
    [selectedOptions],
  );
  const cartItemIds = useMemo(
    () => cartItems.map((item) => Number(item.id)).filter((itemId) => Number.isInteger(itemId) && itemId > 0),
    [cartItems],
  );
  const { data: productQuote, isLoading: isProductQuoteLoading } = useProductQuotationQuery({
    productId: productId as number,
    quantity,
    selected_options: optionPayload,
  });
  const { data: cartQuote, isLoading: isCartQuoteLoading } = useCartQuoteQuery(
    isCartCheckout ? { item_ids: cartItemIds } : undefined,
  );
  const isQuoteLoading = isCartCheckout ? isCartQuoteLoading : isProductQuoteLoading;
  const isProcessingOrder = isCreatingOrder || isCheckingOutCart;
  const quote = isCartCheckout
    ? {
        productAmount: cartQuote?.summary.selling_price,
        optionAmount: cartQuote?.summary.option_price,
        shippingFee: 0,
        totalAmount: cartQuote?.summary.total,
        supplyPrice: cartQuote?.summary.sub_total,
        taxAmount: cartQuote?.summary.vat,
      }
    : {
        productAmount: productQuote?.selling_price,
        optionAmount: productQuote?.option_price,
        shippingFee: productQuote?.shipping_fee,
        totalAmount: productQuote
          ? productQuote.subtotal_amount + productQuote.shipping_fee + productQuote.tax_amount
          : undefined,
        supplyPrice: productQuote?.subtotal_amount,
        taxAmount: productQuote?.tax_amount,
      };
  const amountItems = [
    { label: tCommon('title.total_product_amount'), value: formatPrice(quote.productAmount) },
    {
      label: tCommon('title.option_additional_amount'),
      value: quote.optionAmount === undefined ? '-' : `+${formatPrice(quote.optionAmount)}`,
    },
    {
      label: tCommon('title.shipping_fee'),
      value: quote.shippingFee === 0 ? '무료' : formatPrice(quote.shippingFee),
      valueClassName: 'text-blue-brand',
    },
  ];
  const canCheckout = isCartCheckout ? cartItemIds.length > 0 : Boolean(productId && quantity > 0);
  const isTransferUnavailable =
    paymentMethod === OrderPaymentMethod.TRANSFER && (isBankAccountLoading || !isBankTransferAvailable);
  const itemCount = isCartCheckout ? cartItems.reduce((total, item) => total + item.quantity, 0) : quantity;

  const handleOpenPaymentConfirm = (values: CheckoutFormValues) => {
    if (!canCheckout || isTransferUnavailable || isProcessingOrder) return;
    setPendingFormValues(values);
  };

  const handleClosePaymentConfirm = () => {
    if (isProcessingOrder) return;
    setPendingFormValues(undefined);
  };

  const handleCreateOrderAndPay = async () => {
    if (!pendingFormValues || !canCheckout || isTransferUnavailable || isProcessingOrder) return;

    try {
      const paymentOrder = isCartCheckout
        ? mapCartCheckoutOrderToPaymentOrder(
            (
              await checkoutCartOrder(
                mapCheckoutFormToCartCheckoutREQ({ itemIds: cartItemIds, paymentMethod, formValues: pendingFormValues }),
              )
            ).data.order,
          )
        : mapOrderToPaymentOrder(
            (
              await createOrder(
                mapCheckoutFormToOrderCreateREQ({
                  productId: productId as number,
                  selectedOptions,
                  quantity,
                  designId,
                  designContentId,
                  paymentMethod,
                  formValues: pendingFormValues,
                }),
              )
            ).data.order,
          );

      setPendingFormValues(undefined);
      if (paymentMethod === OrderPaymentMethod.TRANSFER) {
        navigate(`${MY_ROUTE.CHECKOUT_RESULT}?orderNumber=${encodeURIComponent(paymentOrder.orderNumber)}`);
        return;
      }
      await handlePayment(() => undefined, paymentOrder);
    } catch (error) {
      const message = (error as AxiosError<ErrorRESP>).response?.data.message ?? tCommon('notify.something_went_wrong');
      appToast.error(message);
    }
  };

  return (
    <section className='space-y-4 rounded-lg border border-neutral-200 p-4 md:w-89' aria-busy={isQuoteLoading}>
      <p className='text-md font-bold'>{tCommon('title.estimated_order_amount')}</p>
      <section className='space-y-2 border-b border-neutral-200 pb-3'>
        {amountItems.map((item) => (
          <div key={item.label} className='flex items-center justify-between gap-2'>
            <p className='text-sm text-neutral-500'>{item.label}</p>
            {isQuoteLoading ? (
              <Skeleton className='h-5 w-20' />
            ) : (
              <p className={`text-sm font-bold ${item.valueClassName ?? 'text-neutral-950'}`}>{item.value}</p>
            )}
          </div>
        ))}
      </section>
      <div className='rounded-md bg-neutral-50 p-2'>
        <div className='flex items-center justify-between'>
          <p className='text-sm text-neutral-500'>{tCommon('title.total')}</p>
          {isQuoteLoading ? (
            <Skeleton className='h-6 w-24' />
          ) : (
            <p className='text-md font-bold'>{formatPrice(quote.totalAmount)}</p>
          )}
        </div>
        {isQuoteLoading ? (
          <Skeleton className='mt-2 ml-auto h-5 w-48' />
        ) : (
          <p className='mt-2 text-right text-sm text-neutral-500'>
            ({tCommon('title.supply_price')}: {formatPrice(quote.supplyPrice)} + {tCommon('title.vat')}:{' '}
            {formatPrice(quote.taxAmount)})
          </p>
        )}
      </div>
      <Button
        className='w-full'
        disabled={!canCheckout || isTransferUnavailable || isProcessingOrder}
        onClick={handleSubmit(handleOpenPaymentConfirm)}>
        {tCommon('title.place_an_order')} ({itemCount})
      </Button>
      <AppDialog
        open={Boolean(pendingFormValues)}
        onOpenChange={(open) => !open && handleClosePaymentConfirm()}
        title={tCommon('title.payment_method')}
        confirmText={tCommon('title.place_an_order')}
        isConfirming={isProcessingOrder}
        onCancel={handleClosePaymentConfirm}
        onConfirm={() => void handleCreateOrderAndPay()}>
        <p className='text-lg text-neutral-600'>결제를 진행하시겠습니까?</p>
      </AppDialog>
    </section>
  );
};

export default CheckoutAmountCard;
