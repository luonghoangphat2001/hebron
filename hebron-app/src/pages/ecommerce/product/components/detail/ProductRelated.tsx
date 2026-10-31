import { useProductSearchQuery } from '@/data/products/products.query';
import type { ProductItemRESP } from '@/data/products/products.response';
import type { MouseEvent } from 'react';
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ProductCard from '../ProductCard';

type ProductRelatedProps = {
  product: ProductItemRESP;
};

const ProductRelated = ({ product }: ProductRelatedProps) => {
  const { t: tCommon } = useTranslation('common');
  const relatedProductsRef = useRef<HTMLDivElement>(null);
  const dragStartXRef = useRef(0);
  const scrollStartLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const categoryIds = useMemo(
    () => [...new Set([...(product.category_ids ?? []), ...product.categories.map((category) => category.id)])],
    [product.category_ids, product.categories],
  );
  const { data } = useProductSearchQuery(
    {
      category_ids: categoryIds,
      per_page: 6,
      page: 1,
      sort_by: 'popular',
    },
    { enabled: categoryIds.length > 0 },
  );
  const products = (data?.data.products ?? []).filter((item) => item.id !== product.id).slice(0, 5);

  const handleDragStart = (event: MouseEvent<HTMLDivElement>) => {
    if (!relatedProductsRef.current) return;

    setIsDragging(true);
    hasDraggedRef.current = false;
    dragStartXRef.current = event.pageX;
    scrollStartLeftRef.current = relatedProductsRef.current.scrollLeft;
  };

  const handleDragMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !relatedProductsRef.current) return;

    const distance = event.pageX - dragStartXRef.current;
    if (Math.abs(distance) > 4) hasDraggedRef.current = true;

    relatedProductsRef.current.scrollLeft = scrollStartLeftRef.current - distance;
    event.preventDefault();
  };

  const handleDragEnd = () => setIsDragging(false);

  const handleClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (!hasDraggedRef.current) return;

    event.preventDefault();
    event.stopPropagation();
    hasDraggedRef.current = false;
  };

  if (products.length === 0) return null;

  return (
    <section>
      <p className='text-display-xs md:text-display-sm font-bold'>{tCommon('title.related_product')}</p>
      <div
        ref={relatedProductsRef}
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onClickCapture={handleClickCapture}
        onDragStart={(event) => event.preventDefault()}
        className={`scrollbar-hide mt-4 flex gap-4 overflow-x-auto select-none md:mt-8 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}>
        {products.map((product) => (
          <div key={product.id} className='w-35 shrink-0 md:w-60'>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductRelated;
