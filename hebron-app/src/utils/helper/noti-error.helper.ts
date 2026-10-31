import { appToast } from '@/components/toast/AppToast';
import i18n from '@/i18n';
import { isAxiosError } from 'axios';

export const handleNotiError = (error: any, key: string | string[], subMessage: string) => {
  if (isAxiosError(error)) {
    const errorCode = error.response?.data.errorCode;
    const keySelect = Array.isArray(key) ? key.find((item) => errorCode?.includes(item)) : key;
    const isIncludes = Array.isArray(key) ? key.some((item) => errorCode?.includes(item)) : errorCode.includes(key);

    if (errorCode && isIncludes) {
      appToast.error(i18n.t(`${keySelect}.${errorCode}` as any, { ns: 'error' }));
      return;
    }

    appToast.error(subMessage);
  } else appToast.error(subMessage);
};
