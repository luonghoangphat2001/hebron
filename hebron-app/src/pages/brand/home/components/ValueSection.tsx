import { LogoShort } from '@/assets/svgs';
import { BrandScrollReveal, BrandScrollStagger, BrandScrollStaggerItem } from '@/components/brand/BrandScrollReveal';
import { Button } from '@/components/ui/button';
import type { BrandHomeValueCardView, BrandHomeValuesView } from '@/data/pages/pages.mapper';
import { cn } from '@/lib/utils';
import { getMallProductDetailPath } from '@/utils/constants/route.constant';
import { XIcon } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';

type ValueSectionProps = {
  data: BrandHomeValuesView;
};

const ValueDetailPanel = ({ card, onClose }: { card: BrandHomeValueCardView; onClose: () => void }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setHasMoved(false);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeftState(scrollRef.current.scrollLeft);
  };

  const handleMouseLeaveOrUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollRef.current) return;
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    if (Math.abs(walk) > 4) {
      setHasMoved(true);
    }
    e.preventDefault();
    scrollRef.current.scrollLeft = scrollLeftState - walk;
  };

  return (
    <div className='relative flex flex-col overflow-hidden rounded-2xl bg-neutral-950/90 py-[clamp(32px,5.56vw,96px)] text-white backdrop-blur-[30px] md:rounded-none'>
      <button
        type='button'
        aria-label='Close'
        onClick={onClose}
        className='absolute top-4 right-4 z-10 flex size-10 cursor-pointer items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 md:top-8 md:right-8'>
        <XIcon className='size-5' weight='bold' />
      </button>

      <div className='flex flex-col gap-6 md:gap-6'>
        <div className='flex flex-col gap-6 px-[clamp(16px,5.56vw,80px)] md:flex-row md:items-start md:gap-10'>
          <div className='relative h-60 w-full shrink-0 overflow-hidden rounded-lg md:h-[328px] md:w-[500px] lg:w-[590px]'>
            <img src={card.image} alt={card.imageAlt || ''} className='size-full rounded-lg object-cover' />
          </div>

          <div className='flex flex-1 flex-col gap-2 pt-1 pr-8 text-left md:pt-2'>
            <h3 className='text-2xl leading-tight font-bold text-white md:text-[30px] md:leading-[38px] md:font-normal'>
              {card.title}
            </h3>
            {card.description ? (
              <p className='text-sm leading-6 whitespace-pre-line text-white/50 md:text-[16px] md:leading-6'>
                {card.description}
              </p>
            ) : null}
          </div>
        </div>

        {(card.products?.length ?? 0) > 0 ? (
          <div
            ref={scrollRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeaveOrUp}
            onMouseUp={handleMouseLeaveOrUp}
            onMouseMove={handleMouseMove}
            className='flex cursor-grab gap-4 overflow-x-auto px-[clamp(16px,5.56vw,80px)] select-none [scrollbar-width:none] active:cursor-grabbing md:gap-6 [&::-webkit-scrollbar]:hidden'>
            {card.products?.map((product) => {
              const productPath = getMallProductDetailPath(product.slug || product.id);

              return (
                <a
                  key={product.id}
                  href={productPath}
                  target='_blank'
                  rel='noopener noreferrer'
                  draggable={false}
                  onClick={(e) => {
                    if (hasMoved) {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  }}
                  className='flex w-44 shrink-0 cursor-pointer flex-col items-start rounded-lg bg-white/16 p-3 text-left backdrop-blur-[26px] transition-colors duration-200 hover:bg-white/20 md:w-[240px]'>
                  <div className='pointer-events-none aspect-square w-full overflow-hidden rounded-lg bg-neutral-800 select-none'>
                    <img
                      src={product.image}
                      alt={product.title}
                      draggable={false}
                      className='pointer-events-none size-full object-cover transition-transform duration-300 hover:scale-105'
                      loading='lazy'
                    />
                  </div>
                  <div className='pointer-events-none mt-4 flex w-full flex-col gap-1 text-white select-none'>
                    <p className='truncate text-sm leading-6 font-bold md:text-base'>{product.title}</p>
                    <p className='text-sm leading-6 font-normal text-white md:text-base'>{product.price}</p>
                  </div>
                </a>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
};

const ValueSection = ({ data }: ValueSectionProps) => {
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  const toggleExpand = (cardId: string) => {
    setExpandedCardId((prev) => (prev === cardId ? null : cardId));
  };

  const expandedCard = data.cards.find(
    (card) => card.id === expandedCardId && Boolean(card.description || card.products?.length),
  );

  return (
    <section className='mx-auto flex w-full max-w-304 flex-col gap-10 px-4 py-8 text-white sm:px-0 md:py-24'>
      <BrandScrollReveal className='flex flex-col gap-2 md:flex-row md:items-start md:justify-between' variant='fadeUp'>
        <div className='flex flex-1 items-start gap-4'>
          <img src={LogoShort} alt='' className='mt-1 size-6 shrink-0 md:mt-2.5' aria-hidden />
          <p className='text-display-xs md:text-display-md font-bold whitespace-pre-line'>{`${data.heading}`}</p>
        </div>
        <p className='text-sm whitespace-pre-line text-neutral-400 md:max-w-md md:text-sm'>{data.description}</p>
      </BrandScrollReveal>

      <BrandScrollStagger className='grid grid-cols-1 items-start gap-10 md:grid-cols-3 md:gap-12'>
        {data.cards.map((value) => {
          const hasDetailContent = Boolean(value.description || value.products?.length);
          const isExternal = /^https?:\/\//i.test(value.link);
          const isExpanded = expandedCardId === value.id;

          return (
            <BrandScrollStaggerItem key={value.id} className='flex flex-col items-center gap-4 text-center' variant='scaleUp'>
              <div className='aspect-[300/400] w-full overflow-hidden rounded-lg'>
                <img
                  src={value.image}
                  alt={value.imageAlt || ''}
                  className='size-full rounded-lg object-cover'
                  loading='lazy'
                  decoding='async'
                />
              </div>
              <p className='text-display-xs md:text-display-sm'>{value.title}</p>
              <p className='md:text-md text-sm whitespace-pre-line text-neutral-400'>{value.subtitle}</p>
              {hasDetailContent ? (
                <Button
                  type='button'
                  size='lg'
                  variant='outline'
                  onClick={() => toggleExpand(value.id)}
                  aria-expanded={isExpanded}
                  className={cn(
                    'h-10 w-full rounded-full border-white/12 bg-transparent text-sm! font-normal! text-neutral-50! transition-colors hover:bg-white/10 sm:w-31',
                    isExpanded && 'border-white/30 bg-white/10 text-white!',
                  )}>
                  {isExpanded ? '접기' : value.buttonLabel}
                </Button>
              ) : (
                <Button
                  asChild
                  size='lg'
                  variant='outline'
                  className='h-10 w-31 rounded-full border-white/12 bg-transparent text-sm! font-normal! text-neutral-50! hover:bg-transparent'>
                  {isExternal ? (
                    <a href={value.link} target='_blank' rel='noopener noreferrer'>
                      {value.buttonLabel}
                    </a>
                  ) : (
                    <Link to={value.link}>{value.buttonLabel}</Link>
                  )}
                </Button>
              )}

              {/* Mobile: Accordion expand directly beneath this card/button */}
              {isExpanded && (
                <div className='w-full md:hidden'>
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        key={`mobile-expand-${value.id}`}
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className='w-full overflow-hidden'>
                        <ValueDetailPanel card={value} onClose={() => setExpandedCardId(null)} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </BrandScrollStaggerItem>
          );
        })}
      </BrandScrollStagger>

      {/* Desktop: Expand panel below the 3-column grid */}
      <div className='hidden md:block'>
        <AnimatePresence initial={false}>
          {expandedCard && (
            <motion.div
              key='value-expand-panel-desktop'
              initial={{ opacity: 0, height: 0, y: -8 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className='overflow-hidden'>
              <AnimatePresence mode='wait' initial={false}>
                <motion.div
                  key={expandedCard.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}>
                  <ValueDetailPanel card={expandedCard} onClose={() => setExpandedCardId(null)} />
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default ValueSection;
