import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { CartQuoteRESP } from '@/data/cart/cart.response';
import { MY_ROUTE } from '@/utils/constants/route.constant';
import { formatPrice } from '@/utils/helper/common.helper';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

type CartTotalAmountProps = {
  itemCount?: number;
  dataQuote?: CartQuoteRESP;
  isLoading?: boolean;
};

const CartTotalAmount = ({ itemCount = 0, dataQuote, isLoading = false }: CartTotalAmountProps) => {
  const { t: tCommon } = useTranslation('common');
  const navigate = useNavigate();
  const summary = dataQuote?.summary;
  const total = summary?.total ?? 0;

  const amountItems = [
    { label: tCommon('title.total_product_amount'), value: formatPrice(summary?.selling_price ?? 0) },
    { label: tCommon('title.option_additional_amount'), value: formatPrice(summary?.option_price ?? 0) },
    { label: tCommon('title.shipping_fee'), value: '무료', valueClassName: 'text-blue-brand' },
  ];

  const handlePayment = () => {
    navigate(MY_ROUTE.CHECKOUT);
  };

  return (
    <section className='w-full space-y-4 rounded-lg border border-neutral-200 p-4 lg:w-89'>
      <p className='text-md font-bold'>{tCommon('title.estimated_order_amount')}</p>
      <section className='space-y-2 border-b border-neutral-200 pb-3'>
        {amountItems.map((item) => (
          <div key={item.label} className='flex items-center justify-between gap-2'>
            <p className='text-sm text-neutral-500'>{item.label}</p>
            {isLoading ? (
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
          {isLoading ? <Skeleton className='h-6 w-24' /> : <p className='text-md font-bold'>{formatPrice(total)}</p>}
        </div>
        {isLoading ? (
          <Skeleton className='mt-2 ml-auto h-5 w-48' />
        ) : (
          <p className='mt-2 text-right text-sm text-neutral-500'>
            ({tCommon('title.supply_price')}: {formatPrice(summary?.sub_total ?? 0)} + {tCommon('title.vat')}:{' '}
            {formatPrice(summary?.vat ?? 0)})
          </p>
        )}
      </div>
      <Button className='w-full' onClick={handlePayment} disabled={itemCount === 0}>
        {tCommon('title.place_an_order')} ({itemCount})
      </Button>
    </section>
  );
};

export default CartTotalAmount;
