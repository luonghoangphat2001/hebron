import { OrderStatus } from '@/utils/enums/order.enum';

export const CUSTOMER_ORDER_STEPS = [
  { key: 'order_received', label: '주문접수' },
  { key: 'design_confirmation_requested', label: '시안확인요청' },
  { key: 'design_confirmed', label: '시안확정' },
  { key: 'in_production', label: '상품제작중' },
  { key: 'shipped', label: '발송완료' },
] as const;

const CUSTOMER_STAGE_BY_STATUS: Record<string, string> = {
  [OrderStatus.DRAFT]: 'order_received',
  [OrderStatus.PENDING]: 'order_received',
  [OrderStatus.AWAITING_PAYMENT]: 'order_received',
  [OrderStatus.CONFIRMED]: 'order_received',
  [OrderStatus.PENDING_RECEPTION]: 'order_received',
  [OrderStatus.DESIGN_CONFIRMATION_REQUESTED]: 'design_confirmation_requested',
  [OrderStatus.DESIGN_REJECTED]: 'design_revision_requested',
  [OrderStatus.PENDING_CORRECTION]: 'design_revision_requested',
  [OrderStatus.FILE_ERROR]: 'design_revision_requested',
  [OrderStatus.DESIGN_CONFIRMED]: 'design_confirmed',
  [OrderStatus.TYPESETTING]: 'in_production',
  [OrderStatus.OUTPUT_OF_POWER]: 'in_production',
  [OrderStatus.PRINT]: 'in_production',
  [OrderStatus.POST_PROCESSING]: 'in_production',
  [OrderStatus.PRODUCTION_DONE]: 'in_production',
  [OrderStatus.READY_TO_SHIP]: 'in_production',
  [OrderStatus.SHIPPING]: 'shipped',
  [OrderStatus.SHIPPED]: 'shipped',
  [OrderStatus.DELIVERY_COMPLETED]: 'shipped',
  [OrderStatus.COMPLETED]: 'shipped',
  [OrderStatus.PURCHASE_CONFIRMED]: 'shipped',
};

export const getCustomerOrderStage = (status: string, customerStatus?: string | null) =>
  customerStatus ?? CUSTOMER_STAGE_BY_STATUS[status] ?? status;

export const getCustomerOrderLabel = (status: string, fallback: string, customerStatus?: string | null) => {
  const stage = getCustomerOrderStage(status, customerStatus);
  if (stage === 'design_revision_requested') return '시안 수정요청';
  return CUSTOMER_ORDER_STEPS.find(({ key }) => key === stage)?.label ?? fallback;
};
