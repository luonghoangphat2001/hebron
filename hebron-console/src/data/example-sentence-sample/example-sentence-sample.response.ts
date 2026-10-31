export type ExampleSentenceSampleCategoryRESP = {
  id: number;
  board_category_no?: number;
  name: string;
  page_type: string;
  is_active: boolean;
  total_post?: number;
};

export type ExampleSentenceSampleAttachmentRESP = {
  no: number;
  name: string;
  url: string;
};

export type ExampleSentenceSampleRESP = {
  id: number;
  title: string;
  board_category_no: number;
  category: ExampleSentenceSampleCategoryRESP;
  content: string;
  attachments: ExampleSentenceSampleAttachmentRESP[];
  is_active: boolean;
  is_featured: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
};

export type ExampleSentenceSampleListRESP = {
  example_sentence_samples: ExampleSentenceSampleRESP[];
};

export type ExampleSentenceSampleDetailRESP = {
  example_sentence_sample: ExampleSentenceSampleRESP;
};

export type ExampleSentenceSampleCategoryListRESP = {
  categories: ExampleSentenceSampleCategoryRESP[];
};

export type ExampleSentenceSampleCategoryDetailRESP = {
  category: ExampleSentenceSampleCategoryRESP;
};
