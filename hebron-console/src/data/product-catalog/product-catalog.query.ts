import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { productCatalogApi } from './product-catalog.api';
import type {
  ProductListParams,
  ProductWrite,
  TemplateBulkDelete,
  TemplateBulkUpdate,
  TemplateListParams,
  TemplateWrite,
} from './product-catalog.types';

export const catalogKeys = {
  products: {
    all: ['admin-products'] as const,
    list: (params: ProductListParams) => ['admin-products', 'list', params] as const,
    detail: (id: number) => ['admin-products', 'detail', id] as const,
    erpGroups: ['admin-products', 'erp-groups'] as const,
  },
  templates: {
    all: ['admin-templates'] as const,
    list: (params: TemplateListParams) => ['admin-templates', 'list', params] as const,
    detail: (id: number) => ['admin-templates', 'detail', id] as const,
  },
  sizeOptions: {
    all: ['admin-size-options'] as const,
    detail: (id: number) => ['admin-size-options', id] as const,
  },
};

export const useProductsQuery = (params: ProductListParams) =>
  useQuery({ queryKey: catalogKeys.products.list(params), queryFn: () => productCatalogApi.products.list(params) });

export const useProductQuery = (id?: number) =>
  useQuery({
    queryKey: catalogKeys.products.detail(id || 0),
    queryFn: () => productCatalogApi.products.detail(id as number),
    enabled: Number.isFinite(id) && !!id,
  });

export const useErpOptionGroupsQuery = () =>
  useQuery({ queryKey: catalogKeys.products.erpGroups, queryFn: productCatalogApi.products.erpGroups });

export const useProductCreateMutation = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProductWrite) => productCatalogApi.products.create(payload),
    onSuccess: () => client.invalidateQueries({ queryKey: catalogKeys.products.all }),
  });
};

export const useProductUpdateMutation = (id: number) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProductWrite) => productCatalogApi.products.update(id, payload),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: catalogKeys.products.all });
      client.invalidateQueries({ queryKey: catalogKeys.products.detail(id) });
    },
  });
};

export const useTemplatesQuery = (params: TemplateListParams) =>
  useQuery({ queryKey: catalogKeys.templates.list(params), queryFn: () => productCatalogApi.templates.list(params) });

export const useTemplateQuery = (id?: number) =>
  useQuery({
    queryKey: catalogKeys.templates.detail(id || 0),
    queryFn: () => productCatalogApi.templates.detail(id as number),
    enabled: Number.isFinite(id) && !!id,
  });

export const useTemplateCreateMutation = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: TemplateWrite) => productCatalogApi.templates.create(payload),
    onSuccess: () => client.invalidateQueries({ queryKey: catalogKeys.templates.all }),
  });
};

export const useTemplateUpdateMutation = (id: number) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: TemplateWrite) => productCatalogApi.templates.update(id, payload),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: catalogKeys.templates.all });
      client.invalidateQueries({ queryKey: catalogKeys.templates.detail(id) });
    },
  });
};

export const useTemplateDeleteMutation = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: productCatalogApi.templates.delete,
    onSuccess: () => client.invalidateQueries({ queryKey: catalogKeys.templates.all }),
  });
};

export const useTemplateBulkUpdateMutation = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: TemplateBulkUpdate) => productCatalogApi.templates.bulkUpdate(payload),
    onSuccess: () => client.invalidateQueries({ queryKey: catalogKeys.templates.all }),
  });
};

export const useTemplateBulkDeleteMutation = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: TemplateBulkDelete) => productCatalogApi.templates.bulkDelete(payload),
    onSuccess: () => client.invalidateQueries({ queryKey: catalogKeys.templates.all }),
  });
};

export const useTemplateCopyMutation = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: number; copy_title: string; copy_layers: boolean }) =>
      productCatalogApi.templates.copy(id, payload),
    onSuccess: () => client.invalidateQueries({ queryKey: catalogKeys.templates.all }),
  });
};

export const useSizeOptionsQuery = () =>
  useQuery({ queryKey: catalogKeys.sizeOptions.all, queryFn: productCatalogApi.sizeOptions.list });

export const useSizeOptionQuery = (id?: number) =>
  useQuery({
    queryKey: catalogKeys.sizeOptions.detail(id || 0),
    queryFn: () => productCatalogApi.sizeOptions.detail(id as number),
    enabled: Number.isFinite(id) && !!id,
  });
