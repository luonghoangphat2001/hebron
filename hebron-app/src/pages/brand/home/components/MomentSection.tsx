import BrandMomentSection from '@/pages/brand/components/BrandMomentSection';
import type { BrandHomeAboutCtaView } from '@/data/pages/pages.mapper';

type MomentSectionProps = {
  data: BrandHomeAboutCtaView;
};

const MomentSection = ({ data }: MomentSectionProps) => {
  return <BrandMomentSection data={data} />;
};

export default MomentSection;
