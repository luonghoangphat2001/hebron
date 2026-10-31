import MyPageSidebar from '@/pages/ecommerce/my-page/components/MyPageSidebar';
import { Outlet } from 'react-router-dom';

const MyPageLayout = () => {
  return (
    <div className='w-full min-w-0 bg-white pb-8 md:py-10'>
      <div className='flex w-full min-w-0 flex-col gap-6 md:flex-row md:items-start md:gap-8'>
        <MyPageSidebar className='hidden md:flex md:w-47 md:shrink-0' />
        <main className='flex min-w-0 flex-1 flex-col'>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MyPageLayout;
