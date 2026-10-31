import { PortfolioCategoryIcon } from '@/assets/images';
import type { PortfolioCardView } from '@/data/portfolios/portfolios.mapper';
import { getBrandPortfolioDetailPath } from '@/utils/constants/route.constant';
import { formatKoreanDate } from '@/utils/helper/date.helper';
import { Link } from 'react-router-dom';

type PortfolioCardProps = {
  item: PortfolioCardView;
};

const PortfolioCard = ({ item }: PortfolioCardProps) => {
  return (
    <Link to={getBrandPortfolioDetailPath(item.id)} className='flex flex-col gap-3'>
      <div className='aspect-4/3 overflow-hidden rounded-2xl bg-neutral-900'>
        <img src={item.image} alt={item.title} className='h-full w-full object-cover' />
      </div>

      <div className='flex flex-col gap-2'>
        <span className='flex h-6 w-fit items-center gap-1.5 rounded-md bg-[#2958A6] px-2 text-sm text-white'>
          <img src={PortfolioCategoryIcon} alt='' className='size-3.5' aria-hidden />
          {item.category}
        </span>
        <h3 className='text-xl font-bold text-[#C9A84C]'>{item.title}</h3>
        <p className='text-sm font-medium'>
          <span className='text-gray-90'>{item.category}</span>
          <span className='text-white'>{formatKoreanDate(item.date)}</span>
        </p>
      </div>
    </Link>
  );
};

export default PortfolioCard;
