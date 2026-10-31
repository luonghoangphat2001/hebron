import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useUpdatePageSectionMutation } from '@/data/homepage-management/homepage.query';
import type { UpdatePageSectionREQ } from '@/data/homepage-management/homepage.request';
import {
  getSectionTypeLabel,
  normalizeSectionEditorData,
  transformSectionToUpdatePayload,
} from '@/data/homepage-management/homepage.service';
import type { MallSection } from '@/data/homepage-management/homepage.type';
import { PageType, SectionType, SiteType } from '@/utils/enums/homepage.enum';
import { Loader2 } from 'lucide-react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import AboutCtaView from './sections/AboutCtaView';
import BrandIdentityEditor from './sections/BrandIdentityEditor';
import BrandStatementEditor from './sections/BrandStatementEditor';
import CategoryShowcaseEditor from './sections/CategoryShowcaseEditor';
import CertificatesEditor from './sections/CertificatesEditor';
import ClientLogosEditor from './sections/ClientLogosEditor';
import CompanyHistoryEditor from './sections/CompanyHistoryEditor';
import ContactMapEditor from './sections/ContactMapEditor';
import CraftsmanshipValuesView from './sections/CraftsmanshipValuesView';
import CustomerCenterEditor from './sections/CustomerCenterEditor';
import CustomProcessEditor from './sections/CustomProcessEditor';
import FaqSectionEditor from './sections/FaqSectionEditor';
import FooterQuickLinksEditor from './sections/FooterQuickLinksEditor';
import HeroSectionEditor from './sections/HeroSectionEditor';
import InquiryFormEditor from './sections/InquiryFormEditor';
import LinkedContentSectionView from './sections/LinkedContentSectionView';
import ManufacturingProcessEditor from './sections/ManufacturingProcessEditor';
import NoticesPreviewEditor from './sections/NoticesPreviewEditor';
import PortfolioPreviewView from './sections/PortfolioPreviewView';
import PressPreviewEditor from './sections/PressPreviewEditor';
import ProductPreviewEditor from './sections/ProductPreviewEditor';
import SecondaryBannerEditor from './sections/SecondaryBannerEditor';
import ShortcutsEditor from './sections/ShortcutsEditor';

type Props = {
  section: MallSection;
  onUpdateSection?: (updated: Partial<MallSection>) => void;
  siteType?: SiteType;
  pageType?: PageType;
};

export const HomepageSectionDetailEditor: React.FC<Props> = ({
  section,
  onUpdateSection,
  siteType = SiteType.SHOPPING_MALL,
  pageType = PageType.HOME_PAGE,
}) => {
  const { t: tEnum } = useTranslation('enum');
  const { t: tCommon } = useTranslation('common');

  const updateSectionMutation = useUpdatePageSectionMutation();

  const handleSaveSection = async (payloadOverrides?: Partial<UpdatePageSectionREQ>) => {
    const basePayload = transformSectionToUpdatePayload(section);
    const finalPayload: UpdatePageSectionREQ = payloadOverrides
      ? {
          ...basePayload,
          ...payloadOverrides,
          content: payloadOverrides.content !== undefined ? payloadOverrides.content : basePayload.content,
          is_active: payloadOverrides.is_active !== undefined ? payloadOverrides.is_active : (section.enabled ?? true),
        }
      : basePayload;

    return updateSectionMutation.mutateAsync({
      siteType,
      pageType,
      sectionType: section.type,
      body: finalPayload,
    });
  };

  const { rawContent, heroSlides, showcaseCategories, showcaseProducts, customerCenter } = useMemo(
    () => normalizeSectionEditorData(section),
    [section],
  );

  return (
    <Card className='relative shadow-xs lg:col-span-8'>
      <CardHeader className=''>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <div>
            <div className='flex items-center gap-2'>
              <CardTitle className='text-base font-semibold'>{getSectionTypeLabel(section.type, tEnum)}</CardTitle>
              {/* <Badge variant='outline' className='bg-primary/5 text-primary font-mono text-xs'>
                {section.type}
              </Badge> */}
              {updateSectionMutation.isPending && (
                <Badge
                  variant='outline'
                  className='border-primary/40 bg-primary/10 text-primary flex animate-pulse items-center gap-1 text-[10px]'>
                  <Loader2 className='h-3 w-3 animate-spin' />
                  <span>{tCommon('button.save')}...</span>
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <Separator />

      <CardContent className='space-y-6'>
        {section.type === SectionType.HERO_SECTION && (
          <HeroSectionEditor
            key={`${section.id}_${section.rawSection?.id || ''}`}
            heroSlides={heroSlides}
            section={section}
            rawContent={rawContent}
            siteType={siteType}
            pageType={pageType}
            onSaveSection={handleSaveSection}
          />
        )}

        {section.type === SectionType.CLIENT_LOGOS && <ClientLogosEditor section={section} onSaveSection={handleSaveSection} />}

        {section.type === SectionType.BRAND_STATEMENT && (
          <BrandStatementEditor section={section} onSaveSection={handleSaveSection} />
        )}

        {section.type === SectionType.CATEGORY_SHORTCUTS && (
          <ShortcutsEditor rawContent={rawContent} onSaveSection={handleSaveSection} />
        )}

        {(section.type === SectionType.PRODUCT_PREVIEW || section.type === SectionType.STEADY_SELLER) && (
          <ProductPreviewEditor
            sectionType={section.type}
            rawContent={rawContent}
            previewCategories={showcaseCategories}
            onSaveSection={handleSaveSection}
          />
        )}

        {section.type === SectionType.SECONDARY_BANNER && (
          <SecondaryBannerEditor section={section} onSaveSection={handleSaveSection} />
        )}

        {section.type === SectionType.CRAFTSMANSHIP_VALUES && (
          <CraftsmanshipValuesView key={section.id} section={section} onSaveSection={handleSaveSection} />
        )}

        {section.type === SectionType.CUSTOM_PROCESS && (
          <CustomProcessEditor section={section} onSaveSection={handleSaveSection} />
        )}

        {section.type === SectionType.PRESS_PREVIEW && (
          <PressPreviewEditor
            key={section.id}
            section={section}
            rawContent={rawContent}
            siteType={siteType}
            onSaveSection={handleSaveSection}
            isSaving={updateSectionMutation.isPending}
          />
        )}

        {(section.type === SectionType.MANUFACTURING_PROCESS || section.type === SectionType.PROCESS_STEPS) && (
          <ManufacturingProcessEditor key={section.id} section={section} onSaveSection={handleSaveSection} />
        )}

        {section.type === SectionType.PORTFOLIO_PREVIEW && (
          <PortfolioPreviewView section={section} onSaveSection={handleSaveSection} />
        )}

        {section.type === SectionType.NOTICES_PREVIEW && (
          <NoticesPreviewEditor
            rawContent={rawContent}
            siteType={siteType}
            onSaveSection={handleSaveSection}
            isSaving={updateSectionMutation.isPending}
          />
        )}

        {section.type === SectionType.CATEGORY_PRODUCT_SHOWCASE && (
          <CategoryShowcaseEditor
            section={section}
            rawContent={rawContent}
            showcaseCategories={showcaseCategories}
            showcaseProducts={showcaseProducts}
            onUpdateSection={onUpdateSection}
            onSaveSection={handleSaveSection}
          />
        )}

        {section.type === SectionType.FAQ_SECTION && (
          <FaqSectionEditor rawContent={rawContent} siteType={siteType} onSaveSection={handleSaveSection} />
        )}

        {section.type === SectionType.CUSTOMER_CENTER && (
          <CustomerCenterEditor section={section} customerCenter={customerCenter} onSaveSection={handleSaveSection} />
        )}

        {section.type === SectionType.FOOTER_QUICK_LINKS && (
          <FooterQuickLinksEditor section={section} onSaveSection={handleSaveSection} />
        )}

        {section.type === SectionType.ABOUT_CTA && <AboutCtaView section={section} />}
        {(section.type === SectionType.MEDIA_LIST || section.type === SectionType.PRODUCT_LIST) && (
          <LinkedContentSectionView section={section} />
        )}
        {section.type === SectionType.BRAND_IDENTITY && (
          <BrandIdentityEditor section={section} onSaveSection={handleSaveSection} />
        )}
        {section.type === SectionType.COMPANY_HISTORY && (
          <CompanyHistoryEditor section={section} onSaveSection={handleSaveSection} />
        )}
        {section.type === SectionType.CERTIFICATES && <CertificatesEditor section={section} onSaveSection={handleSaveSection} />}
        {section.type === SectionType.INQUIRY_FORM && <InquiryFormEditor section={section} onSaveSection={handleSaveSection} />}
        {section.type === SectionType.CONTACT_INFORMATION && (
          <ContactMapEditor key={section.id} section={section} onSaveSection={handleSaveSection} />
        )}
      </CardContent>
    </Card>
  );
};

export default HomepageSectionDetailEditor;
