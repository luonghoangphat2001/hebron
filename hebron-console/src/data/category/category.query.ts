import { PICKER_PAGE_SIZE } from '@/utils/constants/common.constant';
import { getNextPageParam } from '@/utils/helper/common.helper';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { flattenCategories } from './category.service';
import { flattenCategoryNodes } from '@/utils/helper/homepage.helper';
import { applyCategoryMove, moveCategoryProduct } from './category.tree';
import {
  createCategoryAPI,
  deleteCategoryAPI,
  getCategoryDetailAPI,
  getCategoryListAPI,
  getCategoryProductsAPI,
  updateCategoryAPI,
  updateCategoryExposureAPI,
  updateCategoryParentAPI,
  updateCategoryProductPositionAPI,
  updateCategorySortOrderAPI,
  uploadCategoryExposureImageAPI,
} from './category.api';
import type {
  CategoryCreateREQ,
  CategoryExposureInfoREQ,
  CategoryListREQ,
  CategoryMoveVariables,
  CategoryProductPositionREQ,
  CategoryUpdateInfoREQ,
  CategoryUpdateSortOrderREQ,
  CategoryUploadExposureImage,
} from './category.request';
import type { BaseRESP, PaginationRESP } from '@/utils/types/response.type';
import type { CateGoryDetailRESP, CateGoryListRESP, CategoryListSnapshot, CategoryProductPages } from './category.response';

export const CATEGORY_QUERY_KEYS = {
  LIST: 'CATEGORY_LIST',
  INFINITE: 'CATEGORY_INFINITE',
  DETAIL: 'CATEGORY_DETAIL',
  EXPORT_PROGRESS: 'CATEGORY_EXPORT_PROGRESS',
  PRODUCTS: 'CATEGORY_PRODUCTS',
};

// tree is always ordered by sort_order asc unless the caller overrides it
export const useCategoryListQuery = (params: CategoryListREQ) => {
  const query: CategoryListREQ = { sort_by: 'sort_order', sort_order: 'asc', ...params };

  return useQuery({
    queryKey: [CATEGORY_QUERY_KEYS.LIST, query],
    queryFn: () => getCategoryListAPI(query),
  });
};

export const useCategoryInfiniteQuery = (params?: Omit<CategoryListREQ, 'page'>) =>
  useInfiniteQuery({
    queryKey: [CATEGORY_QUERY_KEYS.INFINITE, params],
    queryFn: ({ pageParam }) => getCategoryListAPI({ per_page: PICKER_PAGE_SIZE, ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => getNextPageParam(lastPage.pagination),
    select: (data) => flattenCategories(data.pages.flatMap((page) => page.data.categories)),
  });

export const useCategoryNodeInfiniteQuery = (params?: Omit<CategoryListREQ, 'page'>) =>
  useInfiniteQuery({
    queryKey: [CATEGORY_QUERY_KEYS.INFINITE, 'nodes', params],
    queryFn: ({ pageParam = 1 }) => getCategoryListAPI({ per_page: PICKER_PAGE_SIZE, ...params, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => getNextPageParam(lastPage.pagination),
    select: (data) => {
      const allCategories = data.pages.flatMap((page) => page.data.categories);
      return {
        pages: data.pages,
        categories: allCategories,
        flatCategories: flattenCategoryNodes(allCategories),
      };
    },
  });

export const useCategoryDetailQuery = (id?: number) =>
  useQuery({
    queryKey: [CATEGORY_QUERY_KEYS.DETAIL, id],
    queryFn: () => getCategoryDetailAPI(id as number),
    select: (resp) => resp.data,
    enabled: !!id,
  });

export const useCategoryCreateMutation = (
  option?: UseMutationOptions<BaseRESP<CateGoryDetailRESP>, AxiosError, CategoryCreateREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation<BaseRESP<CateGoryDetailRESP>, AxiosError, CategoryCreateREQ>({
    mutationFn: createCategoryAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORY_QUERY_KEYS.LIST] });
    },
    ...option,
  });
};

export const useCategoryUpdateMutation = (
  option?: UseMutationOptions<BaseRESP<CateGoryDetailRESP>, AxiosError, CategoryUpdateInfoREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation<BaseRESP<CateGoryDetailRESP>, AxiosError, CategoryUpdateInfoREQ>({
    mutationFn: updateCategoryAPI,
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: [CATEGORY_QUERY_KEYS.LIST] });
      queryClient.invalidateQueries({ queryKey: [CATEGORY_QUERY_KEYS.DETAIL, vars.id] });
    },
    ...option,
  });
};

export type CategoryExposureUpdateVariables = {
  id: number;
  body: CategoryExposureInfoREQ;
};

export const useCategoryExposureUpdateMutation = (
  option?: UseMutationOptions<BaseRESP<CateGoryDetailRESP>, AxiosError, CategoryExposureUpdateVariables>,
) => {
  const queryClient = useQueryClient();

  return useMutation<BaseRESP<CateGoryDetailRESP>, AxiosError, CategoryExposureUpdateVariables>({
    mutationFn: ({ id, body }) => updateCategoryExposureAPI(id, body),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: [CATEGORY_QUERY_KEYS.LIST] });
      queryClient.invalidateQueries({ queryKey: [CATEGORY_QUERY_KEYS.DETAIL, vars.id] });
    },
    ...option,
  });
};

export const useCategorySortOrderUpdateMutation = (
  option?: UseMutationOptions<BaseRESP<string>, AxiosError, CategoryUpdateSortOrderREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation<BaseRESP<string>, AxiosError, CategoryUpdateSortOrderREQ>({
    mutationFn: updateCategorySortOrderAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORY_QUERY_KEYS.LIST] });
    },
    ...option,
  });
};

/**
 * One drag & drop gesture. A re-parent needs both calls (parent first, then the sort-order batch);
 * a plain reorder is the batch alone.
 */
export const useCategoryMoveMutation = (
  option?: UseMutationOptions<BaseRESP<string>, AxiosError, CategoryMoveVariables, CategoryListSnapshot>,
) => {
  const queryClient = useQueryClient();

  return useMutation<BaseRESP<string>, AxiosError, CategoryMoveVariables, CategoryListSnapshot>({
    mutationFn: async ({ id, parentId, isReparent, categories }) => {
      if (isReparent) await updateCategoryParentAPI(id, parentId);
      return updateCategorySortOrderAPI({ categories });
    },
    // the tree moves on drop; the refetch only confirms it.
    // cancelQueries aborts in-flight list fetches synchronously — deliberately not awaited, so the
    // patch lands in the same render as the drop instead of one frame later, which is what makes
    // the reorder animate in one go rather than snapping back first
    onMutate: (vars) => {
      queryClient.cancelQueries({ queryKey: [CATEGORY_QUERY_KEYS.LIST] });
      const snapshot = queryClient.getQueriesData<PaginationRESP<CateGoryListRESP>>({ queryKey: [CATEGORY_QUERY_KEYS.LIST] });

      queryClient.setQueriesData<PaginationRESP<CateGoryListRESP>>({ queryKey: [CATEGORY_QUERY_KEYS.LIST] }, (old) =>
        old ? { ...old, data: { ...old.data, categories: applyCategoryMove(old.data.categories, vars.id, vars) } } : old,
      );

      return snapshot;
    },
    onError: (_error, _vars, snapshot) => {
      snapshot?.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: (_data, _error, vars) => {
      queryClient.invalidateQueries({ queryKey: [CATEGORY_QUERY_KEYS.LIST] });
      queryClient.invalidateQueries({ queryKey: [CATEGORY_QUERY_KEYS.DETAIL, vars.id] });
    },
    ...option,
  });
};

export const useCategoryProductInfiniteQuery = (categoryId: number) =>
  useInfiniteQuery({
    queryKey: [CATEGORY_QUERY_KEYS.PRODUCTS, categoryId],
    queryFn: ({ pageParam }) => getCategoryProductsAPI(categoryId, { current_page: pageParam, per_page: PICKER_PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => getNextPageParam(lastPage.pagination),
    select: (data) => ({
      products: data.pages.flatMap((page) => page.data.products),
      total: data.pages[0]?.pagination?.total_item ?? 0,
    }),
  });

export const useCategoryProductPositionMutation = (
  option?: UseMutationOptions<BaseRESP<unknown>, AxiosError, CategoryProductPositionREQ, CategoryProductPages | undefined>,
) => {
  const queryClient = useQueryClient();

  return useMutation<BaseRESP<unknown>, AxiosError, CategoryProductPositionREQ, CategoryProductPages | undefined>({
    mutationFn: updateCategoryProductPositionAPI,
    // cancelling also reverts an in-flight refetch to the data it started from, so a stale response can never land on top of this move
    onMutate: ({ categoryId, productId, position }) => {
      const queryKey = [CATEGORY_QUERY_KEYS.PRODUCTS, categoryId];
      queryClient.cancelQueries({ queryKey });
      const snapshot = queryClient.getQueryData<CategoryProductPages>(queryKey);
      queryClient.setQueryData<CategoryProductPages>(queryKey, (old) => old && moveCategoryProduct(old, productId, position));
      return snapshot;
    },
    onError: (_error, { categoryId }, snapshot) => {
      queryClient.setQueryData([CATEGORY_QUERY_KEYS.PRODUCTS, categoryId], snapshot);
    },
    onSettled: (_data, _error, { categoryId }) => {
      // Keep reordering disabled until the authoritative order (including unloaded destinations) is refreshed.
      return queryClient.invalidateQueries({ queryKey: [CATEGORY_QUERY_KEYS.PRODUCTS, categoryId] });
    },
    ...option,
  });
};

export const useCategoryDeleteMutation = (option?: UseMutationOptions<BaseRESP<null>, AxiosError, number>) => {
  const queryClient = useQueryClient();

  return useMutation<BaseRESP<null>, AxiosError, number>({
    mutationFn: deleteCategoryAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORY_QUERY_KEYS.LIST] });
    },
    ...option,
  });
};

export const useCategoryUploadExposureImageMutation = (
  option?: UseMutationOptions<BaseRESP<{ path: string; url: string }>, AxiosError, CategoryUploadExposureImage>,
) =>
  useMutation<BaseRESP<{ path: string; url: string }>, AxiosError, CategoryUploadExposureImage>({
    mutationFn: uploadCategoryExposureImageAPI,
    ...option,
  });
