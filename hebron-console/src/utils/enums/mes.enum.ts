export enum MesLogResult {
  SUCCESS = 'success',
  FAILED = 'failed',
}

export enum MesConnectionStatus {
  CONNECTED = 'Connected',
  DISCONNECTED = 'Disconnected',
}

export enum MesDirection {
  MALL_TO_MES = 'mall_to_mes',
  MES_TO_MALL = 'mes_to_mall',
}

export enum MesTriggerType {
  ORDER_CREATED = 'order_created',
  CONFIRM_DESIGN = 'confirm_design',
  STOCK_INFO = 'stock_info',
  INVENTORY_UPDATED = 'inventory_updated',
  ORDER_STATUS = 'order_status',
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
