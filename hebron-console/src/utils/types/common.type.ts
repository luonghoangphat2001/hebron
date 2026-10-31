import type { LucideIcon } from 'lucide-react';
import type { User } from './user.type';

export type SideBarSubItemType = {
  title: string;
  url: string;
  items?: SideBarSubItemType[];
};

export type SideBarItemType = {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: SideBarSubItemType[];
};

export type UserInfoLocalStorage = User;
