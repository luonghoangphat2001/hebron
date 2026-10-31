import { useEffect, useMemo, useState } from 'react';

import { mapPortfolioToCardView } from '@/data/portfolios/portfolios.mapper';
import { usePortfoliosQuery } from '@/data/portfolios/portfolios.query';
import { PORTFOLIO_PAGE_LABELS, PORTFOLIO_PAGE_SIZE } from '@/utils/constants/portfolio.constant';
import { SITE_TYPE } from '@/utils/constants/site.constant';
import debounce from 'lodash/debounce';

import BrandPagination from '@/pages/brand/components/BrandPagination';
import PortfolioCard from './PortfolioCard';
import PortfolioSearchBar from './PortfolioSearchBar';

const SEARCH_DEBOUNCE_MS = 600;

const PortfolioContentSection = () => {
  const [search, setSearch] = useState('');
  const [title, setTitle] = useState('');
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    const commit = debounce((value: string) => {
      setTitle(value.trim());
      setPageIndex(0);
    }, SEARCH_DEBOUNCE_MS);

    commit(search);

    return () => commit.cancel();
  }, [search]);

  const listParams = useMemo(
    () => ({
      site_type: SITE_TYPE.BRAND_SITE,
      page: pageIndex + 1,
      per_page: PORTFOLIO_PAGE_SIZE,
      ...(title ? { title } : {}),
    }),
    [pageIndex, title],
  );

  const { data, isLoading, isFetching, isError } = usePortfoliosQuery(listParams);

  const items = useMemo(() => (data?.data.portfolios ?? []).map(mapPortfolioToCardView), [data]);

  const pageCount = Math.max(1, data?.pagination.total_page ?? 1);
  const safePageIndex = Math.min(pageIndex, pageCount - 1);

  const emptyMessage = isLoading || isFetching ? PORTFOLIO_PAGE_LABELS.loading : PORTFOLIO_PAGE_LABELS.empty;

  return (
    <>
      <PortfolioSearchBar value={search} onChange={setSearch} />

      {items.length > 0 ? (
        <div className='grid grid-cols-1 gap-6.5 md:grid-cols-4'>
          {items.map((item) => (
            <PortfolioCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <p className='py-16 text-center text-sm text-neutral-500' role='status'>
          {isError ? PORTFOLIO_PAGE_LABELS.empty : emptyMessage}
        </p>
      )}

      <BrandPagination pageIndex={safePageIndex} pageCount={pageCount} onPageChange={setPageIndex} />
    </>
  );
};

export default PortfolioContentSection;
