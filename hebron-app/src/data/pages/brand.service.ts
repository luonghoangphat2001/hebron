import {
  asContent,
  findSection,
  getSortedHeroItems,
  mapAboutCta,
  mapAchievementCta,
  type BrandHomeAboutCtaView,
  type BrandHomePortfolioView,
} from '@/data/pages/pages.mapper';
import {
  PAGE_SECTION_TYPE,
  type ContactFormContentRESP,
  type ContactInformationContentRESP,
  type HeroSectionContentRESP,
  type InquiryFormContentRESP,
  type PageRESP,
  type PortfolioFeaturedContentRESP,
} from '@/data/pages/pages.response';
import { ATTACHMENT_MAX_SIZE_MB } from '@/utils/constants/attachment.constant';
import { BRAND_PRODUCT_INQUIRY_PAGE_LABELS } from '@/utils/constants/brand-product-inquiry.constant';
import { BRAND_ROUTE } from '@/utils/constants/route.constant';
import type { BrandContactPageView } from '@/utils/types/brand-contact.type';
import type { BrandFaqsPageView } from '@/utils/types/brand-faq.type';
import type { BrandProductInquiryPageView } from '@/utils/types/brand-product-inquiry.type';

export type BrandPortfolioPageView = BrandHomePortfolioView & {
  heroTitle?: string;
  heroBackgroundImageUrlPC?: string | null;
  heroBackgroundImageUrlMB?: string | null;
  aboutCta?: BrandHomeAboutCtaView;
};

export const mapBrandPortfolioPage = (page: PageRESP): BrandPortfolioPageView => {
  const heroSection = findSection(page, PAGE_SECTION_TYPE.HERO_SECTION);
  const heroContent = asContent<HeroSectionContentRESP>(heroSection);
  const heroItems = getSortedHeroItems(heroContent);
  const bgItem = heroItems[0];
  const heroBackgroundImageUrlPC = bgItem?.image_url || null;
  const heroBackgroundImageUrlMB = bgItem?.mobile_image_url || heroBackgroundImageUrlPC;

  const section = findSection(page, PAGE_SECTION_TYPE.PORTFOLIO_FEATURED);
  const content = asContent<PortfolioFeaturedContentRESP>(section);
  const items = content?.items ?? [];

  return {
    heroTitle: heroItems?.[0]?.title || page.title || '포트폴리오',
    heroBackgroundImageUrlPC,
    heroBackgroundImageUrlMB,
    heading: section?.title || '',
    description: section?.description || '',
    viewAllLabel: '',
    viewAllLink: BRAND_ROUTE.PORTFOLIO,
    items: items.map((item) => ({
      id: String(item.id),
      title: item.title || '',
      image: item.cover_image || '',
      imageMobile: item.cover_image || '',
      linkUrl: `${BRAND_ROUTE.PORTFOLIO}/${item.id}`,
    })),
    aboutCta: mapAboutCta(page),
  };
};

export const mapBrandContactPage = (page: PageRESP): BrandContactPageView => {
  const heroSection = findSection(page, PAGE_SECTION_TYPE.HERO_SECTION) || findSection(page, PAGE_SECTION_TYPE.CONTACT_HERO);
  const infoSection = findSection(page, PAGE_SECTION_TYPE.CONTACT_INFORMATION);
  const formSection = findSection(page, PAGE_SECTION_TYPE.CONTACT_FORM);

  const heroContent = asContent<HeroSectionContentRESP>(heroSection);
  const heroItems = getSortedHeroItems(heroContent);
  const bgItem = heroItems[0];
  const heroBackgroundImageUrlPC = bgItem?.image_url || null;
  const heroBackgroundImageUrlMB = bgItem?.mobile_image_url || heroBackgroundImageUrlPC;

  const infoContent = asContent<ContactInformationContentRESP>(infoSection);
  const formContent = asContent<ContactFormContentRESP>(formSection);

  const rawLat = infoContent?.map?.latitude;
  const rawLng = infoContent?.map?.longitude;
  const latitude = rawLat !== undefined && rawLat !== null ? Number(rawLat) : undefined;
  const longitude = rawLng !== undefined && rawLng !== null ? Number(rawLng) : undefined;

  return {
    title: page.title || '문의하기',
    subtitle: page.subtitle || undefined,
    description: page.description || undefined,
    hero: {
      title: heroSection?.title || page.title || '문의하기',
      backgroundImageUrlPC: heroBackgroundImageUrlPC,
      backgroundImageUrlMB: heroBackgroundImageUrlMB,
    },
    information: infoSection
      ? {
          title: infoSection.title || '찾아오시는 길',
          address: infoContent?.map?.address || '',
          latitude: Number.isFinite(latitude) ? latitude : undefined,
          longitude: Number.isFinite(longitude) ? longitude : undefined,
          zoom: infoContent?.map?.zoom,
          mapImageUrl: infoContent?.map?.image_url || null,
          company: {
            name: infoContent?.company?.name || '',
            representative: infoContent?.company?.representative || '',
            phone: infoContent?.company?.phone || '',
            fax: infoContent?.company?.fax || '',
            email: infoContent?.company?.email || '',
          },
        }
      : undefined,
    form: formSection
      ? {
          title: formSection.title || '문의하기',
          submitLabel: formContent?.submit_label || '문의하기',
          submitEndpoint: formContent?.submit_endpoint || '/api/brand/production-inquiry',
          successMessage: formContent?.success_message || '문의가 접수되었습니다.',
          inquiryTypeOptions: formContent?.inquiry_type_options ?? ['트로피', '상패', '메달·뱃지', '한판·명패', '기타'],
        }
      : undefined,
    aboutCta: mapAchievementCta(page) ?? mapAboutCta(page),
  };
};

export const mapBrandProductInquiryPage = (page: PageRESP): BrandProductInquiryPageView => {
  const heroSection = findSection(page, PAGE_SECTION_TYPE.HERO_SECTION);
  const heroContent = asContent<HeroSectionContentRESP>(heroSection);
  const heroItems = getSortedHeroItems(heroContent);
  const bgItem = heroItems[0];
  const heroBackgroundImageUrlPC = bgItem?.image_url || null;
  const heroBackgroundImageUrlMB = bgItem?.mobile_image_url || heroBackgroundImageUrlPC;

  const formSection = findSection(page, PAGE_SECTION_TYPE.INQUIRY_FORM);
  const content = asContent<InquiryFormContentRESP>(formSection);

  return {
    title: page.title || '제작문의',
    subtitle: page.subtitle || undefined,
    description: page.description || undefined,
    heroTitle: heroSection?.title || page.title || BRAND_PRODUCT_INQUIRY_PAGE_LABELS.heroTitle,
    heroBackgroundImageUrlPC,
    heroBackgroundImageUrlMB,
    processTitle: content?.process_title || formSection?.title || BRAND_PRODUCT_INQUIRY_PAGE_LABELS.processTitle,
    processSubtitle: formSection?.subtitle || BRAND_PRODUCT_INQUIRY_PAGE_LABELS.processSubtitle,
    processSteps: (content?.process_steps ?? []).map((step, idx) => ({
      key: step.key || `step-${idx + 1}`,
      title: step.title || '',
      description: step.description || '',
    })),
    formTitle: content?.title || formSection?.title || '',
    formSubtitle: content?.subtitle || formSection?.subtitle || '',
    formDescription: formSection?.description || '',
    formImageUrl: content?.image_url || null,
    submitLabel: content?.submit_label || BRAND_PRODUCT_INQUIRY_PAGE_LABELS.submit,
    imageUpload: content?.image_upload && {
      label: content.image_upload.label || '',
      accept: content.image_upload.accept ?? [],
      maxSizeMb: content.image_upload.max_size_mb ?? ATTACHMENT_MAX_SIZE_MB,
    },
    aboutCta: mapAchievementCta(page) ?? mapAboutCta(page),
  };
};

export const mapBrandFaqsPage = (page: PageRESP): BrandFaqsPageView => {
  const heroSection = findSection(page, PAGE_SECTION_TYPE.HERO_SECTION);
  const heroContent = asContent<HeroSectionContentRESP>(heroSection);
  const heroItems = getSortedHeroItems(heroContent);
  const bgItem = heroItems[0];
  const heroBackgroundImageUrlPC = bgItem?.image_url || null;
  const heroBackgroundImageUrlMB = bgItem?.mobile_image_url || heroBackgroundImageUrlPC;

  return {
    title: page.title || 'FAQs',
    heroTitle: heroItems?.[0]?.title || page.title || 'FAQs',
    heroBackgroundImageUrlPC,
    heroBackgroundImageUrlMB,
    aboutCta: mapAboutCta(page),
  };
};
