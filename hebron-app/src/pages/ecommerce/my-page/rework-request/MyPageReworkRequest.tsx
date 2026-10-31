import CustomTablePagination from '@/components/table/CustomTablePagination';
import { useInquiriesQuery } from '@/data/inquiries/inquiries.query';
import MyPageHeader from '@/pages/ecommerce/my-page/components/MyPageHeader';
import ReworkRequestTable from '@/pages/ecommerce/my-page/rework-request/components/ReworkRequestTable';
import { MY_PAGE_LIST_PAGE_SIZE_OPTIONS } from '@/utils/constants/pagination.constant';
import { REWORK_REQUEST_TABLE_LABELS } from '@/utils/constants/rework-request.constant';
import { getMyPageReworkRequestCreatePath } from '@/utils/constants/route.constant';
import { InquiryCategory } from '@/utils/enums/inquiry.enum';
import { useMemo, useState } from 'react';

const MyPageReworkRequest = () => {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState<number>(MY_PAGE_LIST_PAGE_SIZE_OPTIONS[0]);

  const listParams = useMemo(
    () => ({
      page: pageIndex + 1,
      per_page: pageSize,
      category: InquiryCategory.REWORK,
    }),
    [pageIndex, pageSize],
  );

  const { data, isLoading, isFetching } = useInquiriesQuery(listParams);

  const items = data?.data.inquiries ?? [];
  const totalRows = data?.pagination.total_item ?? 0;
  const pageCount = Math.max(1, data?.pagination.total_page ?? 1);
  const safePageIndex = Math.min(pageIndex, pageCount - 1);

  const paginationProps = {
    pageIndex: safePageIndex,
    pageCount,
    totalRows,
    pageSize,
    pageSizeOptions: MY_PAGE_LIST_PAGE_SIZE_OPTIONS,
    onPageChange: setPageIndex,
    onPageSizeChange: (size: number) => {
      setPageSize(size);
      setPageIndex(0);
    },
  };

  return (
    <div className='flex w-full min-w-0 flex-col gap-6'>
      <MyPageHeader
        title={REWORK_REQUEST_TABLE_LABELS.pageTitle}
        createTo={getMyPageReworkRequestCreatePath()}
        createLabel={REWORK_REQUEST_TABLE_LABELS.create}
      />

      <ReworkRequestTable
        items={items}
        emptyMessage={isLoading || isFetching ? REWORK_REQUEST_TABLE_LABELS.loading : REWORK_REQUEST_TABLE_LABELS.empty}
        footer={<CustomTablePagination {...paginationProps} />}
      />

      <div className='flex justify-center md:hidden'>
        <CustomTablePagination {...paginationProps} compact />
      </div>
    </div>
  );
};

export default MyPageReworkRequest;
