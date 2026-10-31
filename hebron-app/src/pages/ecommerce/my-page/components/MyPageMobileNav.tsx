import { Typography } from '@/components/typography/Typography';
import { cn } from '@/lib/utils';
import MyPageLogoutButton from '@/pages/ecommerce/my-page/components/MyPageLogoutButton';
import { useMyPageMobileNav } from '@/pages/ecommerce/my-page/context/MyPageMobileNavContext';
import { MY_PAGE_CUSTOMER_CENTER, MY_PAGE_NAV_GROUPS } from '@/utils/constants/my-page.constant';
import { isMyPageNavItemActive } from '@/utils/helper/my-page-nav.helper';
import { HeadsetIcon, XIcon } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';

const OVERLAY_TRANSITION = { duration: 0.36, ease: [0.4, 0, 0.2, 1] as const };
const DRAWER_TRANSITION = { duration: 0.42, ease: [0.32, 0.72, 0, 1] as const };

const MyPageMobileNav = () => {
  const { pathname } = useLocation();
  const { open, setOpen } = useMyPageMobileNav();

  useEffect(() => {
    setOpen(false);
  }, [pathname, setOpen]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, setOpen]);

  return createPortal(
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            key='my-page-nav-overlay'
            type='button'
            aria-label='마이페이지 메뉴 닫기'
            className='fixed inset-0 z-50 bg-black/40'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={OVERLAY_TRANSITION}
            onClick={() => setOpen(false)}
          />

          <motion.aside
            key='my-page-nav-drawer'
            role='dialog'
            aria-modal='true'
            aria-label='마이페이지 메뉴'
            className='fixed inset-y-0 right-0 z-50 flex w-[70%] max-w-80 flex-col border-l border-neutral-200 bg-white shadow-xl'
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={DRAWER_TRANSITION}>
            <button
              type='button'
              onClick={() => setOpen(false)}
              className='absolute top-6 -left-5 z-10 flex size-10 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-sm'
              aria-label='메뉴 닫기'>
              <XIcon className='size-5 cursor-pointer text-neutral-950' weight='bold' />
            </button>

            <div className='flex h-full flex-col gap-6 overflow-y-auto px-3 pt-12'>
              <nav className='flex flex-col'>
                {MY_PAGE_NAV_GROUPS.map((group, groupIndex) => (
                  <div
                    key={group.key}
                    className={cn('flex flex-col gap-2 py-5', groupIndex > 0 && 'border-t border-neutral-200')}>
                    {group.title && (
                      <Typography weight='bold' className='text-md text-neutral-950'>
                        {group.title}
                      </Typography>
                    )}
                    <ul className='flex flex-col gap-1'>
                      {group.items.map((item) => {
                        const isActive = isMyPageNavItemActive(pathname, item.href);

                        return (
                          <li key={item.key}>
                            <Link
                              to={item.href}
                              onClick={() => setOpen(false)}
                              className={cn(
                                'text-md block rounded-md px-3 py-2 transition-colors',
                                isActive
                                  ? 'bg-neutral-100 font-semibold text-neutral-950'
                                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950',
                              )}>
                              {item.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </nav>

              <MyPageLogoutButton onLoggedOut={() => setOpen(false)} />

              <div className='mt-auto flex flex-col gap-3 rounded-lg bg-neutral-50 p-4'>
                <HeadsetIcon className='text-blue-brand size-8' weight='duotone' />
                <div className='flex flex-col gap-3'>
                  {MY_PAGE_CUSTOMER_CENTER.map((item) => (
                    <div key={item.label} className='flex flex-col gap-0.5'>
                      <Typography variant='caption' className='text-sm text-neutral-500'>
                        {item.label}
                      </Typography>
                      <Typography weight='bold' className='text-xl text-neutral-950'>
                        {item.value}
                      </Typography>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
};

export default MyPageMobileNav;
