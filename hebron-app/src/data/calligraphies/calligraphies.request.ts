export type CalligraphyType = 'calligraphy' | 'smog_only' | 'wood_case_gold_only';

export type GetCalligraphiesREQ = {
  q?: string;
  type?: CalligraphyType;
  page?: number;
  per_page?: number;
};
