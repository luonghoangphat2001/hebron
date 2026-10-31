import { BrandScrollReveal } from '@/components/brand/BrandScrollReveal';
import type { BrandStoryIdentityView } from '@/data/pages/pages.mapper';
import BrandPageCoreValuesOrbit from '@/pages/brand/brand-page/components/BrandPageCoreValuesOrbit';
import BrandPageSectionHeading from '@/pages/brand/brand-page/components/BrandPageSectionHeading';
import { BRAND_PAGE_ORBIT_NODES, type BrandPageCoreValueKey } from '@/utils/constants/brand-page.constant';
import { useEffect, useMemo, useState } from 'react';

type BrandPageCoreValuesSectionProps = {
  data?: BrandStoryIdentityView;
};

const BrandPageCoreValuesSection = ({ data }: BrandPageCoreValuesSectionProps) => {
  const initialKey = (data?.values?.[0]?.key?.toUpperCase() as BrandPageCoreValueKey) || 'H';
  const [activeKey, setActiveKey] = useState<BrandPageCoreValueKey>(initialKey);

  const keys = useMemo(() => BRAND_PAGE_ORBIT_NODES.map((node) => node.key), []);

  useEffect(() => {
    if (!keys.length) return;

    const timer = setInterval(() => {
      setActiveKey((prev) => {
        const currentIndex = keys.indexOf(prev);
        const nextIndex = (currentIndex + 1) % keys.length;
        return keys[nextIndex];
      });
    }, 4500);

    return () => clearInterval(timer);
  }, [keys, activeKey]);

  if (!data?.values?.length) return null;

  const { heading, title, values } = data;
  const sectionTitle = heading || title || '';

  return (
    <section className='mx-auto flex w-full max-w-360 flex-col gap-6 px-4 py-8 sm:gap-10 sm:px-[clamp(16px,5.56vw,80px)] sm:py-24'>
      {sectionTitle && (
        <BrandScrollReveal variant='fadeUp' className='flex flex-col gap-3'>
          <BrandPageSectionHeading title={sectionTitle} className='px-0 sm:px-8' />
        </BrandScrollReveal>
      )}

      <BrandScrollReveal variant='scaleUp' delay={0.1}>
        <BrandPageCoreValuesOrbit activeKey={activeKey} onSelect={setActiveKey} values={values} />
      </BrandScrollReveal>
    </section>
  );
};

export default BrandPageCoreValuesSection;
