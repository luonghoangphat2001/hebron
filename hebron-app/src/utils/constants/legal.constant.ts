import { PolicyBanner, TermBanner } from '@/assets/images';

const MOCK_LEGAL_PARAGRAPH =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

export type LegalDocumentConfig = {
  title: string;
  banner: string;
  paragraphs: string[];
};

export const TERMS_DOCUMENT: LegalDocumentConfig = {
  title: '이용약관',
  banner: TermBanner,
  paragraphs: Array.from({ length: 6 }, () => MOCK_LEGAL_PARAGRAPH),
};

export const PRIVACY_POLICY_DOCUMENT: LegalDocumentConfig = {
  title: '개인정보처리방침',
  banner: PolicyBanner,
  paragraphs: Array.from({ length: 6 }, () => MOCK_LEGAL_PARAGRAPH),
};

export const LEGAL_PAGE_LAYOUT_CLASS = 'mx-auto flex w-full max-w-180 min-w-0 flex-col gap-8 pb-8 md:gap-10 md:pb-10';
