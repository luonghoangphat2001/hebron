import { IconAva } from '@/assets/images';
import { Typography } from '@/components/typography/Typography';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import MyPageLogoutButton from '@/pages/ecommerce/my-page/components/MyPageLogoutButton';
import { MY_PAGE_CUSTOMER_CENTER, MY_PAGE_NAV_GROUPS } from '@/utils/constants/my-page.constant';
import { MY_ROUTE } from '@/utils/constants/route.constant';
import { isMyPageNavItemActive } from '@/utils/helper/my-page-nav.helper';
import { CameraIcon, HeadsetIcon } from '@phosphor-icons/react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

type MyPageSidebarProps = {
  className?: string;
};

const MyPageSidebar = ({ className }: MyPageSidebarProps) => {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const backToDashboard = () => {
    navigate(MY_ROUTE.MY_PAGE.HOME);
  };

  return (
    <aside className={cn('flex w-full flex-col gap-6 bg-white', className)}>
      <div className='flex flex-col gap-4'>
        <div
          className='cursor-pointer overflow-hidden rounded-xl bg-linear-to-b from-rose-100/80 via-rose-50/40 to-white p-4 pt-8 transition-all hover:from-rose-100 hover:via-rose-50'
          onClick={backToDashboard}>
          <div className='flex flex-col items-center gap-3'>
            <div className='relative shrink-0'>
              <div className='flex size-16 items-center justify-center rounded-full border-[3px] border-white bg-rose-200/60 shadow-sm'>
                <img src={IconAva} alt='' className='size-5' aria-hidden />
              </div>
              <button
                type='button'
                className='absolute -right-0.5 -bottom-0.5 flex size-5 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-sm'
                aria-label='프로필 사진 변경'>
                <CameraIcon className='size-3 text-neutral-600' weight='duotone' />
              </button>
            </div>
            <div className='flex min-w-0 flex-1 flex-col items-center gap-0.5 pb-0.5'>
              <Typography weight='bold' className='text-md truncate'>
                {user?.name || ''}
              </Typography>
              {user?.company_name ? (
                <Typography className='truncate text-sm text-neutral-500'>{user.company_name}</Typography>
              ) : null}
            </div>
          </div>
        </div>

        <nav className='flex flex-col gap-4'>
          {MY_PAGE_NAV_GROUPS.map((group) => (
            <div key={group.key} className='flex flex-col gap-1'>
              {group.title && (
                <Typography weight='bold' className='text-sm'>
                  {group.title}
                </Typography>
              )}
              <ul className='flex flex-col gap-0.5'>
                {group.items.map((item) => {
                  const isActive = isMyPageNavItemActive(pathname, item.href);

                  return (
                    <li key={item.key}>
                      <Link
                        to={item.href}
                        className={cn(
                          'block rounded-md px-3 py-2 transition-colors',
                          isActive
                            ? 'bg-neutral-100 font-semibold text-neutral-950'
                            : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950',
                        )}>
                        <Typography as='span' variant='body-sm' weight={isActive ? 'semibold' : 'regular'}>
                          {item.label}
                        </Typography>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <MyPageLogoutButton />
      </div>

      <div className='flex flex-col gap-3 rounded-lg bg-neutral-50 p-4'>
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
    </aside>
  );
};

export default MyPageSidebar;
