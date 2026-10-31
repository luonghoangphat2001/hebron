// import the original type declarations
import 'i18next';

import { i18nDefaultNs } from '@/i18n';
import { resources } from '@/i18n/resources';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof i18nDefaultNs;
    resources: (typeof resources)['en'];
  }
}
