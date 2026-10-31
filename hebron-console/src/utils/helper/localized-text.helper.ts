type LocalizedRecord = Record<string, unknown>;

const stringValue = (value: unknown) => (typeof value === 'string' || typeof value === 'number' ? String(value).trim() : '');

export const isKoreanLanguage = (language: string) => {
  const normalized = language.toLowerCase();
  return normalized === 'kr' || normalized.startsWith('ko');
};

export const getLocalizedText = (value: unknown, language: string, fallback = '') => {
  const direct = stringValue(value);
  if (direct) return direct;
  if (!value || typeof value !== 'object' || Array.isArray(value)) return fallback;

  const record = value as LocalizedRecord;
  const normalized = language.toLowerCase();
  const keys = isKoreanLanguage(normalized)
    ? ['ko', 'kr', 'name_ko', 'en', 'name_en', 'ja', 'name_ja']
    : normalized.startsWith('ja')
      ? ['ja', 'name_ja', 'en', 'name_en', 'ko', 'kr', 'name_ko']
      : ['en', 'name_en', 'ko', 'kr', 'name_ko', 'ja', 'name_ja'];

  for (const key of keys) {
    const localized = stringValue(record[key]);
    if (localized) return localized;
  }

  return fallback;
};

export const getCategoryName = (
  category: { name?: unknown; name_en?: unknown; slug?: unknown; code?: unknown } | null | undefined,
  language: string,
  fallback = '-',
) => {
  if (!category) return fallback;

  const values = isKoreanLanguage(language) ? [category.name, category.name_en] : [category.name_en, category.name];

  for (const value of values) {
    const label = getLocalizedText(value, language);
    if (label) return label;
  }

  return stringValue(category.slug) || stringValue(category.code) || fallback;
};
