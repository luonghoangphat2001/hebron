import { DraftStatus, OrderStatus } from '../enums/order.enum';

export const ORDER_STATUS_BADGE: Record<string, string> = {
  [OrderStatus.DRAFT]: 'bg-gray-100 text-gray-600 rounded-sm',
  [OrderStatus.PENDING]: 'bg-amber-100 text-amber-600 rounded-sm',
  [OrderStatus.AWAITING_PAYMENT]: 'bg-amber-100 text-amber-600 rounded-sm',
  [OrderStatus.CONFIRMED]: 'bg-blue-100 text-blue-600 rounded-sm',
  [OrderStatus.PURCHASE_CONFIRMED]: 'bg-blue-100 text-blue-600 rounded-sm',
  [OrderStatus.PENDING_RECEPTION]: 'bg-sky-100 text-sky-600 rounded-sm',
  [OrderStatus.FILE_ERROR]: 'bg-red-100 text-red-600 rounded-sm',
  [OrderStatus.PENDING_CORRECTION]: 'bg-orange-100 text-orange-600 rounded-sm',
  [OrderStatus.TYPESETTING]: 'bg-indigo-100 text-indigo-600 rounded-sm',
  [OrderStatus.OUTPUT_OF_POWER]: 'bg-purple-100 text-purple-600 rounded-sm',
  [OrderStatus.PRINT]: 'bg-violet-100 text-violet-600 rounded-sm',
  [OrderStatus.POST_PROCESSING]: 'bg-fuchsia-100 text-fuchsia-600 rounded-sm',
  [OrderStatus.PRODUCTION_DONE]: 'bg-emerald-100 text-emerald-600 rounded-sm',
  [OrderStatus.READY_TO_SHIP]: 'bg-teal-100 text-teal-600 rounded-sm',
  [OrderStatus.SHIPPING]: 'bg-indigo-100 text-indigo-600 rounded-sm',
  [OrderStatus.SHIPPED]: 'bg-cyan-100 text-cyan-600 rounded-sm',
  [OrderStatus.DELIVERY_COMPLETED]: 'bg-green-100 text-green-600 rounded-sm',
  [OrderStatus.COMPLETED]: 'bg-green-100 text-green-700 rounded-sm',
  [OrderStatus.DESIGN_CONFIRMATION_REQUESTED]: 'bg-yellow-100 text-yellow-600 rounded-sm',
  [OrderStatus.DESIGN_CONFIRMED]: 'bg-emerald-100 text-emerald-600 rounded-sm',
  [OrderStatus.DESIGN_REJECTED]: 'bg-rose-100 text-rose-600 rounded-sm',
  [OrderStatus.CANCELLED]: 'bg-red-100 text-red-700 rounded-sm',
  [OrderStatus.REFUND_REQUESTED]: 'bg-pink-100 text-pink-600 rounded-sm',
  [OrderStatus.REFUND_COMPLETED]: 'bg-slate-100 text-slate-600 rounded-sm',
};

export const DRAFT_STATUS_BADGE: Record<DraftStatus, string> = {
  [DraftStatus.DRAFT_CONFIRMATION_REQUEST]: 'bg-yellow-100 text-yellow-600 rounded-sm',
  [DraftStatus.READY_FOR_PRINT]: 'bg-green-100 text-green-600 rounded-sm',
  [DraftStatus.REQUEST_REWORK]: 'bg-red-100 text-red-600 rounded-sm',
};
