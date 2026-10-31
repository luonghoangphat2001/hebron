export type CraftsmanshipListREQ = {
  page?: number;
  per_page?: number;
  search?: string;
  is_active?: boolean;
};

export type CraftsmanshipCreateREQ = {
  title: string;
  subtitle?: string | null;
  image_url?: string | null;
  description?: string | null;
  sort_order?: number;
  is_active?: boolean;
  product_ids?: number[];
};

export type CraftsmanshipUpdateREQ = {
  title: string;
  subtitle?: string | null;
  image_url?: string | null;
  description?: string | null;
  sort_order?: number;
  is_active?: boolean;
  product_ids?: number[];
};
