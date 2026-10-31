import { Product1 } from '@/assets/images';
import { getCustomerOrderLabel, getCustomerOrderStage } from '@/data/orders/customer-order-status';
import type { MyPageOrderHistoryListItemRESP } from '@/data/orders/mypage-orders.response';
import type { OrderLineItemRESP, OrderRESP } from '@/data/orders/orders.response';
import { formatPrice } from '@/utils/helper/common.helper';
import type { OrderDetail, OrderDetailProduct, RecentOrder } from '@/utils/types/my-page.type';
import dayjs from 'dayjs';

const formatOrderDateTime = (value: string) => dayjs(value).format('YYYY-MM-DD HH:mm');

const parseAmount = (value: string | number) => (typeof value === 'number' ? value : Number(value) || 0);

const getLineItemThumbnail = (item: OrderLineItemRESP) => item.configuration.product_snapshot.images[0] ?? Product1;

const getLineItemSpecs = (item: OrderLineItemRESP) =>
  item.configuration.product_snapshot.short_description ?? item.configuration.product_snapshot.description ?? '-';

const mapOrderLineItemsToProducts = (items: OrderLineItemRESP[]): OrderDetailProduct[] =>
  items.map((item) => ({
    id: String(item.id),
    name: item.title,
    thumbnail: getLineItemThumbnail(item),
    quantity: item.quantity,
    price: item.sub_total_amount,
    configuration: item.configuration || null,
    order_design_content: item.order_design_content,
    design_group: item.design_group,
  }));

export const mapOrderToRecentOrder = (order: OrderRESP): RecentOrder => {
  const firstItem = order.items?.[0];

  return {
    id: order.order_number,
    orderDateTime: formatOrderDateTime(order.created_at),
    productName: firstItem?.title ?? '-',
    productCode: order.order_number,
    productSpecs: firstItem ? getLineItemSpecs(firstItem) : '-',
    productSpecification: firstItem?.configuration.product_snapshot.specification,
    productStockQuantity: firstItem?.configuration.product_snapshot.stock_quantity,
    selectedOptionValues: firstItem?.configuration.selected_option_values ?? [],
    thumbnail: firstItem ? getLineItemThumbnail(firstItem) : Product1,
    quantity: firstItem ? String(firstItem.quantity) : '-',
    amount: parseAmount(order.totals.total),
    status: getCustomerOrderLabel(order.status, order.status_label_ko, order.customer_status),
  };
};

export const mapOrderToOrderDetail = (order: OrderRESP): OrderDetail => ({
  id: order.order_number,
  orderCode: order.order_number,
  currentProductionStepKey: getCustomerOrderStage(order.status, order.customer_status),
  orderer: {
    name: order.contact.name,
    phone: order.contact.phone,
  },
  customerManager: {
    name: '미지정',
    assignedDate: '-',
  },
  products: mapOrderLineItemsToProducts(order.items ?? []),
  shipping: {
    recipientName: order.shipping.name,
    recipientPhone: order.shipping.phone,
    zipCode: order.shipping.postcode,
    address: [order.shipping.address, order.shipping.address_detail].filter(Boolean).join(' '),
    method: order.shipping.method,
    carrier: order.shipping.shipping_carrier ?? '-',
    fee: parseAmount(order.totals.shipping_fee),
    feeLabel: formatPrice(parseAmount(order.totals.shipping_fee)),
    shippedDate: order.shipping.shipped_date ? formatOrderDateTime(order.shipping.shipped_date) : '-',
    estimatedShippingDate: order.shipping.estimated_shipping_date ?? '-',
    trackingNumber: order.shipping.invoice_number || order.shipping.tracking_number || '-',
  },
  payment: {
    method: order.payment_method,
    status: order.payment_status,
    paidAt: order.metadata.placed_at ? formatOrderDateTime(order.metadata.placed_at) : '-',
    productAmount: parseAmount(order.totals.subtotal),
    shippingAmount: parseAmount(order.totals.shipping_fee),
    totalAmount: parseAmount(order.totals.total),
    taxAmount: parseAmount(order.totals.tax),
  },
});

export const mapOrdersToRecentOrders = (orders: OrderRESP[]) => orders.map(mapOrderToRecentOrder);

export const mapMyPageOrderHistoryItemToRecentOrder = (order: MyPageOrderHistoryListItemRESP): RecentOrder => ({
  id: order.order_number,
  orderDateTime: formatOrderDateTime(order.ordered_at),
  productName: order.product_name,
  productCode: order.order_number,
  productSpecs: order.product_spec.product_snapshot.short_description ?? order.product_spec.product_snapshot.description ?? '-',
  productSpecification: order.product_spec.product_snapshot.specification,
  productStockQuantity: order.product_spec.product_snapshot.stock_quantity,
  selectedOptionValues: order.product_spec.selected_option_values ?? [],
  thumbnail: order.product_spec.product_snapshot.images[0] || order.thumbnail_url || Product1,
  quantity: String(order.quantity),
  amount: parseAmount(order.amount),
  status: getCustomerOrderLabel(order.status, order.status_label, order.customer_status),
});

export const mapMyPageOrderHistoryToRecentOrders = (orders: MyPageOrderHistoryListItemRESP[]) =>
  orders.map(mapMyPageOrderHistoryItemToRecentOrder);
