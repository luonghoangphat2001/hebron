import type { PortfolioCardView, PortfolioDetailView } from '@/data/portfolios/portfolios.mapper';
import { BRAND_ROUTE, getBrandPortfolioDetailPath } from '@/utils/constants/route.constant';
import { formatDateTime } from '@/utils/helper/date.helper';
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import DOMPurify from 'dompurify';
import { Link } from 'react-router-dom';

type PortfolioDetailContentProps = {
  detail: PortfolioDetailView;
  next?: PortfolioCardView;
};

const PortfolioDetailContent = ({ detail, next }: PortfolioDetailContentProps) => {
  return (
    <section className='mx-auto flex max-w-3xl flex-col px-4 pt-10 pb-16 text-white'>
      <div className='flex flex-col gap-4'>
        <div className='text-gray-90 flex items-center gap-2 text-sm'>
          <time dateTime={detail.publishedAt}>{formatDateTime(detail.publishedAt)}</time>
          {detail.client && (
            <>
              <span aria-hidden>·</span>
              <span className='flex items-center gap-1.5'>{detail.client}</span>
            </>
          )}
        </div>

        <h1 className='text-display-sm font-bold text-white'>{detail.title}</h1>

        {detail?.content ? (
          <div
            className='flex flex-col gap-4 text-base leading-relaxed text-neutral-300 [&_*]:!text-inherit [&_a]:!text-[#C9A84C] [&_a]:underline [&_b]:!text-white [&_h1]:!text-white [&_h2]:!text-white [&_h3]:!text-white [&_h4]:!text-white [&_img]:my-4 [&_img]:max-w-full [&_img]:rounded-lg [&_p]:mb-3 [&_p:last-child]:mb-0 [&_span]:!text-neutral-300 [&_strong]:!text-white'
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(detail.content),
            }}
          />
        ) : null}
      </div>

      <nav className='mt-16 flex items-center justify-between gap-4' aria-label='포트폴리오 상세 내비게이션'>
        <Link
          to={BRAND_ROUTE.PORTFOLIO}
          className='flex items-center gap-1 text-sm font-medium text-neutral-400 transition hover:text-white'>
          <CaretLeftIcon className='size-4' weight='bold' />
          목록
        </Link>

        {next ? (
          <Link
            to={getBrandPortfolioDetailPath(next.id)}
            className='flex items-center gap-1 text-sm font-medium text-neutral-400 transition hover:text-white'>
            {next.title}
            <CaretRightIcon className='size-4' weight='bold' />
          </Link>
        ) : (
          <span className='text-sm text-neutral-600'>다음 글이 없습니다</span>
        )}
      </nav>
    </section>
  );
};

export default PortfolioDetailContent;
