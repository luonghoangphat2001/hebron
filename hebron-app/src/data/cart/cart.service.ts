import { readProductDesign } from '@/data/design/product-design.service';
import { type GuestCartItem } from '@/utils/helper/guest-cart.helper';
import type { CartItemCreateREQ } from './cart.request';
import type { CartDetailRESP, CartItemRESP, CartProductRESP } from './cart.response';

const getProductName = (product: CartProductRESP) =>
  typeof product.name === 'string' ? product.name : product.name.ko || product.name.en || product.name_en || product.slug;

const mapCartItemToGuestCartItem = async (item: CartItemRESP): Promise<GuestCartItem> => {
  const designId = item.design_group?.id;
  const design = designId ? await readProductDesign(String(designId)) : undefined;

  return {
    id: String(item.id),
    designId: designId ? String(designId) : undefined,
    designContentId: item.order_design_content?.id,
    productId: item.product_id,
    productSlug: item.product.slug,
    productName: getProductName(item.product),
    productImage: item.product.images[0],
    sku: item.product.sku,
    price: (item.sale_price ?? item.product.selling_price ?? 0) + (item.option_price ?? 0),
    quantity: item.quantity,
    previewFront: design?.previewFront || '',
    previewBack: design?.previewBack,
    design: design?.state,
    content: item.order_design_content
      ? {
          title: item.order_design_content.title,
          recipientName: item.order_design_content.recipient_name,
          message: item.order_design_content.main_text,
          date: item.order_design_content.event_date_ko || item.order_design_content.event_date,
          sender: item.order_design_content.sender_name,
        }
      : undefined,
    selectedOptions: item.selected_options.map(({ group, option }) => ({
      groupId: group.id,
      groupName: group.name,
      optionId: option.id,
      optionName: option.name,
      additionalPrice: option.additional_price,
    })),
    createdAt: item.created_at,
    specification: item.product.specification || undefined,
  };
};

export const mapGuestCartItemToCreateRequest = (item: GuestCartItem): CartItemCreateREQ => {
  const designGroupId = Number(item.designId);
  const hasDesignGroup = Number.isInteger(designGroupId) && designGroupId > 0;
  const hasDesignContent =
    typeof item.designContentId === 'number' && Number.isInteger(item.designContentId) && item.designContentId > 0;

  return {
    product_id: item.productId,
    quantity: item.quantity,
    ...(hasDesignGroup ? { design_group_id: designGroupId } : {}),
    ...(hasDesignContent ? { order_design_content_id: item.designContentId } : {}),
    selected_options: item.selectedOptions?.map((option) => ({
      group_id: option.groupId,
      option_id: option.optionId,
    })),
  };
};

export const mapCartDetailToGuestCartItems = async ({ cart }: CartDetailRESP): Promise<GuestCartItem[]> => {
  return Promise.all(cart.items.map(mapCartItemToGuestCartItem));
};
