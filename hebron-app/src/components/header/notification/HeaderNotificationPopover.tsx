import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useNotification } from '@/hooks/useNotification';
import { cn } from '@/lib/utils';
import { NOTIFICATION_CATEGORY_FILTERS } from '@/utils/constants/notification.constant';
import type { NotificationCategory, NotificationItem } from '@/utils/types/notification.type';
import { BellIcon, BellSlashIcon, CheckIcon } from '@phosphor-icons/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationCard from './NotificationCard';

const HeaderNotificationPopover = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<NotificationCategory>('ALL');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotification({
    showToastOnReceive: false,
  });

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setOpen(true);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 180);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const filteredNotifications = useMemo(() => {
    if (activeCategory === 'ALL') return notifications;
    return notifications.filter((n) => n.category === activeCategory);
  }, [notifications, activeCategory]);

  const handleNotificationClick = async (item: NotificationItem) => {
    setOpen(false);

    if (!item.isRead) {
      await markAsRead(item.id);
    }

    if (item.link) {
      if (window.location.pathname === item.link) {
        window.location.reload();
        return;
      }
      if (item.link.startsWith('http')) {
        window.location.href = item.link;
        return;
      }

      navigate(item.link);
    }
  };

  return (
    <div className='relative inline-flex' onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type='button'
            variant='ghost'
            size='icon-sm'
            aria-label='알림'
            onClick={() => setOpen((prev) => !prev)}
            className='relative shrink-0 rounded-sm text-neutral-950 hover:bg-neutral-100'>
            <BellIcon className='size-5 md:size-6' />
            {unreadCount > 0 && (
              <span className='absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white'>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align='end'
          sideOffset={8}
          collisionPadding={12}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className='z-50 w-[calc(100vw-24px)] max-w-[480px] overflow-hidden rounded-2xl border border-neutral-200 bg-white p-0 shadow-2xl sm:w-[460px]'>
          {/* Header */}
          <div className='flex items-center justify-between border-b border-neutral-100 px-4 py-3 sm:py-3.5'>
            <div className='flex items-center gap-2'>
              <h3 className='text-sm font-bold text-neutral-900'>알림</h3>
              {unreadCount > 0 && (
                <span className='rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-600'>{unreadCount}</span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type='button'
                onClick={markAllAsRead}
                className='flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 active:bg-neutral-200'>
                <CheckIcon className='size-3.5' />
                <span>모두 읽음</span>
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className='scrollbar-none flex gap-1.5 overflow-x-auto border-b border-neutral-100 px-3.5 py-2'>
            {NOTIFICATION_CATEGORY_FILTERS.map((tab) => {
              const count =
                tab.key === 'ALL'
                  ? notifications.filter((n) => !n.isRead).length
                  : notifications.filter((n) => n.category === tab.key && !n.isRead).length;

              return (
                <button
                  key={tab.key}
                  type='button'
                  onClick={() => setActiveCategory(tab.key)}
                  className={cn(
                    'flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors',
                    activeCategory === tab.key
                      ? 'bg-neutral-900 font-semibold text-white'
                      : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100 active:bg-neutral-200',
                  )}>
                  <span>{tab.label}</span>
                  {count > 0 && (
                    <span
                      className={cn('flex size-1.5 rounded-full', activeCategory === tab.key ? 'bg-amber-400' : 'bg-red-500')}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Notification List */}
          <div className='max-h-[min(420px,65vh)] divide-y divide-neutral-100 overflow-y-auto'>
            {isLoading && notifications.length === 0 ? (
              <div className='divide-y divide-neutral-100'>
                {[1, 2, 3].map((i) => (
                  <div key={i} className='flex animate-pulse items-center gap-3 p-3.5'>
                    <div className='size-8 shrink-0 rounded-full bg-neutral-200' />
                    <div className='flex flex-1 flex-col gap-2 py-1'>
                      <div className='h-3 w-3/4 rounded bg-neutral-200' />
                      <div className='h-2.5 w-1/2 rounded bg-neutral-200' />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredNotifications.length > 0 ? (
              filteredNotifications.map((item) => (
                <NotificationCard key={item.id} item={item} variant='compact' onItemClick={handleNotificationClick} />
              ))
            ) : (
              <div className='flex flex-col items-center justify-center gap-2 py-12 text-center'>
                <div className='flex size-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-400'>
                  <BellSlashIcon className='size-6' />
                </div>
                <p className='text-xs font-medium text-neutral-500'>새로운 알림이 없습니다.</p>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default HeaderNotificationPopover;
