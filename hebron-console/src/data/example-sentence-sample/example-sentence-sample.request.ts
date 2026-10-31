import type { PaginationREQ } from '@/utils/types/request.type';

export type ExampleSentenceSampleListREQ = PaginationREQ & {
  keyword?: string;
  board_category_no?: number;
  is_active?: boolean;
};

export type ExampleSentenceSampleUpsertREQ = {
  title: string;
  category_id: number;
  board_category_no: number;
  content: string;
  attachments: Array<{ no: number; name: string; url: string }>;
  is_active: boolean;
};

export type ExampleSentenceSampleUpdateREQ = ExampleSentenceSampleUpsertREQ & {
  id: number;
};

export type ExampleSentenceSampleCategoryUpsertREQ = {
  name: string;
  is_active: boolean;
};

export type ExampleSentenceSampleCategoryUpdateREQ = ExampleSentenceSampleCategoryUpsertREQ & {
  id: number;
};

export type ExampleSentenceSampleCategoryListREQ = PaginationREQ & {
  keyword?: string;
  is_active?: boolean;
};
