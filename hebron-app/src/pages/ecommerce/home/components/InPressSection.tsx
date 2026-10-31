import { mapInPressItems, type MallInPressSectionView } from '@/data/pages/home-mall.service';
import { useIsMobile } from '@/hooks/useIsMobile';
import { ArrowLeftIcon, ArrowRightIcon } from '@phosphor-icons/react';
import { useEffect, useMemo, useState } from 'react';

const ITEMS_PER_SLIDE = 6;
const MOBILE_ITEMS_PER_SLIDE = 2;

type InPressSectionProps = {
  data?: MallInPressSectionView;
};

const InPressSection = ({ data }: InPressSectionProps) => {
  const isMobile = useIsMobile();
  const [activeSlide, setActiveSlide] = useState(0);
  const itemsPerSlide = isMobile ? MOBILE_ITEMS_PER_SLIDE : ITEMS_PER_SLIDE;

  const rawItems = useMemo(() => mapInPressItems(data?.items), [data?.items]);

  const inPressSlides = useMemo(
    () =>
      Array.from({ length: Math.ceil(rawItems.length / itemsPerSlide) }, (_, index) =>
        rawItems.slice(index * itemsPerSlide, index * itemsPerSlide + itemsPerSlide),
      ),
    [rawItems, itemsPerSlide],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveSlide(0);
  }, [itemsPerSlide]);

  if (rawItems.length === 0) return null;

  const goToPreviousSlide = () => {
    setActiveSlide((current) => (current === 0 ? inPressSlides.length - 1 : current - 1));
  };

  const goToNextSlide = () => {
    setActiveSlide((current) => (current === inPressSlides.length - 1 ? 0 : current + 1));
  };

  return (
    <section className='space-y-4 md:space-y-8'>
      <div className='flex items-center justify-between'>
        <h2 className='text-blue-brand md:text-display-sm text-xl font-bold whitespace-pre-line md:whitespace-normal'>
          {'언론보도'}
        </h2>
        <div className='flex gap-2'>
          <button
            type='button'
            className='flex size-9 cursor-pointer items-center justify-center rounded-full border border-neutral-200 text-neutral-950 hover:bg-neutral-50'
            onClick={goToPreviousSlide}>
            <ArrowLeftIcon size={20} />
          </button>
          <button
            type='button'
            className='flex size-9 cursor-pointer items-center justify-center rounded-full border border-neutral-200 text-neutral-950 hover:bg-neutral-50'
            onClick={goToNextSlide}>
            <ArrowRightIcon size={20} />
          </button>
        </div>
      </div>
      <div className='overflow-hidden'>
        <div
          className='flex gap-6 transition-transform duration-500 ease-out'
          style={{ transform: `translateX(calc(-${activeSlide} * (100% + 1.5rem)))` }}>
          {inPressSlides.map((slide, index) => (
            <div key={index} className='grid w-full shrink-0 grid-cols-1 gap-6 md:grid-cols-3'>
              {slide.map((item) => (
                <a
                  key={item.id}
                  href={item.link || undefined}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex flex-col space-y-4'>
                  <div className='relative h-68.5 w-full overflow-hidden rounded-xl bg-neutral-100'>
                    {item.image ? (
                      <img src={item.image} alt={item.title || 'in-press'} className='size-full object-cover' />
                    ) : (
                      <div className='flex size-full items-center justify-center p-6 text-center text-neutral-400'>
                        <span className='text-sm font-medium'>{item.title}</span>
                      </div>
                    )}
                  </div>
                  <div className='flex flex-1 flex-col justify-between'>
                    <div>
                      {item.category && <p className='text-blue-brand text-sm font-medium'>{item.category}</p>}
                      <p className='line-clamp-2 text-lg font-semibold'>{item.title}</p>
                      {(item.date || item.subtitle) && (
                        <p className='text-md line-clamp-2 text-neutral-500'>{item.date || item.subtitle}</p>
                      )}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InPressSection;
