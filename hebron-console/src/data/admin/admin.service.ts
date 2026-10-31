import type { AdminInput } from '@/schemas/admin/admin.schema';
import { INITIAL_PAGING, PAGE_PARAM_KEY, PER_PAGE_PARAM_KEY } from '@/utils/constants/common.constant';
import { Status } from '@/utils/enums/common.enum';
import { orUndefined } from '@/utils/helper/string.helper';
import type { AdminCreateREQ, AdminListREQ, AdminUpdateREQ } from './admin.request';
import type { AdminRESP } from './admin.response';

export const getAdminListInitFilter = (searchParams: URLSearchParams): AdminListREQ => {
  return {
    page: Number(searchParams.get(PAGE_PARAM_KEY)) || INITIAL_PAGING.page,
    per_page: Number(searchParams.get(PER_PAGE_PARAM_KEY)) || INITIAL_PAGING.per_page,
    search_term: orUndefined(searchParams.get('search_term')),
    status: orUndefined(searchParams.get('status')),
  };
};

export const transformAdminInputToCreateREQ = (input: AdminInput): AdminCreateREQ => {
  return {
    name: input.name,
    username: input.username,
    password: input.password,
    password_confirmation: input.password,
    email: input.email,
    mobile: input.phone,
    admin_permission_ids: [input.permission],
    status: input.status ? Status.ACTIVE : Status.INACTIVE,
  };
};

export const transformAdminRESPToInput = (resp: AdminRESP): AdminInput => {
  return {
    username: resp.username,
    password: '',
    name: resp.name,
    email: resp.email,
    phone: resp.mobile,
    permission: resp.admin_permissions_ids?.[0],
    status: resp.status === Status.ACTIVE ? true : false,
  };
};

export const transformAdminInputToUpdateREQ = (adminId: number, input: AdminInput): AdminUpdateREQ => {
  return {
    id: adminId,
    name: input.name,
    // username: input.username,
    // password: input.password,
    // password_confirmation: input.password,
    email: input.email,
    mobile: input.phone,
    admin_permission_ids: [input.permission],
    status: input.status ? Status.ACTIVE : Status.INACTIVE,
  };
};
