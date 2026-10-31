import { BellIcon, ChatCircleTextIcon, ShoppingBagIcon } from '@phosphor-icons/react';
import type { CategoryBadgeConfig } from '@/utils/types/notification.type';

export const getCategoryBadgeConfig = (category: string): CategoryBadgeConfig => {
  switch (category) {
    case 'ORDER':
      return {
        label: '주문',
        icon: <ShoppingBagIcon className='size-4' weight='fill' />,
        badgeClass: 'bg-blue-50 text-blue-600 border-blue-200/60',
        circleClass: 'bg-blue-100 text-blue-600',
      };
    case 'INQUIRY':
      return {
        label: '문의 답변',
        icon: <ChatCircleTextIcon className='size-4' weight='fill' />,
        badgeClass: 'bg-emerald-50 text-emerald-600 border-emerald-200/60',
        circleClass: 'bg-emerald-100 text-emerald-600',
      };
    default:
      return {
        label: '일반',
        icon: <BellIcon className='size-4' weight='fill' />,
        badgeClass: 'bg-neutral-50 text-neutral-600 border-neutral-200',
        circleClass: 'bg-neutral-100 text-neutral-600',
      };
  }
};
