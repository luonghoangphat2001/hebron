import { api } from '@/api';
import type { GetTemplatesRESP } from '@/data/templates/templates.response';
import type { BaseRESP, PaginationRESP } from '@/utils/types/response.type';
import type {
  ProductDesignContentCreateREQ,
  ProductDesignContentUpdateREQ,
  ProductQuoteREQ,
  ProductSearchByCategoryREQ,
  ProductSearchREQ,
} from './products.request';
import type {
  ProductDesignContentRESP,
  ProductDetailRESP,
  ProductQuoteRESP,
  ProductSearchByCategoryRESP,
  ProductSearchRESP,
} from './products.response';

const ENDPOINTS = {
  SEARCH: '/products/search',
  SEARCH_BY_CATEGORY: (categorySlug: string) => `/categories/${categorySlug}/products`,
  DETAIL_BY_SLUG: (productSlug: string) => `/products/${productSlug}`,
  TEMPLATES_BY_PRODUCT_SLUG: (productSlug: string) => `/products/${productSlug}/templates`,
  DOWNLOAD_PDF: (productSlug: string) => `/products/${encodeURIComponent(decodeURIComponent(productSlug))}/download-pdf`,
  PRODUCT_QUOTE: (productId: number) => `/products/${productId}/quote`,
  DESIGN_CONTENT: '/order-design-contents',
} as const;

export const productsAPI = {
  search: (params?: ProductSearchREQ): Promise<PaginationRESP<ProductSearchRESP>> =>
    api.get(ENDPOINTS.SEARCH, {
      params,
      // Laravel-style: category_ids[]=1&category_ids[]=2
      paramsSerializer: {
        indexes: false,
      },
    }),

  searchByCategory: (params?: ProductSearchByCategoryREQ): Promise<PaginationRESP<ProductSearchByCategoryRESP>> =>
    api.get(ENDPOINTS.SEARCH_BY_CATEGORY(params?.slug || ''), {
      params: { ...params, slug: undefined },
      paramsSerializer: {
        indexes: false,
      },
    }),

  getDetailBySlug: (productSlug: string): Promise<BaseRESP<ProductDetailRESP>> => api.get(ENDPOINTS.DETAIL_BY_SLUG(productSlug)),

  getTemplatesByProductSlug: (productSlug: string): Promise<BaseRESP<GetTemplatesRESP>> =>
    api.get(ENDPOINTS.TEMPLATES_BY_PRODUCT_SLUG(productSlug)),

  downloadPdf: (productSlug: string): Promise<Blob> => api.get(ENDPOINTS.DOWNLOAD_PDF(productSlug), { responseType: 'blob' }),

  checkProductQuote: (body: ProductQuoteREQ): Promise<BaseRESP<ProductQuoteRESP>> =>
    api.post(ENDPOINTS.PRODUCT_QUOTE(body.productId), body),

  getDesignContentDetail: (id: number): Promise<BaseRESP<ProductDesignContentRESP>> =>
    api.get(`${ENDPOINTS.DESIGN_CONTENT}/${id}`),

  createDesignContentDetail: (body: ProductDesignContentCreateREQ): Promise<BaseRESP<ProductDesignContentRESP>> =>
    api.post(ENDPOINTS.DESIGN_CONTENT, body),

  updateDesignContentDetail: (body: ProductDesignContentUpdateREQ): Promise<BaseRESP<ProductDesignContentRESP>> =>
    api.put(`${ENDPOINTS.DESIGN_CONTENT}/${body.id}`, body),
};
