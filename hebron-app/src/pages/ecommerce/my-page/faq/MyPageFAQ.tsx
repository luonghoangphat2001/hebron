import CustomTablePagination from '@/components/table/CustomTablePagination';
import { useFaqCategoriesQuery, useFaqsQuery } from '@/data/faqs/faqs.query';
import MyPagePageTitle from '@/pages/ecommerce/my-page/components/MyPagePageTitle';
import FAQAccordionList from '@/pages/ecommerce/my-page/faq/components/FAQAccordionList';
import FAQCategoryTabs from '@/pages/ecommerce/my-page/faq/components/FAQCategoryTabs';
import { FAQ_PAGE_LABELS } from '@/utils/constants/faq.constant';
import { MY_PAGE_LIST_PAGE_SIZE_OPTIONS } from '@/utils/constants/pagination.constant';
import { SiteType } from '@/utils/enums/common.enum';
import type { FAQCategory } from '@/utils/types/faq.type';
import { useMemo, useState } from 'react';

const FAQ_SITE_TYPE = SiteType.SHOPPING_MALL;

const MyPageFAQ = () => {
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string>('');
  const [search, setSearch] = useState('');
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState<number>(MY_PAGE_LIST_PAGE_SIZE_OPTIONS[0]);

  const { data: categoryData, isLoading: isCategoriesLoading } = useFaqCategoriesQuery();

  const categories: FAQCategory[] = useMemo(() => {
    const list = categoryData?.data?.categories ?? [];
    return list
      .filter((cat) => cat.is_active)
      .map((cat) => ({
        key: cat.name,
        label: cat.name,
        count: cat.total_post,
      }));
  }, [categoryData]);

  const activeCategoryKey = useMemo(() => {
    if (selectedCategoryKey && categories.some((c) => c.key === selectedCategoryKey)) {
      return selectedCategoryKey;
    }
    return categories.find((c) => (c.count ?? 0) > 0)?.key || categories[0]?.key || '';
  }, [selectedCategoryKey, categories]);

  const listParams = useMemo(
    () => ({
      page: pageIndex + 1,
      per_page: pageSize,
      category: activeCategoryKey || undefined,
      site_type: FAQ_SITE_TYPE,
      ...(search ? { search } : {}),
    }),
    [pageIndex, pageSize, activeCategoryKey, search],
  );

  const { data, isLoading, isFetching } = useFaqsQuery(listParams, {
    enabled: Boolean(activeCategoryKey),
  });

  const items = data?.data.faqs ?? [];
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
      <MyPagePageTitle>{FAQ_PAGE_LABELS.pageTitle}</MyPagePageTitle>

      <FAQCategoryTabs
        categories={categories}
        activeKey={activeCategoryKey}
        isLoading={isCategoriesLoading}
        onChange={(key) => {
          setSelectedCategoryKey(key);
          setPageIndex(0);
        }}
      />

      {/* <div className='flex items-center justify-between gap-2'>
        <DebouncedSearchInput
          placeholder='직접입력'
          aria-label={FAQ_PAGE_LABELS.searchAriaLabel}
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
      </div> */}

      <FAQAccordionList
        items={items}
        isLoading={isLoading || isFetching}
        emptyMessage={FAQ_PAGE_LABELS.empty}
        footer={<CustomTablePagination {...paginationProps} />}
      />

      {!isLoading && !isFetching && items.length > 0 ? (
        <div className='flex justify-center md:hidden'>
          <CustomTablePagination {...paginationProps} compact />
        </div>
      ) : null}
    </div>
  );
};

export default MyPageFAQ;
