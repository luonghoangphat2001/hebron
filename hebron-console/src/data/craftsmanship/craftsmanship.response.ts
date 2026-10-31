export type CraftsmanshipProductItem = {
  product_id: number;
  product_code: string;
  name: {
    ko: string;
    en: string;
  };
  slug: string;
  selling_price: number;
  original_price: number;
  first_image: string;
  is_popular?: boolean;
  is_featured?: boolean;
  is_active?: boolean;
  sort_order?: number;
  has_discount?: boolean;
  discount_percentage?: number;
};

export type CraftsmanshipValue = {
  id: number;
  key: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  description: string | null;
  button_label: string;
  products: CraftsmanshipProductItem[];
  sort_order: number;
  is_active: boolean;
  product_ids: number[];
  created_at?: string;
  updated_at?: string;
};

export type CraftsmanshipListRESP = {
  craftsmanship_values: CraftsmanshipValue[];
};

export type CraftsmanshipDetailRESP = {
  craftsmanship_value: CraftsmanshipValue;
};
