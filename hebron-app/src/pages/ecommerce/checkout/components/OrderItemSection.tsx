import { Product1 } from '@/assets/images';
import OrderItemCard from '@/components/card/OrderItemCard';
import type { CheckoutSelectedOption } from '@/data/orders/orders.service';
import type { ProductItemRESP, ProductSpecification } from '@/data/products/products.response';
import type { GuestCartItem, ProductDesign } from '@/utils/helper/guest-cart.helper';
import { PackageIcon } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';

type OrderItemSectionProps = {
  product?: ProductItemRESP;
  productDesign?: ProductDesign;
  productDesignContent?: GuestCartItem['content'];
  selectedOptions: CheckoutSelectedOption[];
  quantity: number;
  cartItems?: GuestCartItem[];
};

const getOptionsDescription = (options: CheckoutSelectedOption[] | GuestCartItem['selectedOptions']) =>
  options?.map((option) => `${option.groupName}: ${option.optionName}`).join(' / ') || '';

const getSpecificationDescription = (specification?: ProductSpecification) =>
  [specification?.size || '-', specification?.materials || '-', specification?.case || '-'].join(' / ');

const OrderItemSection = ({
  product,
  productDesign,
  productDesignContent,
  selectedOptions,
  quantity,
  cartItems,
}: OrderItemSectionProps) => {
  const { t: tCommon } = useTranslation('common');
  const optionAdditionalPrice = selectedOptions.reduce((sum, option) => sum + option.additionalPrice, 0);
  const productItem = product
    ? [
        {
          id: product.id,
          image: product.first_image || Product1,
          title: product.name.ko || product.name.en || product.slug,
          description: getOptionsDescription(selectedOptions) || '-',
          specification: getSpecificationDescription(product.specification || undefined),
          content: productDesignContent,
          designId: productDesign?.id,
          previewFront: productDesign?.previewFront,
          previewBack: productDesign?.previewBack,
          design: productDesign?.state,
          quantity,
          price: ((product.selling_price || 0) + optionAdditionalPrice) * quantity,
        },
      ]
    : [];
  const items = cartItems
    ? cartItems.map((item) => ({
        id: item.id,
        image: item.productImage || Product1,
        title: item.productName || item.productSlug || '-',
        description: getOptionsDescription(item.selectedOptions) || '-',
        specification: getSpecificationDescription(item.specification),
        content: item.designContentId ? item.content : undefined,
        designId: item.designId,
        previewFront: item.previewFront,
        previewBack: item.previewBack,
        design: item.design,
        quantity: item.quantity,
        price: (item.price || 0) * item.quantity,
      }))
    : productItem;

  return (
    <section className='space-y-3 rounded-lg border border-neutral-200 p-3 md:p-4'>
      <div className='flex items-center gap-1.5'>
        <PackageIcon className='size-5 text-neutral-400' weight='duotone' />
        <p className='text-md font-bold'>{tCommon('title.ordered_items')}</p>
      </div>
      <div className='space-y-2'>
        {items.map((item) => (
          <OrderItemCard
            key={item.id}
            image={item.image}
            title={item.title}
            description={item.description}
            specification={item.specification}
            content={item.content}
            designId={item.designId}
            previewFront={item.previewFront}
            previewBack={item.previewBack}
            design={item.design}
            quantity={item.quantity}
            price={item.price}
          />
        ))}
      </div>
    </section>
  );
};

export default OrderItemSection;
