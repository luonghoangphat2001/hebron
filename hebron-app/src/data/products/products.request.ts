import type { FileAttachmentREQ } from '../files/files.request';

export type ProductSearchSortBy = 'position' | 'latest' | 'price_asc' | 'price_desc' | 'name_asc' | 'popular' | 'view_count';

export type ProductSearchSortOrder = 'asc' | 'desc';

export type ProductSearchREQ = {
  q?: string;
  category_id?: number;
  category_ids?: number[];
  sort_by?: ProductSearchSortBy;
  sort_order?: ProductSearchSortOrder;
  per_page?: number;
  page?: number;
};

export type ProductSearchByCategoryREQ = ProductSearchREQ & {
  slug: string;
  category_ids?: number[];
  selling_price_from?: number;
  selling_price_to?: number;
  search?: string;
};

export type ProductQuoteREQ = {
  productId: number;
  quantity: number;
  selected_options?: {
    group_id: number;
    option_id: number;
  }[];
};

export type ProductDesignContentCreateREQ = {
  title: string;
  recipient_name: string;
  event_date: string;
  main_text: string;
  sender_name: string;
  attachment_file_urls: FileAttachmentREQ[];
};

export type ProductDesignContentUpdateREQ = ProductDesignContentCreateREQ & {
  id: number;
};
