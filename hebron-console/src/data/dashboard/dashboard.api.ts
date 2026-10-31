import { api } from '@/api';
import type { ExportExcelRESP, ExportHistoryRESP } from '@/utils/types/export.type';
import type { BaseRESP } from '@/utils/types/response.type';
import type {
  DashboardCustomerStaticREQ,
  DashboardInquiryStaticREQ,
  DashboardMemberStaticREQ,
  DashboardOperationREQ,
  DashboardOrderStaticREQ,
  DashboardPaymentStaticREQ,
  DashboardProductStaticREQ,
} from './dashboard.request';
import type {
  DashboardCustomerStaticRESP,
  DashboardInquiryStaticRESP,
  DashboardMemberStaticRESP,
  DashboardOperationRESP,
  DashboardOrderStaticRESP,
  DashboardPaymentStaticRESP,
  DashboardProductStaticRESP,
} from './dashboard.response';

const END_POINT = {
  ROOT: '/admin/dashboard',
  EXPORT_HISTORY: '/admin/export-history',
};

const wrapHistory = async (request: Promise<BaseRESP<ExportHistoryRESP>>): Promise<BaseRESP<ExportExcelRESP>> => ({
  data: { history: (await request).data },
});

export const getExportHistoryAPI = (historyId: number): Promise<BaseRESP<ExportExcelRESP>> =>
  wrapHistory(api.get(`${END_POINT.EXPORT_HISTORY}/${historyId}`));

export const getDashboardOperationAPI = (params: DashboardOperationREQ): Promise<BaseRESP<DashboardOperationRESP>> =>
  api.get(`${END_POINT.ROOT}/overview/operation`, { params });

export const getDashboardCustomerStaticAPI = (
  params: DashboardCustomerStaticREQ,
): Promise<BaseRESP<DashboardCustomerStaticRESP>> => api.get(`${END_POINT.ROOT}/statics/customer-static`, { params });

export const exportDashboardCustomerStaticAPI = (params: DashboardCustomerStaticREQ): Promise<BaseRESP<ExportExcelRESP>> =>
  wrapHistory(api.get(`${END_POINT.ROOT}/statics/customer-static`, { params: { ...params, export: true } }));

export const getDashboardMemberStaticAPI = (params: DashboardMemberStaticREQ): Promise<BaseRESP<DashboardMemberStaticRESP>> =>
  api.get(`${END_POINT.ROOT}/statics/members-static`, { params });

export const getDashboardOrderStaticAPI = (params: DashboardOrderStaticREQ): Promise<BaseRESP<DashboardOrderStaticRESP>> =>
  api.get(`${END_POINT.ROOT}/statics/order-static`, { params });

export const exportDashboardOrderStaticAPI = (params: DashboardOrderStaticREQ): Promise<BaseRESP<ExportExcelRESP>> =>
  wrapHistory(api.get(`${END_POINT.ROOT}/statics/order-static`, { params: { ...params, export: true } }));

export const getDashboardPaymentStaticAPI = (params: DashboardPaymentStaticREQ): Promise<BaseRESP<DashboardPaymentStaticRESP>> =>
  api.get(`${END_POINT.ROOT}/statics/payment-static`, { params });

export const getDashboardProductStaticAPI = (params: DashboardProductStaticREQ): Promise<BaseRESP<DashboardProductStaticRESP>> =>
  api.get(`${END_POINT.ROOT}/statics/products-static`, { params });

/** Same endpoint with `export=true`: queues an export job and returns the file it will produce. */
export const exportDashboardProductStaticAPI = (params: DashboardProductStaticREQ): Promise<BaseRESP<ExportExcelRESP>> =>
  wrapHistory(api.get(`${END_POINT.ROOT}/statics/products-static`, { params: { ...params, export: true } }));

export const getDashboardInquiryStaticAPI = (params: DashboardInquiryStaticREQ): Promise<BaseRESP<DashboardInquiryStaticRESP>> =>
  api.get(`${END_POINT.ROOT}/statics/inquiry-static`, { params });
