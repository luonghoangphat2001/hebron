import { LANG } from '@/utils/constants/common.constant';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { resources } from './resources';

export type I18nLanguage = keyof typeof i18nLanguages;
export const i18nLanguages = { en: 'English', kr: '한글' };
export const i18nDefaultLang: I18nLanguage = (localStorage.getItem(LANG) as any) || 'kr';

const i18nNamespaces = ['common', 'enum'] as const;

export type I18nNamespace = (typeof i18nNamespaces)[number];
export const i18nDefaultNs: I18nNamespace = 'common';

i18n.use(initReactI18next).init({
  resources: resources,
  lng: i18nDefaultLang,
  fallbackLng: i18nDefaultLang,
  ns: i18nNamespaces,
  defaultNS: i18nDefaultNs,
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
