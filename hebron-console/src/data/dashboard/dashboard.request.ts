import type { DashboardPeriod, PaymentStatPeriod } from '@/utils/enums/dashboard.enum';

export type DashboardOperationREQ = {
  period: DashboardPeriod;
};

export type DashboardCustomerStaticREQ = {
  sales_representative?: string;
  export?: boolean;
};

export type DashboardMemberStaticREQ = {
  start_date?: string;
  end_date?: string;
};

export type DashboardOrderStaticREQ = {
  period: DashboardPeriod;
  export?: boolean;
};

export type DashboardPaymentStaticREQ = {
  period: PaymentStatPeriod;
  date_from: string;
  date_to: string;
};

export type DashboardProductStaticREQ = {
  start_date: string;
  end_date: string;
  limit?: number;
  export?: boolean;
};

export type DashboardInquiryStaticREQ = {
  period: DashboardPeriod;
  start_date?: string;
  end_date?: string;
};
