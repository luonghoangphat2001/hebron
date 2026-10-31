import { Button } from '@/components/ui/button';
import type { SteadySellerSectionView } from '@/data/pages/home-mall.service';
import type { ProductItemRESP } from '@/data/products/products.response';
import { useIsMobile } from '@/hooks/useIsMobile';
import { MY_ROUTE, getProductListByCategoryPath } from '@/utils/constants/route.constant';
import { ArrowLeftIcon, ArrowRightIcon } from '@phosphor-icons/react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../../product/components/ProductCard';
import ProductSortOption from '../../product/components/ProductSortOption';

const PRODUCTS_PER_SLIDE = 10;
const MOBILE_PRODUCTS_PER_SLIDE = 4;

type SteadySellerSectionProps = {
  data?: SteadySellerSectionView;
};

const SteadySellerSection = ({ data }: SteadySellerSectionProps) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const [selectedCategorySlug, setSelectedCategorySlug] = useState('');
  const [activeSlide, setActiveSlide] = useState(0);

  const categories = useMemo(() => data?.categories ?? [], [data?.categories]);

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const effectiveCategorySlug = useMemo(() => {
    if (selectedCategorySlug) return selectedCategorySlug;
    if (data?.defaultCategorySlug) {
      const match = categories.find((c) => c.slug === data.defaultCategorySlug);
      if (match && match.products.length > 0) return match.slug;
    }
    const firstWithProducts = categories.find((c) => c.products.length > 0);
    if (firstWithProducts) return firstWithProducts.slug;
    return data?.defaultCategorySlug || categories[0]?.slug || '';
  }, [selectedCategorySlug, data?.defaultCategorySlug, categories]);

  const activeCategory = useMemo(
    () => categories.find((c) => c.slug === effectiveCategorySlug) ?? categories[0],
    [categories, effectiveCategorySlug],
  );

  const products = useMemo<ProductItemRESP[]>(() => {
    if (activeCategory?.products && activeCategory.products.length > 0) {
      return activeCategory.products;
    }
    return data?.products ?? [];
  }, [activeCategory, data?.products]);

  const productsPerSlide = isMobile ? MOBILE_PRODUCTS_PER_SLIDE : PRODUCTS_PER_SLIDE;

  const productSlides = useMemo(() => {
    if (!products.length) return [];
    const slides: ProductItemRESP[][] = [];
    for (let i = 0; i < products.length; i += productsPerSlide) {
      slides.push(products.slice(i, i + productsPerSlide));
    }
    return slides;
  }, [products, productsPerSlide]);

  const safeActiveSlide = Math.min(activeSlide, Math.max(0, productSlides.length - 1));

  const handleSelectCategory = (slug: string) => {
    setSelectedCategorySlug(slug);
    setActiveSlide(0);
  };

  const goToPreviousSlide = () => {
    if (productSlides.length <= 1) return;
    setActiveSlide((current) => (current === 0 ? productSlides.length - 1 : current - 1));
  };

  const goToNextSlide = () => {
    if (productSlides.length <= 1) return;
    setActiveSlide((current) => (current === productSlides.length - 1 ? 0 : current + 1));
  };

  const toProductList = () => {
    if (data?.viewAllLink) {
      if (/^https?:\/\//i.test(data.viewAllLink)) {
        window.location.href = data.viewAllLink;
        return;
      }
      navigate(data.viewAllLink);
      return;
    }
    navigate(effectiveCategorySlug ? getProductListByCategoryPath(effectiveCategorySlug) : MY_ROUTE.PRODUCT_LIST);
  };

  if (!categories.length && !products.length) return null;

  return (
    <section className='space-y-4 md:space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-xl font-bold tracking-tight md:text-2xl lg:text-3xl'>{data?.title || 'STEADY SELLER'}</h2>
        <Button variant='outline' className='hidden md:inline-flex' onClick={toProductList}>
          {data?.viewAllLabel || '전체보기'} <ArrowRightIcon size={20} />
        </Button>
        {productSlides.length > 1 && (
          <div className='flex gap-2 md:hidden'>
            <button
              type='button'
              aria-label='Previous products'
              className='cursor-pointer rounded-full border border-neutral-200 p-2 text-neutral-950 transition hover:bg-neutral-50'
              onClick={goToPreviousSlide}>
              <ArrowLeftIcon size={20} />
            </button>
            <button
              type='button'
              aria-label='Next products'
              className='cursor-pointer rounded-full border border-neutral-200 p-2 text-neutral-950 transition hover:bg-neutral-50'
              onClick={goToNextSlide}>
              <ArrowRightIcon size={20} />
            </button>
          </div>
        )}
      </div>

      {categories.length > 0 && (
        <div className='flex min-w-0 items-center justify-between gap-4'>
          <div className='scrollbar-hide flex max-w-full min-w-0 gap-2 overflow-x-auto py-1'>
            {categories.map((category) => (
              <ProductSortOption
                key={category.slug || category.id}
                label={category.label || category.slug}
                selected={activeCategory?.slug === category.slug}
                onClick={() => handleSelectCategory(category.slug)}
              />
            ))}
          </div>
          {productSlides.length > 1 && (
            <div className='hidden shrink-0 gap-2 md:flex'>
              <button
                type='button'
                aria-label='Previous products'
                className='cursor-pointer rounded-full border border-neutral-200 p-2 text-neutral-950 transition hover:bg-neutral-100'
                onClick={goToPreviousSlide}>
                <ArrowLeftIcon size={20} />
              </button>
              <button
                type='button'
                aria-label='Next products'
                className='cursor-pointer rounded-full border border-neutral-200 p-2 text-neutral-950 transition hover:bg-neutral-100'
                onClick={goToNextSlide}>
                <ArrowRightIcon size={20} />
              </button>
            </div>
          )}
        </div>
      )}

      <div className='overflow-hidden'>
        {productSlides.length > 0 ? (
          <div
            className='flex gap-4 transition-transform duration-500 ease-out lg:gap-5'
            style={{ transform: `translateX(calc(-${safeActiveSlide} * (100% + ${isMobile ? '1rem' : '1.25rem'})))` }}>
            {productSlides.map((slide, index) => (
              <div key={index} className='grid w-full shrink-0 grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5 lg:gap-5'>
                {slide.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <p className='flex min-h-40 items-center justify-center text-sm text-neutral-500'>표시할 상품이 없습니다.</p>
        )}
      </div>

      <Button variant='outline' className='w-full md:hidden' onClick={toProductList}>
        {data?.viewAllLabel || '전체보기'} <ArrowRightIcon size={20} />
      </Button>
    </section>
  );
};

export default SteadySellerSection;
