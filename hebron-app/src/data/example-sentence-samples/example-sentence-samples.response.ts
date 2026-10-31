import type { NoticeAttachment } from '@/data/files/files.request';

export type ExampleSentenceSampleCategoryRESP = {
  id: number;
  name: string;
  page_type: string;
  is_active: boolean;
};

export type ExampleSentenceSampleCategoryItemRESP = ExampleSentenceSampleCategoryRESP & {
  total_post: number;
};

export type ExampleSentenceSampleCategoryListRESP = {
  categories: ExampleSentenceSampleCategoryItemRESP[];
};

export type ExampleSentenceSampleItemRESP = {
  id: number;
  title: string;
  category: ExampleSentenceSampleCategoryRESP;
  content: string;
  attachments: NoticeAttachment[];
  is_featured: boolean;
  view_count: number;
  created_at: string;
};

export type ExampleSentenceSampleListRESP = {
  example_sentence_samples: ExampleSentenceSampleItemRESP[];
};

export type ExampleSentenceSampleDetailRESP = {
  example_sentence_sample: ExampleSentenceSampleItemRESP;
};
