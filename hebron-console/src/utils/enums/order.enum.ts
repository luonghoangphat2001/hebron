export enum OrderStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  AWAITING_PAYMENT = 'awaiting_payment',
  CONFIRMED = 'confirmed',
  PURCHASE_CONFIRMED = 'purchase_confirmed',
  PENDING_RECEPTION = 'pending_reception',
  FILE_ERROR = 'file_error',
  PENDING_CORRECTION = 'pending_correction',
  TYPESETTING = 'typesetting',
  OUTPUT_OF_POWER = 'output_of_power',
  PRINT = 'print',
  POST_PROCESSING = 'post_processing',
  PRODUCTION_DONE = 'production_done',
  READY_TO_SHIP = 'ready_to_ship',
  SHIPPING = 'shipping',
  SHIPPED = 'shipped',
  DELIVERY_COMPLETED = 'delivery_completed',
  COMPLETED = 'completed',
  DESIGN_CONFIRMATION_REQUESTED = 'design_confirmation_requested',
  DESIGN_CONFIRMED = 'design_confirmed',
  DESIGN_REJECTED = 'design_rejected',
  CANCELLED = 'cancelled',
  REFUND_REQUESTED = 'refund_requested',
  REFUND_COMPLETED = 'refund_completed',

  // Backward compatibility aliases
  PAYMENT_COMPLETE = 'payment_completed',
  ORDER_CONFIRMATION = 'order_confirmed',
  IN_PRODUCTION = 'in_production',
}

export enum OrderStatusStage {
  PAYMENT_COMPLETED = 'payment_completed',
  ORDER_CONFIRMED = 'order_confirmed',
  IN_PRODUCTION = 'in_production',
  SHIPPING = 'shipping',
  DELIVERED = 'delivered',
}

// Draft file design-confirmation workflow — tracked separately from OrderStatus
export enum DraftStatus {
  DRAFT_CONFIRMATION_REQUEST = 'DRAFT_CONFIRMATION_REQUEST',
  READY_FOR_PRINT = 'READY_FOR_PRINT',
  REQUEST_REWORK = 'REQUEST_REWORK',
}

export enum OrderSortby {
  PLACED_AT = 'placed_at',
  ORDER_NUMBER = 'order_number',
  TOTAL_AMOUNT = 'total_amount',
  STATUS = 'status',
}

export enum PaymentMethod {
  CARD = 'card',
  TOSS = 'toss',
  TRANSFER = 'transfer',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  PAID = 'paid',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
  EXPIRED = 'expired',
}

export enum ShippingMethod {
  COURIER = 'courier',
}
