import { Navigate, useParams } from 'react-router-dom';

import { getPortfolioNeighborsFromList, mapPortfolioToDetailView } from '@/data/portfolios/portfolios.mapper';
import { usePortfolioDetailQuery, usePortfoliosQuery } from '@/data/portfolios/portfolios.query';
import { PORTFOLIO_PAGE_LABELS } from '@/utils/constants/portfolio.constant';
import { BRAND_ROUTE } from '@/utils/constants/route.constant';
import { SITE_TYPE } from '@/utils/constants/site.constant';

import PortfolioDetailContent from './components/PortfolioDetailContent';
import PortfolioPageLayout from './PortfolioPageLayout';

const PortfolioDetailPage = () => {
  const { id = '' } = useParams<{ id: string }>();

  const { data, isLoading, isError } = usePortfolioDetailQuery(id, {
    enabled: Boolean(id),
  });

  const { data: listData } = usePortfoliosQuery(
    {
      site_type: SITE_TYPE.BRAND_SITE,
      page: 1,
      per_page: 100,
    },
    { enabled: Boolean(id) },
  );

  if (!id) {
    return <Navigate to={BRAND_ROUTE.PORTFOLIO} replace />;
  }

  if (isError || (!isLoading && !data?.data.portfolio)) {
    return <Navigate to={BRAND_ROUTE.PORTFOLIO} replace />;
  }

  if (isLoading || !data?.data.portfolio) {
    return (
      <PortfolioPageLayout>
        <p className='py-24 text-center text-sm text-neutral-500' role='status'>
          {PORTFOLIO_PAGE_LABELS.loading}
        </p>
      </PortfolioPageLayout>
    );
  }

  const detail = mapPortfolioToDetailView(data.data.portfolio);
  const { next } = getPortfolioNeighborsFromList(listData?.data.portfolios ?? [], id);

  return (
    <PortfolioPageLayout>
      <PortfolioDetailContent detail={detail} next={next} />
    </PortfolioPageLayout>
  );
};

export default PortfolioDetailPage;
