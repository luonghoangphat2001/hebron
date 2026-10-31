import PageTitle from '@/components/PageTitle';
import { Skeleton } from '@/components/ui/skeleton';
import { useProductDetailQuery } from '@/data/product/product.query';
import { MY_ROUTE } from '@/utils/constants/route.constant';
import { useCan, useMenuAccess } from '@/hooks/useMenuAccess';
import { useTranslation } from 'react-i18next';
import { Navigate, useParams } from 'react-router-dom';
import ProductForm from '../components/management/ProductForm';

export function ProductCreatePage() {
  const { t } = useTranslation('product');
  return <ProductForm title={t('modal.create_title')} />;
}

const ProductFormSkeleton = () => (
  <main className='space-y-6 pb-16'>
    <div className='flex items-center gap-4'>
      <Skeleton className='size-8 rounded-md' />
      <Skeleton className='h-8 w-48' />
    </div>
    <div className='grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]'>
      <div className='space-y-6'>
        <Skeleton className='h-64 w-full' />
        <Skeleton className='h-40 w-full' />
        <Skeleton className='h-56 w-full' />
        <Skeleton className='h-64 w-full' />
      </div>
      <div className='space-y-6'>
        <Skeleton className='h-28 w-full' />
        <Skeleton className='h-64 w-full' />
        <Skeleton className='h-48 w-full' />
        <Skeleton className='h-32 w-full' />
        <Skeleton className='h-72 w-full' />
      </div>
    </div>
  </main>
);

function ProductDetail({ readOnly }: { readOnly: boolean }) {
  const { t } = useTranslation('product');
  const { t: tSidebar } = useTranslation('sidebar');
  const can = useCan();
  const { isLoading: isPermissionLoading } = useMenuAccess();
  const id = Number(useParams().id);
  const validId = Number.isFinite(id) && id > 0;
  const { data: detail, isLoading } = useProductDetailQuery(validId ? id : undefined, { refetchOnWindowFocus: true });

  if (!validId || (!isLoading && !detail)) {
    return (
      <main className='space-y-5'>
        <PageTitle title={tSidebar('product_list')} returnLink={MY_ROUTE.PRODUCT.LIST} />
        <p className='text-muted-foreground text-sm'>{t('empty')}</p>
      </main>
    );
  }

  if (isLoading) return <ProductFormSkeleton />;

  if (!readOnly && !isPermissionLoading && !can('edit')) return <Navigate to={MY_ROUTE.PRODUCT.DETAIL(id)} replace />;

  return (
    <ProductForm
      title={t(readOnly ? 'modal.detail_title' : 'modal.edit_title')}
      productId={id}
      existing={detail}
      readOnly={readOnly}
    />
  );
}

export const ProductEditPage = () => <ProductDetail readOnly={false} />;
export const ProductDetailPage = () => <ProductDetail readOnly />;
