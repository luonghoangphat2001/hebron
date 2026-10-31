import { cn } from '@/lib/utils';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { type ReactNode } from 'react';

export type BrandMarqueeProps = {
  children: ReactNode;
  className?: string;
  trackClassName?: string;
  gap?: string;
  speed?: number; // total duration in seconds (default: 25)
  duration?: number;
  direction?: 'left' | 'right';
  fadeEdges?: boolean;
  fadeWidth?: string;
  fadeClassName?: string;
};

export const BrandMarquee = ({
  children,
  className,
  trackClassName,
  gap = 'gap-8 md:gap-16',
  speed = 25,
  duration,
  direction = 'left',
  fadeEdges = true,
  fadeWidth = 'w-16 md:w-32',
  fadeClassName = 'from-neutral-950 to-transparent',
}: BrandMarqueeProps) => {
  const animate = direction === 'left' ? { x: ['0%', '-100%'] } : { x: ['-100%', '0%'] };
  const totalDuration = duration ?? speed;

  const motionProps: HTMLMotionProps<'div'> = {
    className: cn('flex shrink-0 items-center', gap, trackClassName),
    animate,
    transition: {
      ease: 'linear',
      duration: totalDuration,
      repeat: Infinity,
    },
  };

  return (
    <div className={cn('relative flex overflow-hidden select-none', className)}>
      <motion.div {...motionProps}>{children}</motion.div>
      <motion.div {...motionProps} aria-hidden>
        {children}
      </motion.div>

      {fadeEdges && (
        <>
          <div
            className={cn('pointer-events-none absolute inset-y-0 left-0 z-10 bg-linear-to-r', fadeWidth, fadeClassName)}
            aria-hidden
          />
          <div
            className={cn('pointer-events-none absolute inset-y-0 right-0 z-10 bg-linear-to-l', fadeWidth, fadeClassName)}
            aria-hidden
          />
        </>
      )}
    </div>
  );
};

export default BrandMarquee;
