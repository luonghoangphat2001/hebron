import type { LucideIcon } from 'lucide-react';
import type { User } from './user.type';

export type SideBarItemType = {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
  }[];
};

export type UserInfoLocalStorage = User;
