import CustomTablePagination from '@/components/table/CustomTablePagination';
import { appToast } from '@/components/toast/AppToast';
import { myPageOrdersAPI } from '@/data/orders/mypage-orders.api';
import { MY_PAGE_ORDER_QUERY_KEYS, useMyPageOrdersQuery } from '@/data/orders/mypage-orders.query';
import { mapMyPageOrderHistoryToRecentOrders } from '@/data/orders/orders.mapper';
import { useExportExcel } from '@/hooks/useExportExcel';
import MyPagePageTitle from '@/pages/ecommerce/my-page/components/MyPagePageTitle';
import MyPageSearchToolbar from '@/pages/ecommerce/my-page/components/MyPageSearchToolbar';
import OrdersTable from '@/pages/ecommerce/my-page/components/OrdersTable';
import { ORDER_TABLE_LABELS, ORDER_TABLE_PAGE_LABELS } from '@/utils/constants/orders.constant';
import { MY_PAGE_LIST_PAGE_SIZE_OPTIONS } from '@/utils/constants/pagination.constant';
import { ExportType } from '@/utils/enums/common.enum';
import { formatDate, getExportErrorMessage } from '@/utils/helper/common.helper';
import { useState } from 'react';

const MyPageOrders = () => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState<number>(MY_PAGE_LIST_PAGE_SIZE_OPTIONS[0]);

  const listParams = {
    page: pageIndex + 1,
    per_page: pageSize,
    order_number_keyword: searchKeyword.trim() || undefined,
  };

  const { data, isLoading, isFetching } = useMyPageOrdersQuery(listParams);
  const { handleExport, isExporting } = useExportExcel({
    queryKey: MY_PAGE_ORDER_QUERY_KEYS.exportProgresses(),
    exportFn: myPageOrdersAPI.exportExcel,
    progressFn: myPageOrdersAPI.checkExportProgress,
    downloadFileName: `주문/배송 조회_${formatDate()}.xlsx`,
    onProcessing: () => appToast.info('엑셀 파일을 준비하고 있습니다.'),
    onSuccess: () => appToast.success('엑셀 파일이 다운로드되었습니다.'),
    onError: (error, retry) => {
      const message = getExportErrorMessage(error);
      if (!message) return;

      appToast.error(
        message,
        retry
          ? {
              action: {
                label: '다시 시도',
                onClick: retry,
              },
            }
          : undefined,
      );
    },
  });
  const orders = mapMyPageOrderHistoryToRecentOrders(data?.data.orders ?? []);

  const totalRows = data?.pagination.total_item ?? 0;
  const pageCount = Math.max(1, data?.pagination.total_page ?? 1);
  const safePageIndex = Math.min(pageIndex, pageCount - 1);

  const handleSearchKeywordChange = (value: string) => {
    setSearchKeyword(value);
    setPageIndex(0);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPageIndex(0);
  };

  const handleExcelDownload = () => {
    handleExport({
      ...listParams,
      export_type: ExportType.ALL,
    });
  };

  const paginationProps = {
    pageIndex: safePageIndex,
    pageCount,
    totalRows,
    pageSize,
    pageSizeOptions: MY_PAGE_LIST_PAGE_SIZE_OPTIONS,
    onPageChange: setPageIndex,
    onPageSizeChange: handlePageSizeChange,
  };

  const emptyMessage = isLoading || isFetching ? ORDER_TABLE_PAGE_LABELS.loading : ORDER_TABLE_LABELS.empty;

  return (
    <div className='flex w-full min-w-0 flex-col gap-6'>
      <MyPagePageTitle>주문/배송 조회</MyPagePageTitle>

      <MyPageSearchToolbar
        defaultValue={searchKeyword}
        onDebouncedChange={handleSearchKeywordChange}
        searchAriaLabel='주문 검색'
        onExcelDownload={handleExcelDownload}
        isExcelDownloading={isExporting}
      />

      <OrdersTable
        orders={orders}
        statusHighlightMode='payment-and-correction'
        emptyMessage={emptyMessage}
        footer={<CustomTablePagination {...paginationProps} />}
      />

      <div className='flex justify-center md:hidden'>
        <CustomTablePagination {...paginationProps} compact />
      </div>
    </div>
  );
};

export default MyPageOrders;
