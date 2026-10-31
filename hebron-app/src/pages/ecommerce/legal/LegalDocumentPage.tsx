import { Typography } from '@/components/typography/Typography';
import type { LegalDocumentConfig } from '@/utils/constants/legal.constant';
import { LEGAL_PAGE_LAYOUT_CLASS } from '@/utils/constants/legal.constant';
import LegalPageBanner from '@/pages/ecommerce/legal/components/LegalPageBanner';

type LegalDocumentPageProps = {
  document: LegalDocumentConfig;
};

const LegalDocumentPage = ({ document }: LegalDocumentPageProps) => {
  return (
    <section className={LEGAL_PAGE_LAYOUT_CLASS}>
      <LegalPageBanner title={document.title} image={document.banner} />

      <div className='flex flex-col gap-6'>
        {document.paragraphs.map((paragraph, index) => (
          <Typography key={index} variant='body-sm' className='text-neutral-950'>
            {paragraph}
          </Typography>
        ))}
      </div>
    </section>
  );
};

export default LegalDocumentPage;
