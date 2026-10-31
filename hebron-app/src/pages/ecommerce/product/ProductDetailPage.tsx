import AppBreadcrumb from '@/components/breadcrumb/AppBreadcrumb';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/contexts/AuthContext';
import { readProductDesign } from '@/data/design/product-design.service';
import { useProductDetailBySlugQuery } from '@/data/products/products.query';
import { useShoppingSettingsQuery } from '@/data/shopping-settings/shopping-settings.query';
import { cn } from '@/lib/utils';
import { MY_ROUTE } from '@/utils/constants/route.constant';
import type { ProductDesign } from '@/utils/helper/guest-cart.helper';
import { CaretUpIcon } from '@phosphor-icons/react';
import DOMPurify from 'dompurify';
import { useInView } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { Navigate, useParams, useSearchParams } from 'react-router-dom';
import ProductDescription from './components/detail/ProductDescription';
import ProductLeft from './components/detail/ProductLeft';
import ProductRelated from './components/detail/ProductRelated';
import ProductRight from './components/detail/ProductRight';
import type { ProductTabKey } from './components/detail/ProductTabs';
import ProductTabs from './components/detail/ProductTabs';

const ProductDetailPage = () => {
  const { isAdmin } = useAuth();
  const { productSlug = '' } = useParams<{ productSlug: string }>();
  const [searchParams] = useSearchParams();
  const designId = searchParams.get('design')?.trim() || '';
  const [activeTab, setActiveTab] = useState<ProductTabKey>('info');
  const [productDesign, setProductDesign] = useState<ProductDesign>();
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [productMediaEl, setProductMediaEl] = useState<HTMLDivElement | null>(null);
  const productMediaRef = useMemo(() => ({ current: productMediaEl }), [productMediaEl]);
  const productMediaViewMargin = useMemo(() => {
    const rootFontSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const offset = (9.25 + 1.5) * rootFontSize;
    return `-${offset}px 0px 0px 0px` as `${number}px ${number}px ${number}px ${number}px`;
  }, []);
  const productMediaInView = useInView(productMediaRef, {
    initial: true,
    amount: 'some',
    margin: productMediaViewMargin,
  });
  const { data: dataProduct, isLoading, isError } = useProductDetailBySlugQuery(productSlug);
  const { data: shoppingSettings = [] } = useShoppingSettingsQuery();
  const activeShoppingSetting =
    activeTab === 'info' ? undefined : shoppingSettings.find((item) => `setting-${item.id}` === activeTab);

  useEffect(() => {
    // A related-product link normally has no design query. Clear the previous
    // product's design so it cannot be attached to the newly loaded product.
    if (!designId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProductDesign(undefined);
      return;
    }

    let cancelled = false;
    // Do not render the previous design while the requested design is loading.
    setProductDesign(undefined);
    void readProductDesign(designId).then((design) => {
      if (!cancelled && design && (!design.productSlug || design.productSlug === productSlug)) {
        setProductDesign(design);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [designId, productSlug]);

  useEffect(() => {
    const handleScroll = () => setShowScrollToTop(window.scrollY > 240);

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToTop = () => window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });

  if (!productSlug || isError || (!isLoading && !dataProduct)) {
    return <Navigate to={MY_ROUTE.PRODUCT_LIST} replace />;
  }

  if (isLoading || !dataProduct) {
    return (
      <div className='flex min-h-64 items-center justify-center'>
        <Spinner className='size-8 text-neutral-500' />
      </div>
    );
  }

  return (
    <section className='relative space-y-4 pb-6'>
      <div className='hidden md:block'>
        <AppBreadcrumb />
      </div>
      <section className='flex flex-col gap-6 md:flex-row md:items-start md:gap-12'>
        <div className='min-w-0 space-y-4 md:flex-1'>
          <div ref={setProductMediaEl}>
            <ProductLeft key={dataProduct.id} product={dataProduct} productDesign={productDesign} isAdmin={isAdmin} />
          </div>

          <section>
            <ProductTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              settings={shoppingSettings}
              className={cn(
                !productMediaInView &&
                  'md:sticky md:top-[calc(9.25rem+var(--ecommerce-header-gap))] md:z-20 md:before:pointer-events-none md:before:absolute md:before:inset-x-0 md:before:bottom-full md:before:h-[var(--ecommerce-header-gap)] md:before:bg-white md:before:content-[""]',
              )}
            />
            <div className='py-6'>
              {activeTab === 'info' && <ProductDescription product={dataProduct} />}
              {activeShoppingSetting && (
                <div className='app-rich-text-editor__content cursor-default overflow-hidden rounded-lg border border-neutral-200'>
                  <div
                    className='tiptap'
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(activeShoppingSetting.content || '') }}
                  />
                </div>
              )}
            </div>
          </section>

          <ProductRelated product={dataProduct} />
        </div>
        <aside className='scrollbar-hide min-w-0 pb-10 md:sticky md:top-[calc(9.25rem+var(--ecommerce-header-gap))] md:max-h-[calc(100dvh-9.25rem-var(--ecommerce-header-gap))] md:w-106.5 md:shrink-0 md:self-start md:overflow-y-auto'>
          <ProductRight product={dataProduct} hidePurchaseActions={isAdmin} />
        </aside>
      </section>
      {showScrollToTop && (
        <Button
          type='button'
          variant='outline'
          size='icon'
          aria-label='Scroll to top'
          onClick={handleScrollToTop}
          className='fixed right-4 bottom-24 z-40 size-12 rounded-full bg-white shadow-md hover:bg-neutral-50 md:right-8 md:bottom-8'>
          <CaretUpIcon className='size-5 text-neutral-950' weight='bold' />
        </Button>
      )}
    </section>
  );
};

export default ProductDetailPage;
