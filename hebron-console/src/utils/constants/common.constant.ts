import { Status } from '../enums/common.enum';
import type { PaginationREQ } from '../types/request.type';
import { MY_ROUTE } from './route.constant';

export const LANG = 'lang';
export const ACCESS_TOKEN = 'accessToken';
export const REFRESH_TOKEN = 'refreshToken';
export const USER_INFO = 'userInfo';
export const CALL_BACK_URL = 'callBackUrl';

export const DEFAULT_IMAGE = 'https://getuikit.com/v2/docs/images/placeholder_600x400.svg';

export const STATUS_BADGE = {
  [Status.ACTIVE]: 'bg-green-100 text-green-600 rounded-sm',
  [Status.INACTIVE]: 'bg-red-100 text-red-600 rounded-sm',
};

export const STATUS_ENUM_KEY = {
  [Status.ACTIVE]: 'common.ACTIVE',
  [Status.INACTIVE]: 'common.INACTIVE',
} as const;

export const NO_REDIRECT_ROUTES = [MY_ROUTE.LOGIN];

export const PAGE_PARAM_KEY = 'page';
export const PER_PAGE_PARAM_KEY = 'per_page';

export const INITIAL_PAGING: PaginationREQ = {
  page: 1,
  per_page: 10,
};

/** Page size for infinite-scroll pickers (category / option-group selects). */
export const PICKER_PAGE_SIZE = 20;

/** Keys that make `<input type="number">` accept values like `1e5` or `-3`. */
export const BLOCKED_NUMBER_KEYS = ['e', 'E', '+', '-'];
