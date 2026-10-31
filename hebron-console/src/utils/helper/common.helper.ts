import dayjs from 'dayjs';
import type { ChangeEvent } from 'react';
import { DATE_HOUR_MINUTE } from '../constants/date.constant';
import type { Pagination } from '../types/response.type';

export const formatDate = (value?: string | number, format = DATE_HOUR_MINUTE) => {
  if (!value) return '-';
  return dayjs(value).format(format);
};

export const downloadBlob = (blob: Blob, filename: string, revokeDelayMs = 0) => {
  // 1. Create a temporary Object URL representing the binary Blob
  const url = window.URL.createObjectURL(blob);

  // 2. Create an in-memory <a> element with download attribute
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;

  // 3. Append element to DOM, programmatically click to initiate download, then remove it
  document.body.appendChild(link);
  link.click();
  link.remove();

  // 4. Revoke after the browser has received the click that starts the download.
  window.setTimeout(() => window.URL.revokeObjectURL(url), revokeDelayMs);
};

/**
 * Downloads export file returned by backend API using hardcoded Korean Enum Name + Date format YYYY_MM_DD.
 * Format: {file_name_hàn}_YYYY_MM_DD.xlsx (e.g. 주문목록_2026_07_31.xlsx)
 */
export const downloadExportFileWithKoreanName = async (filePath: string, koreanNamePrefix: string, extension = 'xlsx') => {
  const dateStr = dayjs().format('YYYY_MM_DD');
  const fileName = `${koreanNamePrefix}_${dateStr}.${extension}`;
  const fullUrl = getFileUrl(filePath);

  try {
    const response = await fetch(fullUrl);
    if (!response.ok) {
      window.open(fullUrl, '_blank');
      return;
    }
    const blob = await response.blob();
    downloadBlob(blob, fileName);
  } catch {
    window.open(fullUrl, '_blank');
  }
};

export const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);

  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;

  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
};

export const formatFileSize = (bytes?: number) => {
  if (!bytes) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export const getFileUrl = (path?: string): string => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;

  const apiEndpoint = import.meta.env.VITE_API_ENDPOINT || '';
  let baseUrl = apiEndpoint;
  try {
    const urlObj = new URL(apiEndpoint);
    baseUrl = urlObj.origin;
  } catch {
    baseUrl = apiEndpoint.replace(/\/api\/?$/, '');
  }

  return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

export const isImageSource = (file: { name?: string; url?: string; preview?: string; mime_type?: string; type?: string }) => {
  if (file.mime_type?.startsWith('image/')) return true;
  if (file.type?.startsWith('image/')) return true;
  const source = file.preview || file.url || file.name || '';
  return /\.(jpe?g|png|gif|webp|bmp|svg)$/i.test(source);
};

export const getDirtyValues = <T extends Record<string, any>>(
  dirtyFields: Partial<Record<keyof T, boolean | any>>,
  allValues: T,
): Partial<T> => {
  const dirtyValues: Partial<T> = {};

  (Object.keys(dirtyFields) as Array<keyof T>).forEach((key) => {
    if (dirtyFields[key]) {
      dirtyValues[key] = allValues[key];
    }
  });

  return dirtyValues;
};

/** Extracts the filename from a URL or file path string. */
export const getFileNameFromPath = (path?: string | null): string | null => {
  if (!path) return null;
  return path.split('/').pop() || path;
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(amount);
};

/** getNextPageParam for useInfiniteQuery: next page number, or undefined when the last page is loaded. */
export const getNextPageParam = (pagination?: Pagination) => {
  const current = pagination?.current_page ?? 1;
  return current < (pagination?.total_page ?? 1) ? current + 1 : undefined;
};

/** Formats a number with dot thousand separators for money inputs, e.g. 1234567 -> "1.234.567". */
export const formatMoney = (value?: number) => {
  if (value === undefined || value === null || Number.isNaN(value)) return '';
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

/** "01" -> 1, and rewrites the text so the field shows "1". */
export const handleNumberInputChange = (e: ChangeEvent<HTMLInputElement>, onChange: (value: number) => void) => {
  const raw = e.target.value;
  const next = Number(raw);
  onChange(Number.isNaN(next) ? 0 : next);
  if (raw !== '' && raw !== String(next)) e.target.value = String(next);
};
