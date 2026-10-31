import type { MediaDetailView } from '@/data/media/media.service';
import { BRAND_ROUTE } from '@/utils/constants/route.constant';
import { formatDateTime } from '@/utils/helper/date.helper';
import { CaretLeftIcon } from '@phosphor-icons/react';
import DOMPurify from 'dompurify';
import { Link } from 'react-router-dom';

type MediaDetailContentProps = {
  detail: MediaDetailView;
};

const MediaDetailContent = ({ detail }: MediaDetailContentProps) => {
  const categoryLabel = detail.categoryName || detail.media;
  const formattedDate = detail.publishedAt ? formatDateTime(detail.publishedAt) : '';

  return (
    <section className='mx-auto flex max-w-3xl flex-col px-4 pt-10 pb-16 text-white'>
      <div className='flex flex-col gap-4'>
        <div className='flex items-center gap-2 text-sm text-neutral-400'>
          {formattedDate && <time dateTime={detail.publishedAt}>{formattedDate}</time>}
          {categoryLabel && (
            <>
              {formattedDate && <span aria-hidden>·</span>}
              <span className='flex items-center gap-1.5 font-medium text-[#C9A84C]'>{categoryLabel}</span>
            </>
          )}
        </div>

        <h1 className='text-display-sm font-bold text-white'>{detail.title}</h1>

        {detail.content ? (
          <div
            className='flex flex-col gap-4 text-base leading-relaxed text-neutral-300 [&_*]:!bg-transparent [&_*]:!font-sans [&_*]:!text-inherit [&_a]:!text-[#C9A84C] [&_a]:underline [&_b]:!text-white [&_h1]:!text-white [&_h2]:!text-white [&_h3]:!text-white [&_h4]:!text-white [&_img]:my-4 [&_img]:max-w-full [&_img]:rounded-lg [&_p]:mb-3 [&_p:last-child]:mb-0 [&_span]:!text-neutral-300 [&_strong]:!text-white'
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(detail.content, {
                FORBID_TAGS: ['font'],
                FORBID_ATTR: ['style'],
              }),
            }}
          />
        ) : null}
      </div>

      <nav className='mt-16 flex items-center justify-between gap-4' aria-label='언론보도 상세 내비게이션'>
        <Link
          to={BRAND_ROUTE.MEDIA}
          className='flex items-center gap-1 text-sm font-medium text-neutral-400 transition hover:text-white'>
          <CaretLeftIcon className='size-4' weight='bold' />
          목록
        </Link>
      </nav>
    </section>
  );
};

export default MediaDetailContent;
