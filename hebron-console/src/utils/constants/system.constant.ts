import { LogAction } from '@/utils/enums/common.enum';
import { ConnectionStatus, TaskType, UserRole } from '@/utils/enums/system.enum';

export const TASK_TYPE_BADGE: Record<string, string> = {
  [TaskType.REGISTER]: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
  [TaskType.MODIFY]: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400',
  [TaskType.DELETE]: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
  [TaskType.APPROVAL]: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
};

export const OPERATION_LOG_ACTION_BADGE: Record<string, string> = {
  register: 'bg-blue-100 text-blue-600 rounded-sm',
  REGISTER: 'bg-blue-100 text-blue-600 rounded-sm',
  modify: 'bg-yellow-100 text-yellow-700 rounded-sm',
  MODIFY: 'bg-yellow-100 text-yellow-700 rounded-sm',
  delete: 'bg-red-100 text-red-600 rounded-sm',
  DELETE: 'bg-red-100 text-red-600 rounded-sm',
  approval: 'bg-purple-100 text-purple-600 rounded-sm',
  APPROVAL: 'bg-purple-100 text-purple-600 rounded-sm',
  [LogAction.CREATED]: 'bg-blue-100 text-blue-600 rounded-sm',
  [LogAction.UPDATED]: 'bg-yellow-100 text-yellow-700 rounded-sm',
  [LogAction.DELETED]: 'bg-red-100 text-red-600 rounded-sm',
};

export const CONNECTION_LOG_STATUS_BADGE: Record<ConnectionStatus, string> = {
  [ConnectionStatus.SUCCESS]: 'bg-green-100 text-green-600 rounded-sm',
  [ConnectionStatus.FAILURE]: 'bg-red-100 text-red-600 rounded-sm',
};

export const CONNECTION_LOG_ROLE_BADGE: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'bg-purple-100 text-purple-700 rounded-sm',
  [UserRole.MANAGER]: 'bg-blue-100 text-blue-700 rounded-sm',
  [UserRole.CUSTOMER]: 'bg-gray-100 text-gray-600 rounded-sm',
};

export const ACCESS_LOG_EVENT_TYPE_BADGE: Record<string, string> = {
  login: 'bg-blue-100 text-blue-700 rounded-sm',
  LOGIN: 'bg-blue-100 text-blue-700 rounded-sm',
  logout: 'bg-gray-100 text-gray-700 rounded-sm',
  LOGOUT: 'bg-gray-100 text-gray-700 rounded-sm',
  login_failed: 'bg-red-100 text-red-700 rounded-sm',
  LOGIN_FAILED: 'bg-red-100 text-red-700 rounded-sm',
};
