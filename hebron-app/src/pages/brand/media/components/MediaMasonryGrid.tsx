import type { BrandMediaListItemView } from '@/data/pages/pages.mapper';
import { cn } from '@/lib/utils';
import { getBrandMediaDetailPath } from '@/utils/constants/route.constant';
import { useMemo, useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';

const MEDIA_IMAGE_ASPECTS = [
  'aspect-[3/4]',
  'aspect-square',
  'aspect-[4/5]',
  'aspect-[5/4]',
  'aspect-[3/5]',
  'aspect-[4/3]',
] as const;

const ASPECT_RATIOS: Record<string, number> = {
  'aspect-[3/4]': 4 / 3,
  'aspect-square': 1,
  'aspect-[4/5]': 5 / 4,
  'aspect-[5/4]': 4 / 5,
  'aspect-[3/5]': 5 / 3,
  'aspect-[4/3]': 3 / 4,
};

const subscribeMedia = (callback: () => void) => {
  const mql = window.matchMedia('(min-width: 768px)');
  mql.addEventListener('change', callback);
  return () => mql.removeEventListener('change', callback);
};

const getSnapshot = () => (window.matchMedia('(min-width: 768px)').matches ? 4 : 2);
const getServerSnapshot = () => 4;

type MediaMasonryGridProps = {
  items: BrandMediaListItemView[];
};

const MediaMasonryGrid = ({ items }: MediaMasonryGridProps) => {
  const columnCount = useSyncExternalStore(subscribeMedia, getSnapshot, getServerSnapshot);

  // Deterministic greedy column assignment:
  // Items 0..N-1 are always placed in the exact same columns regardless of future items loaded.
  // Newly appended items (e.g. infinite scroll) are assigned to the shortest columns at that point.
  const columns = useMemo(() => {
    const cols: Array<Array<{ item: BrandMediaListItemView; aspectClass: string }>> = Array.from(
      { length: columnCount },
      () => [],
    );
    const colHeights = new Array(columnCount).fill(0);

    items.forEach((item, index) => {
      const aspectClass = MEDIA_IMAGE_ASPECTS[index % MEDIA_IMAGE_ASPECTS.length];
      const ratio = ASPECT_RATIOS[aspectClass] ?? 1;

      let shortestCol = 0;
      for (let c = 1; c < columnCount; c++) {
        if (colHeights[c] < colHeights[shortestCol]) {
          shortestCol = c;
        }
      }

      cols[shortestCol].push({ item, aspectClass });
      colHeights[shortestCol] += ratio;
    });

    return cols;
  }, [items, columnCount]);

  if (items.length === 0) {
    return (
      <div className='flex min-h-60 items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-900/50 p-8 text-neutral-500'>
        No media articles found.
      </div>
    );
  }

  return (
    <div className='relative min-w-0 pb-4'>
      <div className='flex gap-3 md:gap-4'>
        {columns.map((col, colIdx) => (
          <div key={colIdx} className='flex min-w-0 flex-1 flex-col gap-3 md:gap-4'>
            {col.map(({ item, aspectClass }) => (
              <Link
                key={item.id}
                to={getBrandMediaDetailPath(item.id)}
                className={cn(
                  'group relative block overflow-hidden rounded-2xl bg-neutral-900 transition-transform duration-200 hover:scale-[1.02]',
                  aspectClass,
                )}>
                <img
                  src={item.image}
                  alt={item.title || ''}
                  loading='lazy'
                  decoding='async'
                  className='absolute inset-0 size-full object-cover transition-opacity duration-300 group-hover:opacity-90'
                />
                {item.title && (
                  <div className='pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 via-black/45 to-transparent px-4 pt-12 pb-4'>
                    <p className='md:text-md line-clamp-2 text-sm font-semibold text-white drop-shadow-sm'>{item.title}</p>
                  </div>
                )}
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MediaMasonryGrid;
