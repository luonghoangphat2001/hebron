import LanguageSelect from '@/components/select/LanguageSelect';
import { AppSidebar } from '@/components/sidebar/AppSidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useMenuAccess } from '@/hooks/useMenuAccess';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation } from 'react-router-dom';

const MainLayout = () => {
  const { t: tCommon } = useTranslation('common');
  const location = useLocation();
  const { canAccess, isLoading } = useMenuAccess();

  if (isLoading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <Loader2 className='text-muted-foreground size-6 animate-spin' />
      </div>
    );
  }

  return (
    <div className='h-dvh overflow-hidden'>
      <SidebarProvider className='h-full min-h-0'>
        <AppSidebar />
        <SidebarInset className='min-h-0 w-auto min-w-0'>
          <header className='flex h-14 shrink-0 items-center justify-between gap-2 border-b px-4'>
            <SidebarTrigger className='-ml-1' />
            <LanguageSelect />
          </header>
          <div className='min-h-0 flex-1 overflow-auto p-6'>
            {canAccess(location.pathname) ? (
              <Outlet />
            ) : (
              <p className='text-muted-foreground py-20 text-center'>{tCommon('empty.no_permission')}</p>
            )}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};

export default MainLayout;
