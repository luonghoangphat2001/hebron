export type CalligraphyType = 'calligraphy' | 'smog_only' | 'wood_case_gold_only';

export type Calligraphy = {
  id: number;
  image_path: string;
  image_url: string;
  type: CalligraphyType;
  type_label: string;
  text: string | null;
  created_by: number | null;
  created_at: string | null;
  updated_at: string | null;
};

export type CalligraphyListParams = {
  type?: CalligraphyType;
  search?: string;
  sort_by: 'created_at' | 'updated_at';
  sort_order: 'asc' | 'desc';
  page: number;
  per_page: number;
};

export type CalligraphyListResult = {
  items: Calligraphy[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
};

export type CalligraphyWrite = {
  image_path: string;
  type: CalligraphyType;
  text?: string | null;
};

export const CALLIGRAPHY_TYPES: CalligraphyType[] = ['calligraphy', 'smog_only', 'wood_case_gold_only'];
