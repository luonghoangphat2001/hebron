import { api } from '@/api';
import type { BaseRESP } from '@/utils/types/response.type';
import type { EmailSettingUpdateREQ } from './email-setting.request';
import type { EmailSettingRESP } from './email-setting.response';

const ENDPOINT = '/admin/email-settings';

export const getEmailSettingAPI = (): Promise<BaseRESP<EmailSettingRESP>> => api.get(ENDPOINT);

export const updateEmailSettingAPI = (body: EmailSettingUpdateREQ): Promise<BaseRESP<EmailSettingRESP>> =>
  api.put(ENDPOINT, body);
