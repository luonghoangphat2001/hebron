import type { ProductItemRESP } from '@/data/products/products.response';
import { useTranslation } from 'react-i18next';

const ProductInfo = ({ product }: { product: ProductItemRESP }) => {
  const { t: tCommon } = useTranslation('common');
  const specification = product.specification;

  const productInfoRows = [
    { label: tCommon('title.material'), value: specification?.materials || '-' },
    { label: tCommon('title.size'), value: specification?.size || '-' },
    { label: tCommon('title.production_period'), value: specification?.product_period || '-' },
    { label: tCommon('title.packaging'), value: specification?.case || '-' },
    { label: tCommon('title.minimum_order'), value: `${product.min_quantity || 1}개` },
    { label: tCommon('title.shipping_information'), value: specification?.shipping_info || '-' },
    { label: tCommon('title.weight'), value: specification?.weight || '-' },
  ];

  return (
    <div className='overflow-hidden rounded-md border border-neutral-200'>
      {productInfoRows.map((row) => (
        <div
          key={row.label}
          className='grid grid-cols-[7rem_minmax(0,1fr)] border-b border-neutral-200 last:border-b-0 md:grid-cols-[9.6875rem_minmax(0,1fr)]'>
          <div className='border-r border-neutral-200 bg-neutral-50 px-3 py-4.5 text-sm text-neutral-500'>{row.label}</div>
          <div className='text-md min-w-0 px-3 py-4 break-keep'>{row.value}</div>
        </div>
      ))}
    </div>
  );
};

export default ProductInfo;
