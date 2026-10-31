import type { MallFaqSectionView } from '@/data/pages/home-mall.service';
import { getMyPageFaqPath } from '@/utils/constants/route.constant';
import { CaretDownIcon, CaretUpIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

type FaqSectionProps = {
  data?: MallFaqSectionView;
};

const FaqSection = ({ data }: FaqSectionProps) => {
  const { t: tCommon } = useTranslation('common');
  const [openIds, setOpenIds] = useState<Record<string | number, boolean>>({});

  const items = data?.items ?? [];

  const toggleItem = (id: string | number) => {
    setOpenIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (!data || items.length === 0) return null;

  return (
    <section className='flex flex-col gap-5'>
      <div className='flex items-end justify-between gap-5'>
        <p className='md:text-display-sm text-2xl font-bold text-neutral-950'>{data.title || 'FAQs'}</p>
        <Link to={getMyPageFaqPath()} className='text-md text-blue-brand-700 font-bold hover:underline'>
          {data.viewAllLabel || tCommon('button.see_more')}
        </Link>
      </div>

      <div className='flex w-full flex-col gap-2'>
        {items.map((item) => {
          const isOpen = Boolean(openIds[item.id]);

          return (
            <div key={item.id} className='w-full rounded-[12px] border border-neutral-200 bg-white p-4 transition-all'>
              <button
                type='button'
                onClick={() => toggleItem(item.id)}
                className='flex w-full cursor-pointer items-start justify-between gap-4 text-left select-none'>
                <p className='flex-1 text-sm leading-5 font-medium break-words text-[#C9A84C]'>{item.question}</p>
                <span className='flex shrink-0 items-center gap-0.5 text-sm leading-5 font-medium text-neutral-500'>
                  {isOpen ? '접기' : '펼치기'}
                  {isOpen ? <CaretUpIcon className='size-3.5' /> : <CaretDownIcon className='size-3.5' />}
                </span>
              </button>

              {isOpen && (
                <div
                  className='mt-3 border-t border-neutral-100 pt-3 text-sm leading-relaxed break-words text-neutral-700 [&_p]:mb-2 [&_p:last-child]:mb-0'
                  dangerouslySetInnerHTML={{ __html: item.answer || item.cleanAnswer }}
                />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FaqSection;
