import type { ProductDesign, ProductDesignState } from '@/utils/helper/guest-cart.helper';
import { DesignAPI } from './design.api';
import type { DesignCreateREQ, DesignUpdateREQ } from './design.request';
import type { DesignGroup } from './design.response';

type ProductDesignMetadata = {
  schema: 'hebron-product-design-v1';
  product_slug: string;
  state: ProductDesignState;
  preview_front: string;
  preview_back?: string;
};

const isProductDesignMetadata = (value: unknown): value is ProductDesignMetadata => {
  if (!value || typeof value !== 'object') return false;
  const metadata = value as Partial<ProductDesignMetadata>;
  return metadata.schema === 'hebron-product-design-v1' && Boolean(metadata.state) && typeof metadata.preview_front === 'string';
};

export const buildProductDesignMetadata = (
  productSlug: string,
  state: ProductDesignState,
  previewFront: string,
  previewBack?: string,
): ProductDesignMetadata => ({
  schema: 'hebron-product-design-v1',
  product_slug: productSlug,
  state,
  preview_front: previewFront,
  preview_back: previewBack,
});

export const mapDesignGroupToProductDesign = (group: DesignGroup): ProductDesign | undefined => {
  if (!isProductDesignMetadata(group.metadata)) return undefined;

  const timestamp = new Date().toISOString();
  return {
    id: String(group.id),
    designRevision: group.design_revision,
    productId: group.product_id ?? 0,
    productSlug: group.metadata.product_slug,
    state: group.metadata.state,
    previewFront: group.metadata.preview_front,
    previewBack: group.metadata.preview_back,
    createdAt: group.created_at || timestamp,
    updatedAt: group.updated_at || timestamp,
  };
};

export const readProductDesign = async (id: string): Promise<ProductDesign | undefined> => {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) return undefined;
  const response = await DesignAPI.detail(numericId);
  return mapDesignGroupToProductDesign(response.data);
};

export const createProductDesign = async (payload: DesignCreateREQ) => {
  const response = await DesignAPI.create(payload);
  return mapDesignGroupToProductDesign(response.data.design_group);
};

export const updateProductDesign = async (payload: DesignUpdateREQ) => {
  const response = await DesignAPI.update(payload);
  return mapDesignGroupToProductDesign(response.data.design_group);
};
