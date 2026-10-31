import Footer from '@/components/footer/Footer';
import Header from '@/components/header/Header';
import { AuthProvider } from '@/contexts/AuthContext';
import { useScrolled } from '@/hooks/useScrolled';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { cn } from '@/lib/utils';
import MyPageMobileNav from '@/pages/ecommerce/my-page/components/MyPageMobileNav';
import { MyPageMobileNavProvider } from '@/pages/ecommerce/my-page/context/MyPageMobileNavContext';
import { isCompactMainPagePath, ROUTE_NAME } from '@/utils/constants/route.constant';
import { Outlet, useLocation } from 'react-router-dom';

const MainLayout = () => {
  const scrolled = useScrolled();
  const { pathname } = useLocation();
  const isMyPage = pathname.startsWith(ROUTE_NAME.MY_PAGE);
  const isCompactMainPage = isCompactMainPagePath(pathname);
  const isHomePage = pathname === ROUTE_NAME.HOME || pathname === '/';
  useScrollToTop();

  return (
    <AuthProvider>
      <MyPageMobileNavProvider>
        <div className='ecommerce-shell'>
          <Header />
          <main
            className={cn(
              'ecommerce-main-offset min-w-0 transition-all',
              !isHomePage && 'ecommerce-container',
              isCompactMainPage ? 'min-h-0' : 'min-h-300 flex-1',
              isMyPage ? 'ecommerce-main-offset--compact' : 'ecommerce-main-offset--default',
              scrolled && 'ecommerce-main-offset--scrolled',
            )}>
            <Outlet />
          </main>
          <Footer type='ecommerce' />
          <MyPageMobileNav />
        </div>
      </MyPageMobileNavProvider>
    </AuthProvider>
  );
};

export default MainLayout;
