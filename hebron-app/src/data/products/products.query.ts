import type { BaseRESP, ErrorRESP, PaginationRESP } from '@/utils/types/response.type';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
  type UseInfiniteQueryOptions,
  type UseMutationOptions,
  type UseQueryOptions,
} from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { productsAPI } from './products.api';
import type {
  ProductDesignContentCreateREQ,
  ProductDesignContentUpdateREQ,
  ProductQuoteREQ,
  ProductSearchByCategoryREQ,
  ProductSearchREQ,
} from './products.request';
import type { ProductDesignContentRESP, ProductSearchRESP } from './products.response';

export type ProductSearchInfiniteParams = Omit<ProductSearchREQ, 'page'>;

export const PRODUCT_QUERY_KEYS = {
  all: ['products'] as const,
  searches: () => [...PRODUCT_QUERY_KEYS.all, 'search'] as const,
  search: (params?: ProductSearchREQ) => [...PRODUCT_QUERY_KEYS.searches(), params] as const,
  infiniteSearches: () => [...PRODUCT_QUERY_KEYS.all, 'search-infinite'] as const,
  infiniteSearch: (params?: ProductSearchInfiniteParams) => [...PRODUCT_QUERY_KEYS.infiniteSearches(), params] as const,
  searchByCategory: (params?: ProductSearchByCategoryREQ) => [...PRODUCT_QUERY_KEYS.all, 'search-by-category', params] as const,
  details: () => [...PRODUCT_QUERY_KEYS.all, 'detail'] as const,
  detail: (slug: string) => [...PRODUCT_QUERY_KEYS.details(), slug] as const,
  templates: (slug: string) => [...PRODUCT_QUERY_KEYS.all, 'templates', slug] as const,
  quote: (id: number) => [...PRODUCT_QUERY_KEYS.all, 'quote', id] as const,
  designContentDetails: () => [...PRODUCT_QUERY_KEYS.all, 'design-content-detail'] as const,
  designContentDetail: (id: number) => [...PRODUCT_QUERY_KEYS.designContentDetails(), id] as const,
};

export const useProductSearchQuery = (
  params?: ProductSearchREQ,
  options?: Omit<UseQueryOptions<PaginationRESP<ProductSearchRESP>, AxiosError<ErrorRESP>>, 'queryKey' | 'queryFn'>,
) =>
  useQuery({
    queryKey: PRODUCT_QUERY_KEYS.search(params),
    queryFn: () => productsAPI.search(params),
    ...options,
  });

export const useProductSearchInfiniteQuery = (
  params?: ProductSearchInfiniteParams,
  options?: Omit<
    UseInfiniteQueryOptions<
      PaginationRESP<ProductSearchRESP>,
      AxiosError<ErrorRESP>,
      InfiniteData<PaginationRESP<ProductSearchRESP>>,
      ReturnType<typeof PRODUCT_QUERY_KEYS.infiniteSearch>,
      number
    >,
    'queryKey' | 'queryFn' | 'getNextPageParam' | 'initialPageParam'
  >,
) =>
  useInfiniteQuery({
    queryKey: PRODUCT_QUERY_KEYS.infiniteSearch(params),
    queryFn: ({ pageParam }) => productsAPI.search({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.pagination.current_page ?? 1;
      const totalPage = lastPage.pagination.total_page ?? 1;
      return currentPage < totalPage ? currentPage + 1 : undefined;
    },
    ...options,
  });

export const useProductSearchByCategoryQuery = (params?: ProductSearchByCategoryREQ) =>
  useQuery({
    queryKey: PRODUCT_QUERY_KEYS.searchByCategory(params),
    queryFn: () => productsAPI.searchByCategory(params),
    select: (resp) => ({
      list: resp.data.products,
      category: resp.data.category,
      pagination: resp.pagination,
    }),
    enabled: Boolean(params?.slug),
  });

export const useProductDetailBySlugQuery = (slug: string) =>
  useQuery({
    queryKey: PRODUCT_QUERY_KEYS.detail(slug),
    queryFn: () => productsAPI.getDetailBySlug(slug),
    select: (resp) => resp.data.product,
    enabled: Boolean(slug),
  });

export const useProductTemplatesBySlugQuery = (slug: string) =>
  useQuery({
    queryKey: PRODUCT_QUERY_KEYS.templates(slug),
    queryFn: () => productsAPI.getTemplatesByProductSlug(slug),
    select: (resp) => resp.data,
    enabled: Boolean(slug),
  });

export const useProductQuotationQuery = (body?: ProductQuoteREQ) =>
  useQuery({
    queryKey: [PRODUCT_QUERY_KEYS.quote(body?.productId || 1), body],
    queryFn: () => productsAPI.checkProductQuote(body as ProductQuoteREQ),
    select: (resp) => resp.data,
    enabled: Boolean(body && body.productId),
    // placeholderData: keepPreviousData,
    retry: 1,
  });

export const useProductDesignContentDetailQuery = (
  id: number,
  options?: Omit<UseQueryOptions<BaseRESP<ProductDesignContentRESP>, AxiosError<ErrorRESP>>, 'queryKey' | 'queryFn' | 'select'>,
) =>
  useQuery({
    queryKey: PRODUCT_QUERY_KEYS.designContentDetail(id),
    queryFn: () => productsAPI.getDesignContentDetail(id),
    enabled: Boolean(id),
    select: (resp) => resp.data,
    ...options,
  });

export const useCreateProductDesignContentDetailMutation = (
  options?: UseMutationOptions<BaseRESP<ProductDesignContentRESP>, AxiosError<ErrorRESP>, ProductDesignContentCreateREQ>,
) =>
  useMutation({
    ...options,
    mutationFn: productsAPI.createDesignContentDetail,
  });

export const useUpdateProductDesignContentDetailMutation = (
  options?: UseMutationOptions<BaseRESP<ProductDesignContentRESP>, AxiosError<ErrorRESP>, ProductDesignContentUpdateREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: productsAPI.updateDesignContentDetail,
    onSuccess: (data, variables, ...rest) => {
      void queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEYS.designContentDetail(variables.id) });
      options?.onSuccess?.(data, variables, ...rest);
    },
  });
};

export const useDownloadProductPdfMutation = (options?: UseMutationOptions<Blob, AxiosError<ErrorRESP>, string>) =>
  useMutation({
    ...options,
    mutationFn: productsAPI.downloadPdf,
  });
