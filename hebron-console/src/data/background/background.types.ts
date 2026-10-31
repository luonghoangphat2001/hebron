export type Background = {
  id: number;
  image_path: string;
  image_url: string;
  template_count: number;
  created_by: number | null;
  created_at: string | null;
  updated_at: string | null;
};

export type BackgroundListParams = {
  sort_by: 'created_at' | 'updated_at';
  sort_order: 'asc' | 'desc';
  page: number;
  per_page: number;
};

export type BackgroundListResult = {
  items: Background[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
};

export type BackgroundTemplateDependency = { id: number; name: string };

export type BackgroundDeleteBlocker = {
  id: number;
  image_path: string;
  templates: BackgroundTemplateDependency[];
};

export type BackgroundWrite = { image_path: string };
