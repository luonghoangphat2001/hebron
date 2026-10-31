import { CoreValueB, CoreValueE, CoreValueH, CoreValueLogo, CoreValueN, CoreValueR } from '@/assets/svgs';
import { cn } from '@/lib/utils';
import {
  BRAND_PAGE_ORBIT_NODES,
  BRAND_PAGE_ORBIT_RINGS,
  BRAND_PAGE_ORBIT_STARS,
  type BrandPageCoreValueKey,
  type BrandPageOrbitNodeConfig,
} from '@/utils/constants/brand-page.constant';
import { useMemo } from 'react';

type OrbitValueItem = BrandPageOrbitNodeConfig & {
  title: string;
  description: string;
};

type BrandPageCoreValuesOrbitProps = {
  activeKey: BrandPageCoreValueKey;
  onSelect: (key: BrandPageCoreValueKey) => void;
  values?: Array<{ key?: string; title: string; description: string }>;
};

const CORE_VALUE_SVG_MAP: Record<string, string> = {
  H: CoreValueH,
  E: CoreValueE,
  B: CoreValueB,
  R: CoreValueR,
  O: CoreValueLogo,
  N: CoreValueN,
};

const getCoreValueSvg = (key?: string): string | undefined => {
  if (!key) return undefined;
  const normalizedKey = key.trim().toUpperCase();
  return CORE_VALUE_SVG_MAP[normalizedKey];
};

const CoreValueNode = ({
  value,
  isActive,
  onSelect,
}: {
  value: OrbitValueItem;
  isActive: boolean;
  onSelect: (key: BrandPageCoreValueKey) => void;
}) => {
  const isLogo = value.isLogo;
  const isSmall = value.size === 60;
  const svgSrc = getCoreValueSvg(value.key);

  return (
    <button
      type='button'
      aria-label={value.title || value.key}
      aria-pressed={isActive}
      onClick={() => onSelect(value.key)}
      className='absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer'
      style={{ left: `${value.left}%`, top: `${value.top}%` }}>
      <span
        className={cn(
          'relative flex items-center justify-center rounded-full border border-[#C9A84C]/50 bg-linear-to-b from-[#FFCC25] to-[#1E50A2] font-bold text-white [box-shadow:0_0_16px_rgba(201,168,76,0.55),0_0_32px_rgba(201,168,76,0.35)] transition-transform duration-300 md:[box-shadow:0_0_35px_rgba(201,168,76,0.55),0_0_70px_rgba(201,168,76,0.35)]',
          isSmall
            ? 'size-7 p-1 sm:size-10 sm:p-2 md:size-[60px] md:p-3.5'
            : isLogo
              ? 'size-8 p-1 sm:size-11 sm:p-2 md:size-[64px] md:p-3.5'
              : 'size-9 p-1.5 sm:size-13 sm:p-2.5 md:size-[80px] md:p-4.5',
          isActive ? 'ring-yellow-golden/80 scale-110 ring-2 md:ring-3' : 'hover:scale-105',
        )}>
        {svgSrc ? (
          <img src={svgSrc} alt={value.key} className='size-full object-contain' aria-hidden />
        ) : (
          <span className='text-[10px] leading-none sm:text-xs md:text-base'>{value.key}</span>
        )}
      </span>
    </button>
  );
};

const BrandPageCoreValuesOrbit = ({ activeKey, onSelect, values }: BrandPageCoreValuesOrbitProps) => {
  const coreValues: OrbitValueItem[] = useMemo(
    () =>
      BRAND_PAGE_ORBIT_NODES.map((node) => {
        const apiItem = values?.find((v) => v.key?.trim().toUpperCase() === node.key.toUpperCase());
        const mappedKey = (apiItem?.key?.trim().toUpperCase() as BrandPageCoreValueKey) || node.key;
        return {
          ...node,
          key: mappedKey,
          title: apiItem?.title || '',
          description: apiItem?.description || '',
        };
      }),
    [values],
  );

  const activeValue = useMemo(
    () => coreValues.find((item) => item.key.toUpperCase() === activeKey.toUpperCase()) ?? coreValues[0],
    [coreValues, activeKey],
  );

  const activeSvg = getCoreValueSvg(activeValue.key);

  return (
    <div className='relative mx-auto aspect-square w-full max-w-[1178px] select-none'>
      {/* Orbit Rings */}
      {BRAND_PAGE_ORBIT_RINGS.map((ring, idx) => (
        <div
          key={idx}
          className={cn(
            'pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full',
            ring.isGolden ? 'border border-[rgba(201,168,76,0.2)]' : 'border border-neutral-800',
          )}
          style={{ width: `${ring.percent}%`, height: `${ring.percent}%` }}
          aria-hidden
        />
      ))}

      {/* Orbit Stars */}
      {BRAND_PAGE_ORBIT_STARS.map((star, index) => (
        <span
          key={index}
          className='pointer-events-none absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full [box-shadow:0px_0px_16px_8px_rgba(201,168,76,0.36)] sm:size-3.5 md:size-5 md:[box-shadow:0px_0px_40px_28px_rgba(201,168,76,0.36)]'
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            background: 'linear-gradient(180deg, #FFCC25 0%, #83C3FF 91.25%, #00E0FF 97.45%)',
          }}
          aria-hidden>
          <span
            className='absolute size-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[1px_0px_6px_#2F80ED] sm:size-1.5 md:size-2 md:shadow-[2px_0px_12px_#2F80ED]'
            style={{
              left: '50%',
              top: '50%',
            }}
          />
        </span>
      ))}

      {/* Center Details */}
      <div className='pointer-events-none absolute top-1/2 left-1/2 flex w-[46.6%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-1 p-1 text-center sm:gap-3 sm:p-4 md:gap-4 md:p-8'>
        {activeSvg ? (
          <div className='flex h-6 items-center justify-center sm:h-10 md:h-16'>
            <img src={activeSvg} alt={activeValue.key} className='h-full w-auto object-contain' aria-hidden />
          </div>
        ) : (
          <p className='text-xl leading-none font-bold text-white sm:text-4xl md:text-[80px]'>{activeValue.key}</p>
        )}
        {activeValue.title && (
          <p className='text-xs leading-tight font-bold text-white sm:text-xl md:text-[48px] md:leading-[60px]'>
            &ldquo;{activeValue.title}&rdquo;
          </p>
        )}
        {activeValue.description && (
          <p className='text-[9px] leading-[13px] whitespace-pre-line text-neutral-400 sm:text-xs sm:leading-relaxed md:text-[24px] md:leading-[32px]'>
            {activeValue.description}
          </p>
        )}
      </div>

      {/* Orbit Interactive Nodes */}
      {coreValues.map((value) => (
        <CoreValueNode key={value.key} value={value} isActive={activeValue.key === value.key} onSelect={onSelect} />
      ))}
    </div>
  );
};

export default BrandPageCoreValuesOrbit;
