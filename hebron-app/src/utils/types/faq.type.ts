export type FAQCategory = {
  key: string;
  label: string;
  count?: number;
};

export type FAQItem = {
  id: string;
  categoryKey: string;
  tagLabel: string;
  question: string;
  answer: string;
};
