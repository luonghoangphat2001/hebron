import Footer from '@/components/footer/Footer';
import SmoothScrollProvider from '@/components/SmoothScrollProvider';
import { useBrandScrollToTop } from '@/hooks/useBrandScrollToTop';
import { Outlet } from 'react-router-dom';

const BrandScrollManager = () => {
  useBrandScrollToTop();
  return null;
};

const BrandLayout = () => {
  return (
    <SmoothScrollProvider>
      <BrandScrollManager />
      <div className='min-w-0 overflow-x-hidden bg-neutral-950'>
        <Outlet />
        <Footer type='brand' />
      </div>
    </SmoothScrollProvider>
  );
};

export default BrandLayout;
