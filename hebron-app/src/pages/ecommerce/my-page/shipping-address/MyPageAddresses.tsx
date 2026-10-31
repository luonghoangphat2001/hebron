import DebouncedSearchInput from '@/components/search/DebouncedSearchInput';
import CustomTablePagination from '@/components/table/CustomTablePagination';
import { Button } from '@/components/ui/button';
import { useShippingAddressesQuery } from '@/data/shipping-addresses/shipping-addresses.query';
import MyPageHeader from '@/pages/ecommerce/my-page/components/MyPageHeader';
import ShippingAddressTable from '@/pages/ecommerce/my-page/shipping-address/components/ShippingAddressTable';
import { MY_PAGE_LIST_PAGE_SIZE_OPTIONS } from '@/utils/constants/pagination.constant';
import { getMyPageAddressCreatePath } from '@/utils/constants/route.constant';
import { SHIPPING_ADDRESS_TABLE_LABELS } from '@/utils/constants/shipping-address.constant';
import { MicrosoftExcelLogoIcon } from '@phosphor-icons/react';
import { useMemo, useState } from 'react';

const MyPageAddresses = () => {
  const [search, setSearch] = useState('');
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState<number>(MY_PAGE_LIST_PAGE_SIZE_OPTIONS[0]);

  const listParams = useMemo(
    () => ({
      page: pageIndex + 1,
      per_page: pageSize,
      ...(search ? { search } : {}),
    }),
    [pageIndex, pageSize, search],
  );

  const { data, isLoading, isFetching } = useShippingAddressesQuery(listParams);

  const addresses = data?.data.addresses ?? [];
  const totalRows = data?.data?.pagination?.total_item ?? 0;
  const pageCount = Math.max(1, data?.data?.pagination?.total_page ?? 1);
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
        title={SHIPPING_ADDRESS_TABLE_LABELS.pageTitle}
        createTo={getMyPageAddressCreatePath()}
        createLabel={SHIPPING_ADDRESS_TABLE_LABELS.addAddress}
      />

      <div className='flex items-center justify-between gap-2'>
        <DebouncedSearchInput
          placeholder='직접입력'
          aria-label={SHIPPING_ADDRESS_TABLE_LABELS.searchAriaLabel}
          className='flex-1 sm:max-w-sm'
          onDebouncedChange={(value) => {
            setSearch(value.trim());
            setPageIndex(0);
          }}
        />
        <Button variant='outline' className='h-10 shrink-0 gap-2 whitespace-nowrap'>
          <MicrosoftExcelLogoIcon className='size-4 shrink-0 text-green-600' weight='duotone' />
          엑셀 다운로드
        </Button>
      </div>

      <ShippingAddressTable
        addresses={addresses}
        emptyMessage={isLoading || isFetching ? SHIPPING_ADDRESS_TABLE_LABELS.loading : SHIPPING_ADDRESS_TABLE_LABELS.empty}
        footer={<CustomTablePagination {...paginationProps} />}
      />

      <div className='flex justify-center md:hidden'>
        <CustomTablePagination {...paginationProps} compact />
      </div>
    </div>
  );
};

export default MyPageAddresses;
