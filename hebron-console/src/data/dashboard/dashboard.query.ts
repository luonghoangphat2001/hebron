import { useQuery } from '@tanstack/react-query';
import {
  getDashboardCustomerStaticAPI,
  getDashboardInquiryStaticAPI,
  getDashboardMemberStaticAPI,
  getDashboardOperationAPI,
  getDashboardOrderStaticAPI,
  getDashboardPaymentStaticAPI,
  getDashboardProductStaticAPI,
} from './dashboard.api';
import type {
  DashboardCustomerStaticREQ,
  DashboardInquiryStaticREQ,
  DashboardMemberStaticREQ,
  DashboardOperationREQ,
  DashboardOrderStaticREQ,
  DashboardPaymentStaticREQ,
  DashboardProductStaticREQ,
} from './dashboard.request';

export const DASHBOARD_QUERY_KEYS = {
  OPERATION: 'DASHBOARD_OPERATION',
  CUSTOMER_STATIC: 'DASHBOARD_CUSTOMER_STATIC',
  MEMBER_STATIC: 'DASHBOARD_MEMBER_STATIC',
  ORDER_STATIC: 'DASHBOARD_ORDER_STATIC',
  PAYMENT_STATIC: 'DASHBOARD_PAYMENT_STATIC',
  PRODUCT_STATIC: 'DASHBOARD_PRODUCT_STATIC',
  INQUIRY_STATIC: 'DASHBOARD_INQUIRY_STATIC',
  EXPORT_PROGRESS: 'DASHBOARD_EXPORT_PROGRESS',
};

export const useDashboardOperationQuery = (params: DashboardOperationREQ) =>
  useQuery({
    queryKey: [DASHBOARD_QUERY_KEYS.OPERATION, params],
    queryFn: () => getDashboardOperationAPI(params),
    select: (resp) => resp.data,
  });

export const useDashboardCustomerStaticQuery = (params: DashboardCustomerStaticREQ, enabled = true) =>
  useQuery({
    queryKey: [DASHBOARD_QUERY_KEYS.CUSTOMER_STATIC, params],
    queryFn: () => getDashboardCustomerStaticAPI(params),
    select: (resp) => resp.data,
    enabled,
  });

export const useDashboardMemberStaticQuery = (params: DashboardMemberStaticREQ, enabled = true) =>
  useQuery({
    queryKey: [DASHBOARD_QUERY_KEYS.MEMBER_STATIC, params],
    queryFn: () => getDashboardMemberStaticAPI(params),
    select: (resp) => resp.data,
    enabled,
  });

export const useDashboardOrderStaticQuery = (params: DashboardOrderStaticREQ, enabled = true) =>
  useQuery({
    queryKey: [DASHBOARD_QUERY_KEYS.ORDER_STATIC, params],
    queryFn: () => getDashboardOrderStaticAPI(params),
    select: (resp) => resp.data,
    enabled,
  });

export const useDashboardPaymentStaticQuery = (params: DashboardPaymentStaticREQ, enabled = true) =>
  useQuery({
    queryKey: [DASHBOARD_QUERY_KEYS.PAYMENT_STATIC, params],
    queryFn: () => getDashboardPaymentStaticAPI(params),
    select: (resp) => resp.data,
    enabled,
  });

export const useDashboardProductStaticQuery = (params: DashboardProductStaticREQ, enabled = true) =>
  useQuery({
    queryKey: [DASHBOARD_QUERY_KEYS.PRODUCT_STATIC, params],
    queryFn: () => getDashboardProductStaticAPI(params),
    select: (resp) => resp.data,
    enabled,
  });

export const useDashboardInquiryStaticQuery = (params: DashboardInquiryStaticREQ, enabled = true) =>
  useQuery({
    queryKey: [DASHBOARD_QUERY_KEYS.INQUIRY_STATIC, params],
    queryFn: () => getDashboardInquiryStaticAPI(params),
    select: (resp) => resp.data,
    enabled,
  });
