import { BrandScrollReveal } from '@/components/brand/BrandScrollReveal';
import AppBreadcrumb from '@/components/breadcrumb/AppBreadcrumb';
import { Spinner } from '@/components/ui/spinner';
import { useProductDetailBySlugQuery } from '@/data/products/products.query';
import BrandHeroSection from '@/pages/brand/components/BrandHeroSection';
import { BRAND_ROUTE, getBrandProductsPath } from '@/utils/constants/route.constant';
import { SearchParams } from '@/utils/enums/common.enum';
import { getLocalizedName } from '@/utils/helper/product-picker.helper';
import { Navigate, useParams } from 'react-router-dom';
import BrandProductLeft from './components/detail/BrandProductLeft';
import BrandProductRight from './components/detail/BrandProductRight';
import BrandProductTabs from './components/detail/BrandProductTabs';

export const BrandProductDetailPage = () => {
  const { productSlug = '' } = useParams<{ productSlug: string }>();
  const { data: product, isLoading, isError } = useProductDetailBySlugQuery(productSlug);

  if (!productSlug || isError) {
    return <Navigate to={BRAND_ROUTE.PRODUCTS} replace />;
  }

  if (isLoading || !product) {
    return (
      <main className='flex min-h-screen items-center justify-center bg-neutral-950'>
        <Spinner className='size-8 text-neutral-500' />
      </main>
    );
  }

  const title = getLocalizedName(product.name);
  const rootCategory = product.categories.find((category) => category.parent_id === null);
  const productCategory = rootCategory ?? product.categories.at(-1);
  const categoryProductsPath = rootCategory
    ? `${getBrandProductsPath()}?${SearchParams.PARENT_CATEGORY}=${encodeURIComponent(rootCategory.slug)}`
    : getBrandProductsPath();

  return (
    <main className='min-w-0 overflow-x-hidden bg-neutral-950'>
      {/* Hero Banner with Product Title */}
      <BrandHeroSection className='h-[240px] min-h-[240px] md:h-[320px] md:min-h-[320px]' bottomFadeClassName='h-16 md:h-24'>
        <div className='flex flex-1 flex-col items-center justify-end px-4 pb-8 md:pb-16'>
          <BrandScrollReveal variant='fadeUp'>
            <h1 className='text-center text-2xl font-semibold text-white sm:text-3xl md:text-[48px] md:leading-[60px]'>
              {title}
            </h1>
          </BrandScrollReveal>
        </div>
      </BrandHeroSection>

      {/* Product Content Section */}
      <section className='mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-4 py-8 md:px-8 md:py-12'>
        <div className='mb-2 hidden md:block'>
          <AppBreadcrumb
            variant='dark'
            items={[
              { label: '홈', href: BRAND_ROUTE.HOME },
              ...(productCategory ? [{ label: getLocalizedName(productCategory.name), href: categoryProductsPath }] : []),
              { label: title },
            ]}
          />
        </div>

        {/* Product Details (Images + Info) */}
        <div className='flex flex-col gap-8 md:flex-row md:gap-12'>
          <BrandProductLeft product={product} />
          <BrandProductRight product={product} className='pt-0 md:pt-8' />
        </div>

        <BrandProductTabs product={product} />
      </section>
    </main>
  );
};

export default BrandProductDetailPage;
