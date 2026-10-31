import { getNextPageParam } from '@/utils/helper/common.helper';
import type { BaseRESP, ErrorRESP, PaginationRESP } from '@/utils/types/response.type';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import {
  bulkDeleteProductsAPI,
  bulkUpdateProductStatusAPI,
  bulkUpdateProductsAPI,
  copyProductAPI,
  createProductAPI,
  deleteProductAPI,
  getProductCopyPreviewAPI,
  getProductDetailAPI,
  getProductListAPI,
  getProductSearchFiltersAPI,
  updateProductAPI,
  updateProductMesSettingsAPI,
  uploadProductImagesAPI,
} from './product.api';
import type {
  ProductBulkDeleteREQ,
  ProductBulkStatusREQ,
  ProductBulkUpdateREQ,
  ProductCopyREQ,
  ProductCreateREQ,
  ProductListREQ,
  ProductMesSettingsREQ,
  ProductUpdateREQ,
} from './product.request';
import type {
  ProductBulkDeleteRESP,
  ProductBulkStatusRESP,
  ProductBulkUpdateRESP,
  ProductDetailRESP,
  ProductListRESP,
  ProductUploadImagesRESP,
} from './product.response';

export const PRODUCT_QUERY_KEYS = {
  LIST: 'PRODUCT_LIST',
  INFINITE: 'PRODUCT_INFINITE',
  DETAIL: 'PRODUCT_DETAIL',
  SEARCH_FILTERS: 'PRODUCT_SEARCH_FILTERS',
  EXPORT_PROGRESS: 'PRODUCT_EXPORT_PROGRESS',
  COPY_PREVIEW: 'PRODUCT_COPY_PREVIEW',
};

export const useProductListQuery = (params: ProductListREQ) =>
  useQuery({
    queryKey: [PRODUCT_QUERY_KEYS.LIST, params],
    queryFn: () => getProductListAPI(params),
    select: (resp: PaginationRESP<ProductListRESP>) => ({
      list: resp.data.products,
      pagination: resp.pagination ?? resp.data.pagination,
    }),
  });

export const useProductInfiniteQuery = (params?: Omit<ProductListREQ, 'page'>, enabled = true) =>
  useInfiniteQuery({
    queryKey: [PRODUCT_QUERY_KEYS.INFINITE, params],
    queryFn: ({ pageParam = 1 }) =>
      getProductListAPI({
        per_page: 20,
        ...params,
        page: pageParam as number,
      }),
    initialPageParam: 1,
    enabled,
    getNextPageParam: (lastPage) => getNextPageParam(lastPage.pagination ?? lastPage.data.pagination),
    select: (data) => ({
      pages: data.pages,
      products: data.pages.flatMap((page) => page.data.products),
      total: data.pages[0]?.pagination?.total_item ?? data.pages[0]?.data.pagination?.total_item ?? 0,
    }),
  });

export const useProductDetailQuery = (id?: number, options?: { refetchOnWindowFocus?: boolean }) =>
  useQuery({
    ...options,
    queryKey: [PRODUCT_QUERY_KEYS.DETAIL, id],
    queryFn: () => getProductDetailAPI(id as number),
    select: (resp) => resp.data.product,
    enabled: !!id,
  });

export const useProductCategoryOptionsQuery = () =>
  useQuery({
    queryKey: [PRODUCT_QUERY_KEYS.SEARCH_FILTERS],
    queryFn: getProductSearchFiltersAPI,
    select: (resp) => resp.data.filters.category_options,
    staleTime: Infinity,
  });

export const useProductCreateMutation = (
  options?: UseMutationOptions<BaseRESP<ProductDetailRESP>, AxiosError<ErrorRESP>, ProductCreateREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: createProductAPI,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [PRODUCT_QUERY_KEYS.LIST] });
      options?.onSuccess?.(...args);
    },
  });
};

export const useProductUpdateMutation = (
  options?: UseMutationOptions<BaseRESP<ProductDetailRESP>, AxiosError<ErrorRESP>, ProductUpdateREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: updateProductAPI,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [PRODUCT_QUERY_KEYS.LIST] });
      queryClient.invalidateQueries({ queryKey: [PRODUCT_QUERY_KEYS.DETAIL] });
      options?.onSuccess?.(...args);
    },
  });
};

export const useProductDeleteMutation = (
  options?: UseMutationOptions<BaseRESP<Record<string, never>>, AxiosError<ErrorRESP>, number>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: deleteProductAPI,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [PRODUCT_QUERY_KEYS.LIST] });
      options?.onSuccess?.(...args);
    },
  });
};

export const useProductUploadImagesMutation = (
  options?: UseMutationOptions<BaseRESP<ProductUploadImagesRESP>, AxiosError<ErrorRESP>, File[]>,
) =>
  useMutation({
    ...options,
    mutationFn: uploadProductImagesAPI,
  });

export const useProductCopyPreviewQuery = (id?: number) =>
  useQuery({
    queryKey: [PRODUCT_QUERY_KEYS.COPY_PREVIEW, id],
    queryFn: () => getProductCopyPreviewAPI(id as number),
    select: (resp) => resp.data,
    enabled: !!id,
  });

export const useProductCopyMutation = (
  options?: UseMutationOptions<BaseRESP<ProductDetailRESP>, AxiosError<ErrorRESP>, ProductCopyREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: copyProductAPI,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [PRODUCT_QUERY_KEYS.LIST] });
      options?.onSuccess?.(...args);
    },
  });
};

export const useProductBulkUpdateStatusMutation = (
  options?: UseMutationOptions<BaseRESP<ProductBulkStatusRESP>, AxiosError<ErrorRESP>, ProductBulkStatusREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: bulkUpdateProductStatusAPI,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [PRODUCT_QUERY_KEYS.LIST] });
      options?.onSuccess?.(...args);
    },
  });
};

export const useProductBulkUpdateMutation = (
  options?: UseMutationOptions<BaseRESP<ProductBulkUpdateRESP>, AxiosError<ErrorRESP>, ProductBulkUpdateREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: bulkUpdateProductsAPI,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [PRODUCT_QUERY_KEYS.LIST] });
      queryClient.invalidateQueries({ queryKey: [PRODUCT_QUERY_KEYS.DETAIL] });
      options?.onSuccess?.(...args);
    },
  });
};

export const useProductBulkDeleteMutation = (
  options?: UseMutationOptions<BaseRESP<ProductBulkDeleteRESP>, AxiosError<ErrorRESP>, ProductBulkDeleteREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: bulkDeleteProductsAPI,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [PRODUCT_QUERY_KEYS.LIST] });
      options?.onSuccess?.(...args);
    },
  });
};

export const useProductUpdateMesSettingsMutation = (
  options?: UseMutationOptions<BaseRESP<ProductDetailRESP>, AxiosError<ErrorRESP>, ProductMesSettingsREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: updateProductMesSettingsAPI,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [PRODUCT_QUERY_KEYS.LIST] });
      queryClient.invalidateQueries({ queryKey: [PRODUCT_QUERY_KEYS.DETAIL] });
      options?.onSuccess?.(...args);
    },
  });
};
