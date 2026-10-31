import type { ExportExcelError } from '@/hooks/useExportExcel';
import type { AxiosError } from 'axios';
import dayjs from 'dayjs';
import type { FieldErrors, FieldValues } from 'react-hook-form';
import { PHONE_PREFIXES } from '../constants/common.constant';
import { DATE_FORMAT_DOT } from '../constants/date.constant';
import type { ErrorRESP } from '../types/response.type';

export const getFormErrorMessage = <T extends FieldValues>(errors: FieldErrors<T>, path: string): string | undefined => {
  const field = path.split('.').reduce<unknown>((o, key) => {
    if (typeof o === 'object' && o !== null && key in o) {
      return (o as Record<string, unknown>)[key];
    }
    return undefined;
  }, errors);

  if (
    typeof field === 'object' &&
    field !== null &&
    'message' in field &&
    typeof (field as { message?: unknown }).message === 'string'
  ) {
    return (field as { message: string }).message;
  }

  return undefined;
};

export const formatDate = (date?: string | Date | number, format = DATE_FORMAT_DOT): string => {
  return dayjs(date ?? new Date()).format(format);
};

export function splitPhonePattern(phone: string) {
  const digits = phone.replace(/\D/g, '');

  const matchedPrefix = [...PHONE_PREFIXES].sort((a, b) => b.length - a.length).find((prefix) => digits.startsWith(prefix));

  if (!matchedPrefix) return null;

  const rest = digits.slice(matchedPrefix.length);

  if (rest.length !== 7 && rest.length !== 8) return null;

  const part3 = rest.slice(-4);
  const part2 = rest.slice(0, -4);

  if (part2.length !== 3 && part2.length !== 4) return null;

  return {
    part1: matchedPrefix,
    part2,
    part3,
    formatted: `${matchedPrefix}-${part2}-${part3}`,
  };
}

export const formatPrice = (price: number | null | undefined) => (price == null ? '-' : `${price.toLocaleString('ko-KR')}원`);

export const formatNumber = (price: number | null | undefined) => (price == null ? '0' : `${price.toLocaleString('ko-KR')}`);

export const formatPhone = (value?: string | null) => {
  if (!value) return '';

  const digits = value.replace(/\D/g, '').slice(0, 11);
  const prefixLength = 3;

  if (digits.length <= prefixLength) return digits;

  const prefix = digits.slice(0, prefixLength);
  const middle = digits.slice(prefixLength, prefixLength + 4);
  const suffix = digits.slice(prefixLength + 4);

  return [prefix, middle, suffix].filter(Boolean).join('-');
};

export const getExportErrorMessage = ({ type, error }: ExportExcelError) => {
  const responseError = error as AxiosError<ErrorRESP> | undefined;
  if (responseError?.response?.status === 401) return undefined;
  if (type === 'not-found') return '해당 엑셀 파일을 찾을 수 없거나 접근 권한이 없습니다.';
  if (type === 'failed') return '엑셀 파일 생성에 실패했습니다. 다시 시도해 주세요.';
  if (type === 'download') return '엑셀 파일을 다운로드하지 못했습니다. 다시 시도해 주세요.';
  if (type === 'progress') return responseError?.response?.data.message || '엑셀 파일 생성 상태를 확인하지 못했습니다.';
  return responseError?.response?.data.message || '엑셀 파일 생성을 요청하지 못했습니다.';
};
