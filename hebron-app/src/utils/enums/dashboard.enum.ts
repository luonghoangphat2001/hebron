export enum DashboardGroup {
  ORDER = 'order',
  PRODUCTION = 'production',
  DESIGN = 'design',
  DELIVERY = 'delivery',
}

export enum OrderBucket {
  // Temporary frontend key until the backend provides the order-received bucket.
  ORDER_RECEIVED = 'order_received',
  PAYMENT_COMPLETED = 'payment_completed',
  PREPARING_PRODUCT = 'preparing_product',
  SHIPPING = 'shipping',
  DELIVERY_COMPLETED = 'delivery_completed',
}

export enum ProductionBucket {
  AWAITING_PAYMENT = 'awaiting_payment',
  PENDING_RECEPTION = 'pending_reception',
  FILE_ERROR = 'file_error',
  PROOFREADING = 'proofreading',
  TYPESETTING = 'typesetting',
  PRINTING_OUTPUT = 'printing_output',
  PRESS = 'press',
  POST_PROCESSING = 'post_processing',
  PRODUCTION_DONE = 'production_done',
}

export enum DesignBucket {
  AWAITING_PAYMENT = 'awaiting_payment',
  PENDING_RECEPTION = 'pending_reception',
  DESIGNING = 'designing',
  DRAFT_DELIVERY = 'draft_delivery',
  DESIGN_DONE = 'design_done',
}

export enum DeliveryBucket {
  PICKUP = 'pickup',
  COURIER = 'courier',
  QUICK = 'quick',
  DIRECT = 'direct',
  DELIVERED = 'delivered',
}

export enum DashboardInquiryCategory {
  PRODUCT = 'product',
  QUOTE = 'quote',
  SHIPPING = 'shipping',
  PAYMENT = 'payment',
  REWORK = 'rework',
  REFUND = 'refund',
}

export type DashboardBucketKey = ProductionBucket | DesignBucket | DeliveryBucket | string;
