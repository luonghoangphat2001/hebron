import { MesLogResult, type HttpMethod, type MesDirection, type MesTriggerType } from '@/utils/enums/mes.enum';

/** Integration status dashboard (section 1) */
export type MesIntegrationStatus = {
  connection_status: string;
  last_sync_time: string;
  response_time: number;
  success_rate: number; // 0–100
  failed_requests_today: number;
  total_requests_today: number;
};

export type MesRetryHistoryItem = {
  attempt: number;
  attempted_at: string;
  status_code: number;
  message: string;
};

export type MesRequestBody = {
  orderInfo: MesOrderInfo;
  productInfo: MesProductInfo[];
};

export type MesResponseHeader = {
  P3P: string[];
  Date: string[];
  Server: string[];
  Connection: string[];
  'Set-Cookie': string[];
  'Content-Type': string[];
  'X-Powered-By': string[];
  [key: string]: string[];
};

export type MesResponseBody = {
  code: string;
  [key: string]: unknown;
};

export type MesOrderInfo = {
  sid: string;
  demand: string | null;
  order_id: string;
  send_name: string;
  order_date: string;
  recive_date: string | null;
  send_hphone: string;
  total_price: number;
};

export type MesProductInfo = {
  amount: number;
  prdname: string | null;
  sellPrice: number;
};

/** Integration log row + detail (section 2) */
export type MesLog = {
  id: number | string;
  direction: MesDirection;
  trigger_type: MesTriggerType;
  reference_type: string;
  reference_type_label: string;
  reference_id: number | string;
  http_method: HttpMethod;
  endpoint: string;
  request_headers: string;
  request_body: MesRequestBody;
  response_status: number;
  response_headers: MesResponseHeader;
  response_body: MesResponseBody;
  status: MesLogResult;
  duration_ms: number | null;
  error_message: string | null;
  requested_at: string;
  responded_at: string;
  created_at: string;
  updated_at: string;
};

export type MesIntegrationStatusRESP = {
  dashboard: MesIntegrationStatus;
};

export type MesLogListRESP = {
  mes_integration_logs: MesLog[];
};

export type MesLogDetailRESP = {
  mes_integration_log: MesLog;
};
