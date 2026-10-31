import DebouncedSearchInput from '@/components/search/DebouncedSearchInput';
import CustomTablePagination from '@/components/table/CustomTablePagination';
import { Button } from '@/components/ui/button';
import { useNoticesQuery } from '@/data/notices/notices.query';
import MyPagePageTitle from '@/pages/ecommerce/my-page/components/MyPagePageTitle';
import NoticeTable from '@/pages/ecommerce/my-page/notice/components/NoticeTable';
import { NOTICE_TABLE_LABELS } from '@/utils/constants/notice.constant';
import { MY_PAGE_LIST_PAGE_SIZE_OPTIONS } from '@/utils/constants/pagination.constant';
import { MicrosoftExcelLogoIcon } from '@phosphor-icons/react';
import { useMemo, useState } from 'react';

const MyPageNotice = () => {
  const [title, setTitle] = useState('');
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState<number>(MY_PAGE_LIST_PAGE_SIZE_OPTIONS[0]);

  const listParams = useMemo(
    () => ({
      page: pageIndex + 1,
      per_page: pageSize,
      ...(title ? { title } : {}),
    }),
    [pageIndex, pageSize, title],
  );

  const { data, isLoading, isFetching } = useNoticesQuery(listParams);

  const notices = data?.data.notices ?? [];
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
      <MyPagePageTitle>{NOTICE_TABLE_LABELS.pageTitle}</MyPagePageTitle>

      <div className='flex items-center justify-between gap-2'>
        <DebouncedSearchInput
          placeholder='직접입력'
          aria-label={NOTICE_TABLE_LABELS.searchAriaLabel}
          className='flex-1 sm:max-w-sm'
          onDebouncedChange={(value) => {
            setTitle(value.trim());
            setPageIndex(0);
          }}
        />
        <Button variant='outline' className='h-10 shrink-0 gap-2 whitespace-nowrap'>
          <MicrosoftExcelLogoIcon className='size-4 shrink-0 text-green-600' weight='duotone' />
          엑셀 다운로드
        </Button>
      </div>

      <NoticeTable
        notices={notices}
        pageIndex={safePageIndex}
        pageSize={pageSize}
        emptyMessage={isLoading || isFetching ? NOTICE_TABLE_LABELS.loading : NOTICE_TABLE_LABELS.empty}
        footer={<CustomTablePagination {...paginationProps} />}
      />

      <div className='flex justify-center md:hidden'>
        <CustomTablePagination {...paginationProps} compact />
      </div>
    </div>
  );
};

export default MyPageNotice;
