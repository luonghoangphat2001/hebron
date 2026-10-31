import {
  Trophy1,
  Trophy10,
  Trophy11,
  Trophy2,
  Trophy3,
  Trophy4,
  Trophy5,
  Trophy6,
  Trophy7,
  Trophy8,
  Trophy9,
} from '@/assets/images';

export const BRAND_MOMENT_TROPHIES = [
  Trophy1,
  Trophy2,
  Trophy3,
  Trophy4,
  Trophy5,
  Trophy6,
  Trophy7,
  Trophy8,
  Trophy9,
  Trophy10,
  Trophy11,
] as const;

export const BRAND_MOMENT_TROPHY_HEIGHT_CLASSES = [
  'h-16 md:h-20',
  'h-20 md:h-24',
  'h-24 md:h-28',
  'h-28 md:h-32',
  'h-32 md:h-36',
  'h-36 md:h-40',
  'h-32 md:h-36',
  'h-28 md:h-32',
  'h-24 md:h-28',
  'h-20 md:h-24',
  'h-16 md:h-20',
] as const;

export const BRAND_MOMENT_HIGHLIGHT_INDEX = Math.floor(BRAND_MOMENT_TROPHIES.length / 2);
