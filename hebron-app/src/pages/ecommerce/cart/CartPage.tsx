import { Skeleton } from '@/components/ui/skeleton';
import { useCartQuery, useCartQuoteQuery, useUpdateCartItemMutation } from '@/data/cart/cart.query';
import { ROUTE_NAME } from '@/utils/constants/route.constant';
import type { GuestCartItem } from '@/utils/helper/guest-cart.helper';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import CartDesignPreviewDialog from './components/CartDesignPreviewDialog';
import CartItem from './components/CartItem';
import CartTotalAmount from './components/CartTotalAmount';
import WritingTextModal from '../product/components/detail/WritingTextModal';

const CartItemSkeleton = () => (
  <section className='rounded-lg border border-neutral-200' aria-hidden>
    <div className='flex items-center gap-1 p-5'>
      <Skeleton className='h-5 w-20' />
      <Skeleton className='h-7 w-24' />
    </div>
    <div className='flex flex-col gap-4 border-t border-neutral-200 p-3 md:flex-row md:items-start md:p-5'>
      <Skeleton className='h-64 w-full rounded-lg md:size-31' />
      <div className='flex-1 space-y-3'>
        <div className='space-y-2'>
          <Skeleton className='h-6 w-2/3' />
          <Skeleton className='h-4 w-24' />
        </div>
        <Skeleton className='h-28 w-full' />
        <div className='flex justify-between gap-3'>
          <Skeleton className='h-13 w-40' />
          <Skeleton className='h-8 w-28' />
        </div>
      </div>
    </div>
  </section>
);

const CartPage = () => {
  const { t: tCommon } = useTranslation('common');
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<GuestCartItem[]>([]);
  const { data: loadedCartItems, isLoading, error, refetch } = useCartQuery();
  const { mutate: updateCartItem } = useUpdateCartItemMutation();
  const [editingDesignContentId, setEditingDesignContentId] = useState<number>();
  const [previewItem, setPreviewItem] = useState<GuestCartItem | null>(null);
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const { data: dataQuote, isFetching: isQuoteFetching } = useCartQuoteQuery({
    item_ids: cartItems.map((item) => Number(item.id)),
  });

  useEffect(() => {
    if (loadedCartItems) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCartItems(loadedCartItems);
      return;
    }

    if (error) {
      console.error('[Cart] Cannot load cart:', error);
      setCartItems([]);
    }
  }, [error, loadedCartItems]);

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity === 0) {
      setCartItems((items) => items.filter((item) => item.id !== id));
      return;
    }

    setCartItems((items) => items.map((item) => (item.id === id ? { ...item, quantity } : item)));
    updateCartItem({ itemId: id, quantity }, { onError: () => void refetch() });
  };

  return (
    <section className='pb-6'>
      <div className='mb-2 flex items-center gap-1.5'>
        <h2 className='text-display-xs font-bold'>{tCommon('button.add_to_cart')}</h2>
        <div className='flex size-6 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50 text-sm font-medium'>
          {totalQuantity}
        </div>
      </div>
      <section className='flex flex-col gap-2 lg:flex-row lg:items-start lg:gap-4'>
        <section className='flex-1 space-y-2'>
          {isLoading ? (
            Array.from({ length: 2 }, (_, index) => <CartItemSkeleton key={index} />)
          ) : cartItems.length > 0 ? (
            cartItems.map((item) => (
              <CartItem
                key={item.id}
                cartItemId={Number(item.id)}
                productName={item.productName}
                productSlug={item.productSlug}
                productImage={item.productImage}
                designId={item.designId}
                sku={item.sku}
                previewImage={item.previewFront}
                design={item.design}
                initialQuantity={item.quantity}
                price={item.price}
                content={item.content}
                selectedOptions={item.selectedOptions}
                onQuantityChange={(quantity) => updateQuantity(item.id, quantity)}
                onEditContent={item.designContentId ? () => setEditingDesignContentId(item.designContentId) : undefined}
                onPreview={item.designId ? () => setPreviewItem(item) : undefined}
                onEditDesign={
                  item.designId
                    ? () =>
                        navigate(
                          `${ROUTE_NAME.CANVAS_EDITOR}?product=${encodeURIComponent(item.productSlug)}&cartItem=${encodeURIComponent(item.id)}&design=${encodeURIComponent(item.designId!)}&returnTo=cart${item.selectedOptions?.length ? `&options=${encodeURIComponent(item.selectedOptions.map((option) => option.optionId).join(','))}` : ''}`,
                        )
                    : undefined
                }
              />
            ))
          ) : (
            <div className='flex min-h-48 items-center justify-center rounded-lg border border-neutral-200 text-sm text-neutral-500'>
              장바구니가 비어 있습니다.
            </div>
          )}
        </section>
        <CartTotalAmount itemCount={totalQuantity} dataQuote={dataQuote} isLoading={isQuoteFetching} />
      </section>
      {editingDesignContentId && (
        <WritingTextModal
          key={editingDesignContentId}
          open
          title={tCommon('button.edit')}
          confirmText={tCommon('button.edit')}
          designContentId={editingDesignContentId}
          onOpenChange={(open) => !open && setEditingDesignContentId(undefined)}
          onConfirm={() => void refetch()}
        />
      )}
      <CartDesignPreviewDialog
        open={Boolean(previewItem)}
        image={previewItem?.previewFront}
        backImage={previewItem?.previewBack}
        design={previewItem?.design}
        productName={previewItem?.productName}
        onOpenChange={(open) => !open && setPreviewItem(null)}
      />
    </section>
  );
};

export default CartPage;
