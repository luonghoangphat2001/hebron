import { LogoShort } from '@/assets/svgs';

export type BrandPageCoreValueKey = 'H' | 'E' | 'B' | 'R' | 'O' | 'N';

export type BrandPageOrbitNodeConfig = {
  key: BrandPageCoreValueKey;
  left: number;
  top: number;
  size: number;
  isLogo?: boolean;
};

export const BRAND_PAGE_ORBIT_RINGS = [
  { percent: 46.6, isGolden: true },
  { percent: 73.85, isGolden: false },
  { percent: 100, isGolden: false },
] as const;

export const BRAND_PAGE_ORBIT_NODES: BrandPageOrbitNodeConfig[] = [
  { key: 'H', left: 15.45, top: 62.73, size: 60 },
  { key: 'E', left: 17.28, top: 88.03, size: 80 },
  { key: 'B', left: 55.1, top: 86.33, size: 80 },
  { key: 'R', left: 73.81, top: 21.14, size: 80 },
  { key: 'O', left: 86.93, top: 47.28, size: 64, isLogo: true },
  { key: 'N', left: 90.66, top: 78.95, size: 80 },
];

export const BRAND_PAGE_ORBIT_STARS = [
  { left: 0.85, top: 59.17, size: 20 },
  { left: 14.18, top: 40.99, size: 20 },
  { left: 97.75, top: 32.94, size: 20 },
  { left: 80.0, top: 71.48, size: 20 },
  { left: 70.37, top: 95.67, size: 20 },
  { left: 29.12, top: 80.39, size: 20 },
] as const;

export const BRAND_PAGE_SECTION_ICON = LogoShort;
