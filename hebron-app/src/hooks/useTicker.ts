import { useMemo } from 'react';

export type UseTickerOptions<T> = {
  /** Array of items to be displayed in the ticker */
  items: T[];
  /** Minimum items required to span across wide screens (default: 10) */
  minItems?: number;
  /** Custom total animation duration in seconds (overrides speed) */
  duration?: number;
  /** Speed multiplier: seconds per item in the track (default: 2.5) */
  speed?: number;
  /** Scroll direction: 'left' (right-to-left) or 'right' (left-to-right) (default: 'left') */
  direction?: 'left' | 'right';
};

export const useTicker = <T>({ items, minItems = 10, duration, speed = 2.5, direction = 'left' }: UseTickerOptions<T>) => {
  const itemCount = items.length;

  const repeatCount = useMemo(() => {
    if (itemCount === 0) return 0;
    return Math.max(2, Math.ceil(minItems / itemCount));
  }, [itemCount, minItems]);

  const trackItems = useMemo(() => {
    if (itemCount === 0) return [];
    return Array.from({ length: repeatCount }, () => items).flat();
  }, [items, repeatCount, itemCount]);

  const calculatedDuration = useMemo(() => {
    if (duration !== undefined) return duration;
    return Math.max(15, trackItems.length * speed);
  }, [duration, trackItems.length, speed]);

  const animate = useMemo(() => {
    return direction === 'left' ? { x: ['0%', '-100%'] } : { x: ['-100%', '0%'] };
  }, [direction]);

  const transition = useMemo(
    () => ({
      ease: 'linear' as const,
      duration: calculatedDuration,
      repeat: Infinity,
    }),
    [calculatedDuration],
  );

  return {
    trackItems,
    animate,
    transition,
    repeatCount,
    duration: calculatedDuration,
  };
};

export default useTicker;
