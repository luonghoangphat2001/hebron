import type { Variants } from 'framer-motion';

export const BRAND_SCROLL_EASE = [0.22, 1, 0.36, 1] as const;

/** Opacity-only reveals — transforms on large media cause main-thread hitch mid-scroll. */
export const brandScrollRevealVariants = {
  fadeUp: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  scaleUp: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  slideLeft: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  slideRight: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
} satisfies Record<string, Variants>;

export type BrandScrollRevealVariant = keyof typeof brandScrollRevealVariants;
