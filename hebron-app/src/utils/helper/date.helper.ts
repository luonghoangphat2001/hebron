import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

export const KOREAN_DATE_DISPLAY_FORMAT = 'YYYY년 MM월 DD일';

const DATE_INPUT_FORMATS = ['YYYY-MM-DD', 'YYYY.MM.DD', 'YYYY/MM/DD', KOREAN_DATE_DISPLAY_FORMAT] as const;

export const normalizeDateInput = (value: string) => {
  const parsed = dayjs(value.trim(), [...DATE_INPUT_FORMATS], true);

  return parsed.isValid() ? parsed.format('YYYY.MM.DD') : value;
};

export const formatKoreanDate = (value: string | Date) => {
  const parsed = typeof value === 'string' ? dayjs(value, [...DATE_INPUT_FORMATS], true) : dayjs(value);

  if (!parsed.isValid()) {
    return '';
  }

  return parsed.format(KOREAN_DATE_DISPLAY_FORMAT);
};

export const formatDateTime = (value: string | Date) => {
  const parsed = typeof value === 'string' ? dayjs(value) : dayjs(value);

  if (!parsed.isValid()) {
    return '';
  }

  return parsed.format('YYYY-MM-DD HH:mm:ss');
};
