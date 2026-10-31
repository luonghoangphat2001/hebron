import PageTitle from '@/components/PageTitle';
import AppSelect from '@/components/select/AppSelect';
import { appToast } from '@/components/toast/AppToast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import {
  exportDashboardCustomerStaticAPI,
  exportDashboardOrderStaticAPI,
  exportDashboardProductStaticAPI,
  getExportHistoryAPI,
} from '@/data/dashboard/dashboard.api';
import type {
  DashboardCustomerStaticREQ,
  DashboardOrderStaticREQ,
  DashboardProductStaticREQ,
} from '@/data/dashboard/dashboard.request';
import { DASHBOARD_QUERY_KEYS } from '@/data/dashboard/dashboard.query';
import { getPeriodRange } from '@/data/dashboard/dashboard.service';
import useDebounce from '@/hooks/useDebounce';
import { useExportExcel } from '@/hooks/useExportExcel';
import { cn } from '@/lib/utils';
import { BLOCKED_NUMBER_KEYS } from '@/utils/constants/common.constant';
import {
  DASHBOARD_GROUP_BY_VALUES,
  DASHBOARD_PERIOD_VALUES,
  PAYMENT_STAT_PERIOD_VALUES,
  PRODUCT_TOP_N,
} from '@/utils/constants/dashboard.constant';
import { ExportFileName } from '@/utils/enums/common.enum';
import { DashboardGroupBy, DashboardPeriod, PaymentStatPeriod } from '@/utils/enums/dashboard.enum';
import { Download } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import CustomerStatistics from './components/CustomerStatistics';
import InquiryStatistics from './components/InquiryStatistics';
import MemberStatistics from './components/MemberStatistics';
import OrderStatistics from './components/OrderStatistics';
import PaymentStatistics from './components/PaymentStatistics';
import ProductStatistics from './components/ProductStatistics';

const TABS = ['member', 'customer', 'order', 'product', 'inquiry', 'payment'] as const;

const TAB_PARAM_KEY = 'tab';

const StatisticsPage = () => {
  const { t: tSidebar } = useTranslation('sidebar');
  const { t: tCommon } = useTranslation('common');
  const { t } = useTranslation('dashboard');
  const [searchParams, setSearchParams] = useSearchParams();
  const [salesRepInput, setSalesRepInput] = useState('');
  const [salesRep, setSalesRep] = useState('');
  const [period, setPeriod] = useState(DashboardPeriod.THIRTY_DAYS);
  const [groupBy, setGroupBy] = useState(DashboardGroupBy.DAILY);
  const [paymentPeriod, setPaymentPeriod] = useState(PaymentStatPeriod.MONTHLY);
  const [productLimit, setProductLimit] = useState(PRODUCT_TOP_N);
  const [limitInput, setLimitInput] = useState(String(PRODUCT_TOP_N));

  useDebounce(salesRepInput, setSalesRep);

  // Empty or invalid input falls back to the default rather than sending a broken limit.
  const commitLimit = useCallback((value: string) => {
    const parsed = Math.floor(Number(value));
    setProductLimit(Number.isFinite(parsed) && parsed > 0 ? parsed : PRODUCT_TOP_N);
  }, []);
  useDebounce(limitInput, commitLimit);

  const periodOptions = useMemo(
    () => DASHBOARD_PERIOD_VALUES.map((value) => ({ value, label: t(`filter.period.${value}` as 'filter.period.7d') })),
    [t],
  );
  const paymentPeriodOptions = useMemo(
    () =>
      PAYMENT_STAT_PERIOD_VALUES.map((value) => ({
        value,
        label: t(`filter.payment_period.${value}` as 'filter.payment_period.monthly'),
      })),
    [t],
  );
  const groupByOptions = useMemo(
    () => DASHBOARD_GROUP_BY_VALUES.map((value) => ({ value, label: t(`filter.group_by.${value}` as 'filter.group_by.daily') })),
    [t],
  );

  const activeTab = TABS.find((tab) => tab === searchParams.get(TAB_PARAM_KEY)) ?? TABS[0];
  const isMemberTab = activeTab === 'member';
  const isCustomerTab = activeTab === 'customer';
  const isOrderTab = activeTab === 'order';
  const isProductTab = activeTab === 'product';
  const isInquiryTab = activeTab === 'inquiry';
  const isPaymentTab = activeTab === 'payment';
  // Every tab but payments filters by the shared 7d / 30d period.
  const isPeriodTab = !isCustomerTab && !isPaymentTab;
  const canExport = isCustomerTab || isOrderTab || isProductTab;

  const exportCallbacks = {
    progressFn: getExportHistoryAPI,
    onProcessing: () => appToast.success(tCommon('notify.export_processing')),
    onSuccess: () => appToast.success(tCommon('notify.export_success')),
    onError: () => appToast.error(tCommon('notify.export_fail')),
  };

  const { handleExport: exportCustomerStatistics, isExporting: isExportingCustomer } = useExportExcel<DashboardCustomerStaticREQ>(
    {
      queryKey: DASHBOARD_QUERY_KEYS.EXPORT_PROGRESS,
      exportFn: exportDashboardCustomerStaticAPI,
      exportFileName: ExportFileName.CUSTOMER_STATISTICS,
      ...exportCallbacks,
    },
  );

  const { handleExport: exportOrderStatistics, isExporting: isExportingOrder } = useExportExcel<DashboardOrderStaticREQ>({
    queryKey: DASHBOARD_QUERY_KEYS.EXPORT_PROGRESS,
    exportFn: exportDashboardOrderStaticAPI,
    exportFileName: ExportFileName.ORDER_STATISTICS,
    ...exportCallbacks,
  });

  const { handleExport: exportProductStatistics, isExporting: isExportingProduct } = useExportExcel<DashboardProductStaticREQ>({
    queryKey: DASHBOARD_QUERY_KEYS.EXPORT_PROGRESS,
    exportFn: exportDashboardProductStaticAPI,
    exportFileName: ExportFileName.PRODUCT_STATISTICS,
    ...exportCallbacks,
  });

  const isExporting = isExportingCustomer || isExportingOrder || isExportingProduct;

  const handleSelectTab = (value: string) => {
    setSearchParams(
      (prev) => {
        prev.set(TAB_PARAM_KEY, value);
        return prev;
      },
      { replace: true },
    );
  };

  const handleExport = () => {
    if (isCustomerTab) return exportCustomerStatistics({ sales_representative: salesRep || undefined });
    if (isOrderTab) return exportOrderStatistics({ period });
    if (isProductTab) return exportProductStatistics({ ...getPeriodRange(period), limit: productLimit });
  };

  return (
    <main className='space-y-6'>
      <header className='space-y-4'>
        <div className='space-y-1'>
          <PageTitle
            title={tSidebar('statistical_management')}
            extra={
              canExport && (
                <Button variant='outline' className='gap-2' disabled={isExporting} onClick={handleExport}>
                  {isExporting ? <Spinner /> : <Download className='size-4' />} {tCommon('button.export_excel')}
                </Button>
              )
            }
          />
          <p className='text-muted-foreground text-sm'>{t('statistics.description')}</p>
        </div>

        <div role='tablist' className='flex items-center gap-6 overflow-x-auto border-b border-gray-200'>
          {TABS.map((tab) => (
            <button
              key={tab}
              type='button'
              role='tab'
              aria-selected={activeTab === tab}
              onClick={() => handleSelectTab(tab)}
              className={cn(
                'relative min-h-11 shrink-0 cursor-pointer py-3 text-sm whitespace-nowrap transition-colors',
                activeTab === tab ? 'text-primary font-medium' : 'text-gray-600 hover:text-gray-800',
              )}>
              {t(`statistics.tab.${tab}` as 'statistics.tab.customer')}
              {activeTab === tab && <span className='bg-primary absolute right-0 bottom-0 left-0 h-0.5' />}
            </button>
          ))}
        </div>

        <div className='flex flex-wrap items-center gap-3'>
          {isPeriodTab && (
            <AppSelect
              options={periodOptions}
              value={period}
              onChange={(v) => v && setPeriod(v)}
              clearable={false}
              className='w-44'
            />
          )}
          {isOrderTab && (
            <AppSelect
              options={groupByOptions}
              value={groupBy}
              onChange={(v) => v && setGroupBy(v)}
              clearable={false}
              className='w-36'
            />
          )}
          {isProductTab && (
            <div className='flex items-center gap-2'>
              <span className='text-muted-foreground shrink-0 text-sm'>{t('statistics.product.limit')}</span>
              <Input
                type='number'
                min={1}
                value={limitInput}
                onChange={(e) => setLimitInput(e.target.value)}
                onKeyDown={(e) => BLOCKED_NUMBER_KEYS.includes(e.key) && e.preventDefault()}
                className='w-24'
              />
            </div>
          )}
          {isCustomerTab && (
            <Input
              value={salesRepInput}
              onChange={(e) => setSalesRepInput(e.target.value)}
              placeholder={t('statistics.search_sales_rep')}
              className='w-64'
            />
          )}
          {isPaymentTab && (
            <AppSelect
              options={paymentPeriodOptions}
              value={paymentPeriod}
              onChange={(v) => v && setPaymentPeriod(v)}
              clearable={false}
              className='w-44'
            />
          )}
        </div>

        <Separator />
      </header>

      {isMemberTab && <MemberStatistics period={period} />}
      {isCustomerTab && <CustomerStatistics salesRep={salesRep} />}
      {isOrderTab && <OrderStatistics period={period} groupBy={groupBy} />}
      {isProductTab && <ProductStatistics period={period} limit={productLimit} />}
      {isInquiryTab && <InquiryStatistics period={period} />}
      {isPaymentTab && <PaymentStatistics period={paymentPeriod} />}
    </main>
  );
};

export default StatisticsPage;
