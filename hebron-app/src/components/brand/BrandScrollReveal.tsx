import { cn } from '@/lib/utils';
import {
  brandScrollRevealVariants,
  BRAND_SCROLL_EASE,
  type BrandScrollRevealVariant,
} from '@/utils/constants/brand-scroll-reveal.constant';
import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

type BrandScrollRevealProps = {
  children: ReactNode;
  className?: string;
  variant?: BrandScrollRevealVariant;
  delay?: number;
  duration?: number;
  as?: 'div' | 'section';
};

const motionTags = {
  div: motion.div,
  section: motion.section,
} as const;

export const BrandScrollReveal = ({
  children,
  className,
  variant = 'fadeUp',
  delay = 0,
  duration = 0.45,
  as = 'div',
}: BrandScrollRevealProps) => {
  const shouldReduceMotion = useReducedMotion();
  const MotionTag = motionTags[as];

  if (shouldReduceMotion) {
    const StaticTag = as;

    return <StaticTag className={className}>{children}</StaticTag>;
  }

  return (
    <MotionTag
      className={cn(className)}
      variants={brandScrollRevealVariants[variant]}
      initial='hidden'
      whileInView='visible'
      viewport={{ once: true, amount: 0.15, margin: '0px 0px -5% 0px' }}
      transition={{ duration, delay, ease: BRAND_SCROLL_EASE }}>
      {children}
    </MotionTag>
  );
};

type BrandScrollStaggerProps = {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delayChildren?: number;
  as?: 'div' | 'ul' | 'section';
};

const staggerTags = {
  div: motion.div,
  ul: motion.ul,
  section: motion.section,
} as const;

export const BrandScrollStagger = ({
  children,
  className,
  stagger = 0.08,
  delayChildren = 0,
  as = 'div',
}: BrandScrollStaggerProps) => {
  const shouldReduceMotion = useReducedMotion();
  const MotionTag = staggerTags[as];

  if (shouldReduceMotion) {
    const StaticTag = as;

    return <StaticTag className={className}>{children}</StaticTag>;
  }

  return (
    <MotionTag
      className={cn(className)}
      initial='hidden'
      whileInView='visible'
      viewport={{ once: true, amount: 0.12, margin: '0px 0px -5% 0px' }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: stagger,
            delayChildren,
          },
        },
      }}>
      {children}
    </MotionTag>
  );
};

export const BrandScrollStaggerItem = ({
  children,
  className,
  variant = 'fadeUp',
  duration = 0.4,
}: {
  children: ReactNode;
  className?: string;
  variant?: BrandScrollRevealVariant;
  duration?: number;
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={cn(className)}
      variants={brandScrollRevealVariants[variant]}
      transition={{ duration, ease: BRAND_SCROLL_EASE }}>
      {children}
    </motion.div>
  );
};
