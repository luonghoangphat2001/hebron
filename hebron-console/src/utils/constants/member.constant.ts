import { MemberType } from '../enums/common.enum';
import { MemberStatus } from '../enums/member.enum';

export const MEMBER_STATUS_BADGE: Record<MemberStatus, string> = {
  [MemberStatus.ACTIVE]: 'bg-green-100 text-green-600 rounded-sm',
  [MemberStatus.INACTIVE]: 'bg-gray-100 text-gray-600 rounded-sm',
  [MemberStatus.BLOCKED]: 'bg-red-100 text-red-600 rounded-sm',
};

export const MEMBER_TYPE_BADGE: Record<MemberType, string> = {
  [MemberType.INDIVIDUAL]: 'bg-blue-100 text-blue-600 rounded-sm dark:bg-blue-950 dark:text-blue-400',
  [MemberType.BUSINESS]: 'bg-purple-100 text-purple-600 rounded-sm dark:bg-purple-950 dark:text-purple-400',
};
