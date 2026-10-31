import { appToast } from '@/components/toast/AppToast';
import i18n from '@/i18n';
import type { ErrorRESP } from '@/utils/types/response.type';
import { isAxiosError } from 'axios';
import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';

export const getErrorMessage = (error: unknown, fallback: string): string => {
  if (!isAxiosError<ErrorRESP>(error)) return fallback;
  const firstFieldError = Object.values(error.response?.data.errors ?? {})[0]?.[0];
  return firstFieldError || error.response?.data.message || fallback;
};

// Map Laravel validation errors onto react-hook-form fields.
export const setServerFieldErrors = <T extends FieldValues>(error: unknown, setError: UseFormSetError<T>): boolean => {
  if (!isAxiosError<ErrorRESP>(error)) return false;

  const errors = Object.entries(error.response?.data.errors ?? {});
  errors.forEach(([field, messages]) => setError(field as Path<T>, { type: 'server', message: messages[0] }));

  return errors.length > 0;
};

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
