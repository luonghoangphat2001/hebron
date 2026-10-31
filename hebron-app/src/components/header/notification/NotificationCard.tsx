import { Typography } from '@/components/typography/Typography';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { ArrowRightIcon, CheckCircleIcon, ClockIcon, EnvelopeOpenIcon } from '@phosphor-icons/react';
import React from 'react';
import type { CategoryBadgeConfig, NotificationItem } from '@/utils/types/notification.type';
import { getCategoryBadgeConfig } from '@/utils/helper/notification.helper';

export type NotificationCardProps = {
  item: NotificationItem;
  variant?: 'default' | 'compact';
  selectable?: boolean;
  isSelected?: boolean;
  categoryBadgeResolver?: (category: string) => CategoryBadgeConfig;
  onToggleSelect?: (id: string) => void;
  onItemClick?: (item: NotificationItem) => void;
  onToggleRead?: (id: string, e?: React.MouseEvent) => void;
  className?: string;
};

const NotificationCard = ({
  item,
  variant = 'default',
  selectable = true,
  isSelected = false,
  categoryBadgeResolver,
  onToggleSelect,
  onItemClick,
  onToggleRead,
  className,
}: NotificationCardProps) => {
  const badgeConfig = categoryBadgeResolver ? categoryBadgeResolver(item.category) : getCategoryBadgeConfig(item.category);

  if (variant === 'compact') {
    return (
      <div
        onClick={() => onItemClick?.(item)}
        className={cn(
          'group relative flex cursor-pointer gap-3 p-3.5 transition-colors hover:bg-neutral-50 active:bg-neutral-100/70',
          !item.isRead ? 'bg-blue-50/30' : 'bg-white',
          className,
        )}>
        {/* Icon */}
        <div className={cn('mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full', badgeConfig.circleClass)}>
          {badgeConfig.icon}
        </div>

        {/* Content */}
        <div className='flex min-w-0 flex-1 flex-col gap-1'>
          <div className='flex items-center justify-between gap-2'>
            <h4
              className={cn(
                'line-clamp-1 text-xs font-semibold',
                !item.isRead ? 'font-bold text-neutral-950' : 'text-neutral-700',
              )}>
              {item.title}
            </h4>
            <span className='shrink-0 text-[10px] text-neutral-400'>{item.createdAt}</span>
          </div>

          <p className='line-clamp-2 text-xs leading-relaxed text-neutral-500'>{item.message}</p>
        </div>

        {/* Unread indicator */}
        {!item.isRead && (
          <div className='flex shrink-0 items-center'>
            <span className='size-1.5 rounded-full bg-blue-600' aria-hidden />
          </div>
        )}
      </div>
    );
  }

  // Default Full Card Variant (For full notification page usage)
  return (
    <div
      onClick={() => onItemClick?.(item)}
      className={cn(
        'group relative flex cursor-pointer flex-col gap-3 rounded-2xl border bg-white p-4 transition-all hover:border-neutral-300 hover:shadow-xs sm:flex-row sm:items-start sm:gap-4 sm:p-5',
        !item.isRead ? 'border-neutral-200 bg-linear-to-r from-blue-50/20 via-white to-white' : 'border-neutral-200 bg-white',
        isSelected && 'border-blue-500 ring-2 ring-blue-500/20',
        className,
      )}>
      {/* Checkbox + Circle Icon */}
      <div className='flex items-center gap-3 sm:shrink-0 sm:pt-0.5'>
        {selectable && (
          <div onClick={(e) => e.stopPropagation()} className='flex items-center justify-center'>
            <Checkbox checked={isSelected} onCheckedChange={() => onToggleSelect?.(item.id)} aria-label={`${item.title} 선택`} />
          </div>
        )}

        <div
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-full transition-transform group-hover:scale-105',
            badgeConfig.circleClass,
          )}>
          {badgeConfig.icon}
        </div>
      </div>

      {/* Content Area */}
      <div className='flex min-w-0 flex-1 flex-col gap-1'>
        {/* Badges Row */}
        <div className='flex flex-wrap items-center gap-2'>
          <span
            className={cn(
              'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold',
              badgeConfig.badgeClass,
            )}>
            {badgeConfig.label}
          </span>

          {!item.isRead && (
            <span className='inline-flex items-center gap-1 rounded-md border border-blue-200/60 bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-600'>
              <span className='size-1.5 rounded-full bg-blue-600' />새 알림
            </span>
          )}

          <span className='ml-auto flex items-center gap-1 text-xs text-neutral-400 sm:ml-0'>
            <ClockIcon className='size-3.5' />
            {item.createdAt}
          </span>
        </div>

        {/* Title */}
        <Typography
          as='h3'
          weight={!item.isRead ? 'bold' : 'semibold'}
          className={cn('mt-0.5 text-sm leading-snug sm:text-base', !item.isRead ? 'text-neutral-950' : 'text-neutral-700')}>
          {item.title}
        </Typography>

        {/* Message body */}
        <Typography variant='body-sm' className='line-clamp-2 text-xs leading-relaxed text-neutral-600 sm:text-sm'>
          {item.message}
        </Typography>
      </div>

      {/* Action CTA & Icons */}
      {(item.link || onToggleRead) && (
        <div className='flex items-center justify-between gap-2 border-t border-neutral-100 pt-2 sm:shrink-0 sm:flex-col sm:items-end sm:justify-start sm:gap-3 sm:border-none sm:pt-0'>
          {item.link ? (
            <span className='inline-flex items-center gap-1 text-xs font-medium text-blue-600 group-hover:underline sm:text-sm'>
              <span>확인하기</span>
              <ArrowRightIcon className='size-3.5 transition-transform group-hover:translate-x-0.5' />
            </span>
          ) : (
            <span />
          )}

          {onToggleRead && (
            <button
              type='button'
              title={item.isRead ? '안 읽음으로 표시' : '읽음으로 표시'}
              aria-label={item.isRead ? '안 읽음으로 표시' : '읽음으로 표시'}
              onClick={(e) => {
                e.stopPropagation();
                onToggleRead(item.id, e);
              }}
              className='rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700'>
              {item.isRead ? <EnvelopeOpenIcon className='size-4' /> : <CheckCircleIcon className='size-4 text-blue-600' />}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCard;
