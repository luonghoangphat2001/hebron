import {
  INITIAL_BRAND_SECTIONS,
  INITIAL_BRAND_STORY_SECTIONS,
  INITIAL_CONTACT_SECTIONS,
  INITIAL_PLAIN_SECTIONS,
  INITIAL_PROCESS_SECTIONS,
  INITIAL_PRODUCTION_INQUIRY_SECTIONS,
  SECTION_TYPE_LABEL_MAP,
  URL_TO_PAGE_TYPE_MAP,
} from '@/utils/constants/homepage.constant';
import { PageType, SITE_PAGE_SECTION_MAP, SectionType, SiteType, getSectionsBySiteAndPage } from '@/utils/enums/homepage.enum';
import type { CustomerCenterContactItem } from '@/utils/helper/homepage.helper';
import {
  normalizeCustomerCenter,
  normalizeShowcaseCategories,
  transformShowcaseProductToCardItem,
} from '@/utils/helper/homepage.helper';
import type { UpdatePageSectionREQ } from './homepage.request';
import type {
  CategoryShortcutItemRESP,
  FaqItemRESP,
  HeroSlideItemRESP,
  NoticeItemRESP,
  PageDetailRESP,
  ShowcaseCategorySlugRESP,
  ShowcaseProductItemRESP,
} from './homepage.response';
import type {
  BrandIdentityContent,
  BrandIdentityInput,
  CertificatesContent,
  CertificatesInput,
  CompanyHistoryContent,
  CompanyHistoryInput,
  ContactMapContent,
  ContactMapInput,
  InquiryFormContent,
  InquiryFormInput,
  MallSection,
  ManufacturingProcessItem,
  SecondaryBannerItem,
  FooterQuickLinkItem,
} from './homepage.type';

export * from '@/utils/helper/homepage.helper';

export const normalizeSectionEditorData = (section?: MallSection | null) => {
  const rawContent: any = section?.rawSection?.content || {};
  const categories = normalizeShowcaseCategories(rawContent);

  return {
    rawContent,
    heroSlides: Array.isArray(rawContent.items) ? (rawContent.items as HeroSlideItemRESP[]) : [],
    categoryShortcuts: Array.isArray(rawContent.items) ? (rawContent.items as CategoryShortcutItemRESP[]) : [],
    notices: Array.isArray(rawContent.items) ? (rawContent.items as NoticeItemRESP[]) : [],
    showcaseCategories: categories,
    previewCategories: categories,
    showcaseProducts: Array.isArray(rawContent.products)
      ? (rawContent.products as ShowcaseProductItemRESP[]).map(transformShowcaseProductToCardItem)
      : [],
    faqs: Array.isArray(rawContent.items) ? (rawContent.items as FaqItemRESP[]) : [],
    customerCenter: normalizeCustomerCenter(rawContent),
  };
};

export const normalizeBrandIdentityData = (section?: MallSection | null) => {
  const raw = section?.rawSection;
  const content = (raw?.content as BrandIdentityContent) || {};

  return {
    heading: raw?.title ?? '',
    description: raw?.description ?? '',
    values: Array.isArray(content.values) ? content.values : [],
  };
};

export const normalizeCertificatesData = (section?: MallSection | null) => {
  const raw = section?.rawSection;
  const content = (raw?.content as CertificatesContent) || {};

  return {
    heading: raw?.title ?? '',
    description: raw?.description ?? '',
    image_url: content.image_url ?? raw?.image ?? '',
    company_info: Array.isArray(content.company_info) ? content.company_info : [],
  };
};

export const normalizeCompanyHistoryData = (section?: MallSection | null) => {
  const raw = section?.rawSection;
  const content = (raw?.content as CompanyHistoryContent) || {};

  return {
    heading: raw?.title ?? '',
    description: raw?.description ?? '',
    timeline: Array.isArray(content.timeline) ? content.timeline : [],
  };
};

export const normalizeInquiryFormData = (section?: MallSection | null): InquiryFormInput => {
  const raw = section?.rawSection;
  const content = (raw?.content as InquiryFormContent) || {};

  return {
    heading: raw?.title ?? content.title ?? '문의 폼',
    description: raw?.description ?? content.description ?? '',
    subtitle: raw?.subtitle ?? content.subtitle ?? '',
    image_url: content.image_url ?? raw?.image ?? '',
    images: Array.isArray(content.images)
      ? content.images
      : content.image_url
        ? [content.image_url]
        : raw?.image
          ? [raw.image]
          : [],
    process_title: content.process_title ?? '제작 과정',
    process_steps: Array.isArray(content.process_steps) ? content.process_steps : [],
  };
};

export const normalizeContactMapData = (section?: MallSection | null): ContactMapInput => {
  const raw = section?.rawSection;
  const content = (raw?.content as ContactMapContent) || {};
  const mapContent = content.map || {};
  const companyContent = content.company || {};

  const resolvedAddress = mapContent.address ?? content.address ?? '';
  const resolvedPlaceName = companyContent.name ?? content.place_name ?? '주식회사 헤브론';
  const resolvedLat =
    mapContent.latitude !== undefined
      ? Number(mapContent.latitude)
      : content.latitude !== undefined
        ? Number(content.latitude)
        : undefined;
  const resolvedLng =
    mapContent.longitude !== undefined
      ? Number(mapContent.longitude)
      : content.longitude !== undefined
        ? Number(content.longitude)
        : undefined;

  return {
    heading: raw?.title ?? '찾아오시는 길',
    description: raw?.description ?? '',
    place_name: resolvedPlaceName,
    company_name: companyContent.name ?? '주식회사 헤브론',
    address: resolvedAddress,
    latitude: resolvedLat,
    longitude: resolvedLng,
  };
};

export const normalizeManufacturingProcessData = (
  section?: MallSection | null,
): {
  heading: string;
  description: string;
  subtitle: string;
  items: ManufacturingProcessItem[];
} => {
  const raw = section?.rawSection;
  const content = (raw?.content as any) || {};
  const rawList = Array.isArray(content.items) ? content.items : Array.isArray(content.steps) ? content.steps : [];

  return {
    heading: raw?.title ?? '제조공정',
    description: raw?.description ?? raw?.subtitle ?? '',
    subtitle: raw?.subtitle ?? '',
    items: rawList.map((item: any, idx: number) => ({
      key: item.key ?? `공정 ${idx + 1}`,
      title: item.title ?? '',
      subtitle: item.subtitle ?? '',
      description: item.description ?? '',
      image_url: item.image_url ?? item.image ?? '',
      video_url: item.video_url ?? null,
      media_type: item.media_type ?? (item.video_url ? 'video' : 'image'),
    })),
  };
};

export const getSectionTypeLabel = (type: SectionType | string, tEnum?: any): string => {
  if (tEnum) {
    const key = `content.${type}`;
    const translated = tEnum(key);
    if (translated && translated !== key) return translated;
    const directTranslated = tEnum(type);
    if (directTranslated && directTranslated !== type) return directTranslated;
  }
  return SECTION_TYPE_LABEL_MAP[type] || String(type);
};

export const normalizePageSections = (page?: PageDetailRESP | null, tEnum?: any): MallSection[] => {
  if (!page || !page.sections || page.sections.length === 0) return [];

  const allowedTypes =
    page.site_type && page.page_type ? getSectionsBySiteAndPage(page.site_type as SiteType, page.page_type as PageType) : [];

  const visibleSections =
    allowedTypes.length > 0
      ? page.sections.filter((sec) => allowedTypes.includes(sec.section_type as SectionType))
      : page.sections;

  return visibleSections
    .map((sec, index) => {
      const type = sec.section_type as SectionType;
      const content = sec.content as any;
      const itemCount = Array.isArray(content)
        ? content.length
        : content?.items?.length ||
          content?.timeline?.length ||
          content?.values?.length ||
          content?.company_info?.length ||
          content?.process_steps?.length ||
          content?.products?.length ||
          content?.logos?.length ||
          content?.cards?.length ||
          content?.steps?.length ||
          0;

      return {
        id: String(sec.id),
        name: sec.title || getSectionTypeLabel(type, tEnum),
        type,
        enabled: sec.is_active,
        order: sec.sort_order || index + 1,
        itemCount,
        description: sec.subtitle || sec.link || '',
        rawSection: sec,
      };
    })
    .sort((a, b) => a.order - b.order);
};

export const resolveVendorPageSections = (pages?: PageDetailRESP[] | null, tEnum?: any): MallSection[] => {
  if (pages && pages.length > 0) {
    const normalized = normalizePageSections(pages[0], tEnum).filter((sec) => sec.type === SectionType.HERO_SECTION);
    if (normalized.length > 0) {
      return normalized;
    }
  }
  return INITIAL_PLAIN_SECTIONS.map((sec) => ({
    ...sec,
    name: getSectionTypeLabel(sec.type, tEnum),
  }));
};

export const normalizeProductionInquirySections = (page?: PageDetailRESP | null, tEnum?: any): MallSection[] => {
  const sections = (page?.sections || []).filter((s) => s.is_active !== false);
  const heroSec = sections.find((s) => s.section_type === 'hero_section');
  const inquirySec = sections.find((s) => s.section_type === SectionType.INQUIRY_FORM || s.section_type === 'inquiry_form');
  const ctaSec = sections.find((s) => s.section_type === 'about_cta');

  return INITIAL_PRODUCTION_INQUIRY_SECTIONS.map((sec) => {
    if (sec.type === SectionType.HERO_SECTION && heroSec) {
      return {
        ...sec,
        id: String(heroSec.id || sec.id),
        name: heroSec.title || sec.name || getSectionTypeLabel(sec.type, tEnum),
        enabled: heroSec.is_active ?? true,
        description: heroSec.subtitle || heroSec.description || sec.description,
        rawSection: { ...sec.rawSection, ...heroSec },
      };
    }
    if (sec.type === SectionType.INQUIRY_FORM && inquirySec) {
      const rawContent = (inquirySec.content || {}) as any;
      return {
        ...sec,
        id: String(inquirySec.id || sec.id),
        name: inquirySec.title || sec.name || getSectionTypeLabel(sec.type, tEnum),
        enabled: inquirySec.is_active ?? true,
        description: inquirySec.description || inquirySec.subtitle || sec.description,
        rawSection: {
          ...sec.rawSection,
          ...inquirySec,
          content: {
            ...sec.rawSection?.content,
            ...rawContent,
          },
        } as any,
      };
    }
    if (sec.type === SectionType.ABOUT_CTA && ctaSec) {
      return {
        ...sec,
        id: String(ctaSec.id || sec.id),
        name: ctaSec.title || sec.name || getSectionTypeLabel(sec.type, tEnum),
        enabled: ctaSec.is_active ?? true,
        description: ctaSec.subtitle || ctaSec.description || sec.description,
        rawSection: { ...sec.rawSection, ...ctaSec },
      };
    }
    return {
      ...sec,
      name: sec.name || getSectionTypeLabel(sec.type, tEnum),
    };
  });
};

export const normalizeProcessSections = (page?: PageDetailRESP | null, tEnum?: any): MallSection[] => {
  const sections = (page?.sections || []).filter((s) => s.is_active !== false);
  const heroSec = sections.find((s) => s.section_type === 'hero_section');
  const processSec = sections.find((s) => s.section_type === 'manufacturing_process' || s.section_type === 'process_steps');
  const ctaSec = sections.find((s) => s.section_type === 'about_cta');

  return INITIAL_PROCESS_SECTIONS.map((sec) => {
    if (sec.type === SectionType.HERO_SECTION && heroSec) {
      return {
        ...sec,
        id: String(heroSec.id || sec.id),
        name: heroSec.title || sec.name || getSectionTypeLabel(sec.type, tEnum),
        enabled: heroSec.is_active ?? true,
        description: heroSec.subtitle || heroSec.description || sec.description,
        rawSection: { ...sec.rawSection, ...heroSec },
      };
    }
    if (sec.type === SectionType.PROCESS_STEPS && processSec) {
      const rawContent = (processSec.content || {}) as any;
      const steps = Array.isArray(rawContent.steps) ? rawContent.steps : [];

      return {
        ...sec,
        id: String(processSec.id || sec.id),
        name: processSec.title || sec.name || getSectionTypeLabel(sec.type, tEnum),
        enabled: processSec.is_active ?? true,
        description: processSec.description ?? sec.description,
        rawSection: {
          ...sec.rawSection,
          ...processSec,
          content: {
            ...sec.rawSection?.content,
            ...rawContent,
            steps,
          },
        } as any,
      };
    }
    if (sec.type === SectionType.ABOUT_CTA && ctaSec) {
      return {
        ...sec,
        id: String(ctaSec.id || sec.id),
        name: ctaSec.title || sec.name || getSectionTypeLabel(sec.type, tEnum),
        enabled: ctaSec.is_active ?? true,
        description: ctaSec.subtitle || ctaSec.description || sec.description,
        rawSection: { ...sec.rawSection, ...ctaSec },
      };
    }
    return {
      ...sec,
      name: sec.name || getSectionTypeLabel(sec.type, tEnum),
    };
  });
};

export const normalizeContactSections = (page?: PageDetailRESP | null, tEnum?: any): MallSection[] => {
  const sections = (page?.sections || []).filter((s) => s.is_active !== false);
  const heroSec = sections.find((s) => s.section_type === 'hero_section' || s.section_type === 'contact_hero');
  const mapSec = sections.find((s) => s.section_type === 'contact_information' || s.section_type === 'contact_map');
  const ctaSec = sections.find((s) => s.section_type === 'about_cta' || s.section_type === 'achievement_cta');

  return INITIAL_CONTACT_SECTIONS.map((sec) => {
    if (sec.type === SectionType.HERO_SECTION && heroSec) {
      return {
        ...sec,
        id: String(heroSec.id || sec.id),
        name: heroSec.title || sec.name || getSectionTypeLabel(sec.type, tEnum),
        enabled: heroSec.is_active ?? true,
        description: heroSec.subtitle || heroSec.description || sec.description,
        rawSection: { ...sec.rawSection, ...heroSec },
      };
    }
    if (sec.type === SectionType.CONTACT_INFORMATION && mapSec) {
      const rawContent = (mapSec.content || {}) as any;
      return {
        ...sec,
        id: String(mapSec.id || sec.id),
        name: mapSec.title || sec.name || getSectionTypeLabel(sec.type, tEnum),
        enabled: mapSec.is_active ?? true,
        description: mapSec.subtitle || mapSec.description || sec.description,
        rawSection: {
          ...sec.rawSection,
          ...mapSec,
          content: {
            ...sec.rawSection?.content,
            ...rawContent,
          },
        } as any,
      };
    }
    if (sec.type === SectionType.ABOUT_CTA && ctaSec) {
      return {
        ...sec,
        id: String(ctaSec.id || sec.id),
        name: ctaSec.title || sec.name || getSectionTypeLabel(sec.type, tEnum),
        enabled: ctaSec.is_active ?? true,
        description: ctaSec.subtitle || ctaSec.description || sec.description,
        rawSection: { ...sec.rawSection, ...ctaSec },
      };
    }
    return {
      ...sec,
      name: sec.name || getSectionTypeLabel(sec.type, tEnum),
    };
  });
};

export const mapUrlParamToPageType = (param?: string): PageType => (param && URL_TO_PAGE_TYPE_MAP[param]) || PageType.HOME_PAGE;

export const resolveBrandPageSections = (pages: PageDetailRESP[] | undefined, pageType: PageType, tEnum?: any): MallSection[] => {
  if (pageType === PageType.PROCESS) {
    if (pages && pages.length > 0) return normalizeProcessSections(pages[0], tEnum);
    return INITIAL_PROCESS_SECTIONS.map((sec) => ({
      ...sec,
      name: sec.name || getSectionTypeLabel(sec.type, tEnum),
    }));
  }

  if (pageType === PageType.CONTACT_US) {
    if (pages && pages.length > 0) return normalizeContactSections(pages[0], tEnum);
    return INITIAL_CONTACT_SECTIONS.map((sec) => ({
      ...sec,
      name: sec.name || getSectionTypeLabel(sec.type, tEnum),
    }));
  }

  if (pageType === PageType.PRODUCTION_INQUIRY) {
    if (pages && pages.length > 0) return normalizeProductionInquirySections(pages[0], tEnum);
    return INITIAL_PRODUCTION_INQUIRY_SECTIONS.map((sec) => ({
      ...sec,
      name: sec.name || getSectionTypeLabel(sec.type, tEnum),
    }));
  }

  if (pages && pages.length > 0) {
    const normalized = normalizePageSections(pages[0], tEnum);
    if (normalized.length > 0) return normalized;
  }

  if (pageType === PageType.HOME_PAGE) {
    const allowedTypes = getSectionsBySiteAndPage(SiteType.BRAND_SITE, PageType.HOME_PAGE);
    return INITIAL_BRAND_SECTIONS.filter((sec) => allowedTypes.length === 0 || allowedTypes.includes(sec.type)).map((sec) => ({
      ...sec,
      id: sec.id,
      name: sec.name || getSectionTypeLabel(sec.type, tEnum),
    }));
  }

  if (pageType === PageType.BRAND_STORY) {
    const allowedTypes = getSectionsBySiteAndPage(SiteType.BRAND_SITE, PageType.BRAND_STORY);
    return INITIAL_BRAND_STORY_SECTIONS.filter((sec) => allowedTypes.length === 0 || allowedTypes.includes(sec.type)).map(
      (sec) => ({
        ...sec,
        id: sec.id,
        name: sec.name || getSectionTypeLabel(sec.type, tEnum),
      }),
    );
  }

  const defaultSectionTypes = SITE_PAGE_SECTION_MAP[SiteType.BRAND_SITE]?.[pageType] || [];
  return defaultSectionTypes.map((type, idx) => ({
    id: `default_${type}_${idx}`,
    name: getSectionTypeLabel(type, tEnum),
    type,
    enabled: true,
    description: `${getSectionTypeLabel(type, tEnum)} section`,
  }));
};

export const buildCategoryShortcutsUpdatePayload = (
  category_slugs: string[],
  limit: number | undefined,
  items: CategoryShortcutItemRESP[],
): Partial<UpdatePageSectionREQ> => ({
  section_type: 'category_shortcuts',
  content: {
    category_slugs,
    ...(limit && limit > 0 ? { limit } : {}),
    items,
  },
});

export const buildCategoryShowcaseUpdatePayload = (
  category_slugs: ShowcaseCategorySlugRESP[],
  title = 'Featured Products',
  subtitle: string | null = 'Our featured product categories',
  image?: string | null,
  limit?: number,
  isActive = true,
): Partial<UpdatePageSectionREQ> => ({
  section_type: 'category_product_showcase',
  title,
  subtitle,
  ...(image !== undefined ? { image } : {}),
  content: {
    category_slugs,
    ...(typeof limit === 'number' && limit > 0 ? { limit } : {}),
  },
  is_active: isActive,
});

export const buildProductPreviewUpdatePayload = (
  category_slugs: string[] = [],
  limit = 12,
  isActive = true,
  sectionType: SectionType | string = SectionType.PRODUCT_PREVIEW,
): Partial<UpdatePageSectionREQ> => ({
  section_type: sectionType,
  content: {
    category_slugs,
    limit,
  },
  is_active: isActive,
});

export const buildSecondaryBannerUpdatePayload = (
  items: SecondaryBannerItem[] = [],
  isActive = true,
  section?: MallSection | null,
): Partial<UpdatePageSectionREQ> => ({
  section_type: SectionType.SECONDARY_BANNER,
  title: section?.rawSection?.title ?? 'Secondary Banner',
  description: section?.rawSection?.description ?? null,
  subtitle: section?.rawSection?.subtitle ?? null,
  link: section?.rawSection?.link ?? null,
  image: section?.rawSection?.image ?? null,
  metadata: section?.rawSection?.metadata ?? null,
  sort_order: section?.rawSection?.sort_order ?? 40,
  is_active: isActive,
  content: {
    items,
  },
});

export const buildSteadySellerUpdatePayload = (
  category_slugs: string[] = [],
  limit = 6,
  isActive = true,
): Partial<UpdatePageSectionREQ> => buildProductPreviewUpdatePayload(category_slugs, limit, isActive, SectionType.STEADY_SELLER);

export const buildFooterQuickLinksUpdatePayload = (
  orderMethodImage: string,
  isActive = true,
  section?: MallSection | null,
): Partial<UpdatePageSectionREQ> => {
  const rawContent = (section?.rawSection?.content || {}) as any;
  const existingItems: FooterQuickLinkItem[] = Array.isArray(rawContent?.items) ? rawContent.items : [];

  const hasOrderMethod = existingItems.some((it) => it?.field_name === 'order_method');
  const items = hasOrderMethod
    ? existingItems.map((it) => (it?.field_name === 'order_method' ? { ...it, image: orderMethodImage } : it))
    : [{ image: orderMethodImage, field_name: 'order_method' }, ...existingItems];

  return {
    section_type: SectionType.FOOTER_QUICK_LINKS,
    title: section?.rawSection?.title ?? 'Footer Quick Links',
    description: section?.rawSection?.description ?? null,
    subtitle: section?.rawSection?.subtitle ?? null,
    link: section?.rawSection?.link ?? null,
    image: section?.rawSection?.image ?? null,
    metadata: section?.rawSection?.metadata ?? null,
    sort_order: section?.rawSection?.sort_order ?? 90,
    is_active: isActive,
    content: {
      items,
    },
  };
};

export const buildNoticesPreviewUpdatePayload = (notice_ids: number[], limit?: number): Partial<UpdatePageSectionREQ> => ({
  section_type: 'notices_preview',
  content: {
    notice_ids,
    ...(typeof limit === 'number' && limit > 0 ? { limit } : {}),
  },
});

export const buildFaqSectionUpdatePayload = (faq_ids: number[], limit?: number): Partial<UpdatePageSectionREQ> => ({
  section_type: 'faq_section',
  content: {
    faq_ids,
    ...(typeof limit === 'number' && limit > 0 ? { limit } : {}),
  },
});

export const buildCustomerCenterUpdatePayload = (
  items: CustomerCenterContactItem[],
  title = '고객센터',
  subtitle: string | null = null,
  image: string | null = null,
  link = '/mall/customer-center',
  isActive = true,
  metadata: any[] = [],
): Partial<UpdatePageSectionREQ> => ({
  section_type: 'customer_center',
  title,
  subtitle,
  content: items,
  image,
  link,
  is_active: isActive,
  metadata,
});

export const buildBrandHeroSectionUpdatePayload = (
  fallbackContent: any,
  heading: string,
  description: string,
  primaryCta: { link: string; label: string },
  stats: Array<{ value: string; label?: string; lines?: string[] }>,
  title = '메인 배너',
  section?: MallSection,
): Partial<UpdatePageSectionREQ> => {
  const raw = section?.rawSection;
  const sanitizedStats = stats.map((statItem) => ({
    value: statItem.value,
    label: statItem.label || (statItem.lines || []).join(' '),
    lines: statItem.lines && statItem.lines.length > 0 ? statItem.lines : statItem.label ? [statItem.label] : [],
  }));
  const rawContent = (raw?.content || fallbackContent || {}) as Record<string, any>;
  const { heading: _prevHeading, description: _prevDescription, ...cleanContent } = rawContent;

  return {
    section_type: 'hero_section',
    title: heading || raw?.title || title,
    subtitle: raw?.subtitle ?? null,
    description: description !== undefined ? description : (raw?.description ?? null),
    image: raw?.image ?? '',
    link: raw?.link ?? primaryCta.link ?? '',
    is_active: raw?.is_active ?? section?.enabled ?? true,
    metadata: raw?.metadata ?? null,
    content: {
      ...cleanContent,
      heading,
      description,
      items: cleanContent?.items || [],
      stats: sanitizedStats,
      media_type: cleanContent?.media_type || 'banner_slider',
      primary_cta: primaryCta,
    },
  };
};

export const buildClientLogosUpdatePayload = (
  logos: Array<{ name: string; logo_url: string; link?: string | null }>,
  marquee = true,
  grayscale = true,
  title = '파트너사',
  section?: MallSection,
): Partial<UpdatePageSectionREQ> => {
  const raw = section?.rawSection;
  return {
    section_type: 'client_logos',
    title: raw?.title || title,
    subtitle: raw?.subtitle ?? null,
    description: raw?.description ?? null,
    image: raw?.image ?? null,
    link: raw?.link ?? null,
    is_active: raw?.is_active ?? section?.enabled ?? true,
    metadata: raw?.metadata ?? null,
    content: {
      logos,
      marquee,
      grayscale,
    },
  };
};

export const buildBrandStatementUpdatePayload = (
  heading: string,
  description: string,
  visualImageUrl: string,
  visualAlt = '트로피를 제작하는 헤브론 장인의 모습',
  visualPosition = 'bottom',
  title = '헤브론 소개',
  section?: MallSection,
  mediaType: 'image' | 'video' = 'image',
): Partial<UpdatePageSectionREQ> => {
  const raw = section?.rawSection;
  const img = visualImageUrl || null;
  return {
    section_type: 'brand_statement',
    title: heading || raw?.title || title,
    subtitle: raw?.subtitle ?? null,
    description,
    image: img,
    link: raw?.link ?? null,
    is_active: raw?.is_active ?? section?.enabled ?? true,
    metadata: raw?.metadata ?? null,
    content: {
      visual: {
        alt: visualAlt,
        position: visualPosition,
        image_url: visualImageUrl || '',
        media_type: mediaType,
      },
    },
  };
};

export const buildBrandIdentityUpdatePayload = (
  input: BrandIdentityInput,
  section?: MallSection,
): Partial<UpdatePageSectionREQ> => {
  const raw = section?.rawSection;
  const rawContent = (raw?.content || {}) as Record<string, any>;
  const { heading: _h, description: _d, ...cleanContent } = rawContent;

  return {
    section_type: 'brand_identity',
    title: input.heading ?? raw?.title ?? '',
    subtitle: raw?.subtitle ?? null,
    description: input.description !== undefined ? input.description : (raw?.description ?? null),
    image: raw?.image ?? null,
    link: raw?.link ?? null,
    is_active: raw?.is_active ?? section?.enabled ?? true,
    metadata: raw?.metadata ?? null,
    content: {
      ...cleanContent,
      values: input.values,
    },
  };
};

export const buildCertificatesUpdatePayload = (
  input: CertificatesInput,
  section?: MallSection,
): Partial<UpdatePageSectionREQ> => {
  const raw = section?.rawSection;
  const rawContent = (raw?.content || {}) as Record<string, any>;
  const { heading: _prevHeading, description: _prevDescription, ...cleanContent } = rawContent;
  const resolvedImageUrl = input.image_url || raw?.image || null;

  return {
    section_type: 'certificates',
    title: input.heading ?? raw?.title ?? '',
    subtitle: raw?.subtitle ?? null,
    description: input.description !== undefined ? input.description : (raw?.description ?? null),
    image: resolvedImageUrl,
    link: raw?.link ?? null,
    is_active: raw?.is_active ?? section?.enabled ?? true,
    metadata: raw?.metadata ?? {
      section_id: 'company-introduction',
    },
    content: {
      ...cleanContent,
      layout: cleanContent.layout ?? 'company_introduction',
      image_alt: cleanContent.image_alt ?? '',
      image_url: resolvedImageUrl ?? '',
      company_info: input.company_info,
      info_position: cleanContent.info_position ?? 'right',
      image_position: cleanContent.image_position ?? 'left',
    },
  };
};

export const buildCompanyHistoryUpdatePayload = (
  input: CompanyHistoryInput,
  section?: MallSection,
): Partial<UpdatePageSectionREQ> => {
  const raw = section?.rawSection;
  const rawContent = (raw?.content || {}) as Record<string, any>;
  const { heading: _prevHeading, description: _prevDescription, ...cleanContent } = rawContent;

  return {
    section_type: 'company_history',
    title: input.heading ?? raw?.title ?? '',
    subtitle: raw?.subtitle ?? null,
    description: input.description !== undefined ? input.description : (raw?.description ?? null),
    image: raw?.image ?? null,
    link: raw?.link ?? null,
    is_active: raw?.is_active ?? section?.enabled ?? true,
    metadata: raw?.metadata ?? {
      layout: 'timeline',
      section_id: 'company-history',
    },
    content: {
      ...cleanContent,
      timeline: input.timeline,
    },
  };
};

export const buildInquiryFormUpdatePayload = (input: InquiryFormInput, section?: MallSection): Partial<UpdatePageSectionREQ> => {
  const raw = section?.rawSection;
  const rawContent = (raw?.content || {}) as Record<string, any>;
  const resolvedImageUrl = input.image_url ?? rawContent.image_url ?? '';
  const resolvedImages = input.images && input.images.length > 0 ? input.images : resolvedImageUrl ? [resolvedImageUrl] : [];

  return {
    section_type: 'inquiry_form',
    title: input.heading ?? raw?.title ?? '문의 폼',
    subtitle: input.subtitle !== undefined ? input.subtitle : (raw?.subtitle ?? null),
    description: input.description !== undefined ? input.description : (raw?.description ?? null),
    image: resolvedImageUrl || raw?.image || null,
    link: raw?.link ?? null,
    is_active: raw?.is_active ?? section?.enabled ?? true,
    metadata: raw?.metadata ?? null,
    content: {
      ...rawContent,
      title: input.heading ?? rawContent.title ?? 'Title',
      subtitle: input.subtitle !== undefined ? input.subtitle : (rawContent.subtitle ?? 'Subtitle'),
      image_url: resolvedImageUrl,
      images: resolvedImages,
      process_title: input.process_title ?? rawContent.process_title ?? '제작 과정',
      process_steps: input.process_steps ?? rawContent.process_steps ?? [],
    },
  };
};

export const buildCraftsmanshipValuesUpdatePayload = (
  heading = '장인의 손끝에서 탄생하는 가치',
  description = '1998년부터 이어온 헤브론의 제조 철학—최고의 소재, 정밀한 공정, 그리고 장인의 이야기.',
  section?: MallSection,
): Partial<UpdatePageSectionREQ> => {
  const raw = section?.rawSection;
  const rawContent = (raw?.content || {}) as Record<string, any>;
  const items = Array.isArray(rawContent.items) ? rawContent.items : [];
  const { heading: _h, description: _d, ...cleanContent } = rawContent;

  return {
    section_type: 'craftsmanship_values',
    title: heading || raw?.title || '장인의 손끝에서 탄생하는 가치',
    subtitle: raw?.subtitle ?? null,
    description,
    image: raw?.image ?? null,
    link: raw?.link ?? null,
    is_active: raw?.is_active ?? section?.enabled ?? true,
    metadata: raw?.metadata ?? null,
    content: {
      ...cleanContent,
      items,
    },
  };
};

export const buildCustomProcessUpdatePayload = (
  steps: Array<{
    key?: string;
    number: string;
    title: string;
    image_alt?: string;
    image_url: string;
    description: string;
  }>,
  heading = '트로피 맞춤제작과정',
  description = '정성 어린 손길과 검증된 공정으로,\n당신의 순간을 완성합니다',
  layout = 'alternating',
  title = '트로피 맞춤제작과정',
  section?: MallSection,
): Partial<UpdatePageSectionREQ> => {
  const raw = section?.rawSection;
  const sanitizedSteps = steps.map((step, idx) => ({
    key: step.key || `step_${idx + 1}`,
    number: step.number || String(idx + 1).padStart(2, '0'),
    title: step.title,
    image_alt: step.image_alt || '',
    image_url: step.image_url,
    description: step.description || '',
  }));
  return {
    section_type: 'custom_process',
    title: heading || raw?.title || title,
    subtitle: raw?.subtitle ?? null,
    description,
    image: raw?.image ?? null,
    link: raw?.link ?? null,
    is_active: raw?.is_active ?? section?.enabled ?? true,
    metadata: raw?.metadata ?? null,
    content: {
      steps: sanitizedSteps,
      layout,
    },
  };
};

export const buildPressPreviewUpdatePayload = (
  items: Array<{
    id?: number;
    link?: string | null;
    title: string;
    category?: string;
    subtitle?: string;
    image_alt?: string;
    image_url: string;
  }> = [],
  heading = '언론보도',
  description = '헤브론의 주요 소식과 언론 보도 내용을 소개합니다.',
  layout = 'coverflow',
  title = '언론보도',
  section?: MallSection,
  mediaIds?: number[],
  limit?: number,
): Partial<UpdatePageSectionREQ> => {
  const raw = section?.rawSection;
  const rawContent = (raw?.content || {}) as Record<string, any>;
  const { heading: _prevHeading, description: _prevDescription, ...cleanContent } = rawContent;
  const resolvedMediaIds = mediaIds || items.map((i: any) => Number(i.id)).filter((id) => !isNaN(id) && id > 0);

  return {
    section_type: 'press_preview',
    title: heading || raw?.title || title,
    subtitle: raw?.subtitle ?? null,
    description: description !== undefined ? description : (raw?.description ?? null),
    image: raw?.image ?? null,
    link: raw?.link ?? null,
    is_active: raw?.is_active ?? section?.enabled ?? true,
    metadata: raw?.metadata ?? null,
    content: {
      ...cleanContent,
      items,
      media_ids: resolvedMediaIds,
      ...(typeof limit === 'number' && limit > 0 ? { limit } : {}),
      layout,
      heading,
      description,
    },
  };
};

export const buildManufacturingProcessUpdatePayload = (
  processItems: ManufacturingProcessItem[],
  description?: string | null,
  title?: string,
  subtitle?: string | null,
  section?: MallSection,
): Partial<UpdatePageSectionREQ> => {
  const raw = section?.rawSection;
  const rawContent = (raw?.content || {}) as Record<string, any>;
  const sectionType = raw?.section_type ?? section?.type ?? 'manufacturing_process';

  if (sectionType === 'process_steps') {
    const { items: _items, ...cleanContent } = rawContent;
    const steps = processItems.map((stepItem, stepIndex) => ({
      key: stepItem.key || `step_${stepIndex + 1}`,
      image: stepItem.image_url || stepItem.image || '',
      title: stepItem.title,
      subtitle: stepItem.subtitle || '',
      description: stepItem.description || '',
    }));

    return {
      section_type: 'process_steps',
      title: title ?? raw?.title ?? 'Production Process',
      subtitle: subtitle !== undefined ? subtitle : (raw?.subtitle ?? null),
      description: description !== undefined ? description : (raw?.description ?? null),
      image: raw?.image ?? null,
      link: raw?.link ?? null,
      is_active: raw?.is_active ?? section?.enabled ?? true,
      metadata: raw?.metadata ?? null,
      content: {
        ...cleanContent,
        steps,
        interaction: rawContent.interaction || 'scroll_driven_or_tabs',
      },
    };
  }

  // default 'manufacturing_process'
  const { steps: _steps, ...cleanContent } = rawContent;
  const items = processItems.map((item, idx) => ({
    key: item.key || `process_${idx + 1}`,
    title: item.title,
    description: item.description || '',
    image_url: item.image_url || item.image || '',
    video_url: item.video_url || null,
    media_type: item.video_url ? 'video' : item.media_type || 'image',
  }));

  return {
    section_type: 'manufacturing_process',
    title: title ?? raw?.title ?? '제조공정',
    subtitle: subtitle !== undefined ? subtitle : (raw?.subtitle ?? null),
    description: description !== undefined ? description : (raw?.description ?? null),
    image: raw?.image ?? null,
    link: raw?.link ?? null,
    is_active: raw?.is_active ?? section?.enabled ?? true,
    metadata: raw?.metadata ?? null,
    content: {
      ...cleanContent,
      items,
    },
  };
};

export const buildPortfolioPreviewUpdatePayload = (
  heading = '포트폴리오',
  description = '',
  title = '포트폴리오',
  subtitle?: string | null,
  section?: MallSection,
  limit?: number,
): Partial<UpdatePageSectionREQ> => {
  const raw = section?.rawSection;
  const prevContent = (raw?.content || {}) as Record<string, any>;
  const { heading: _heading, description: _description, ...restContent } = prevContent;
  const displayLimit = Number(limit || prevContent.limit);

  return {
    section_type: 'portfolio_preview',
    title: heading || raw?.title || title,
    subtitle: subtitle !== undefined ? subtitle : (raw?.subtitle ?? null),
    description,
    image: raw?.image ?? null,
    link: raw?.link ?? null,
    is_active: raw?.is_active ?? section?.enabled ?? true,
    metadata: raw?.metadata ?? null,
    content: {
      ...restContent,
      ...(displayLimit > 0 ? { limit: displayLimit } : {}),
    },
  };
};

export const buildContactMapUpdatePayload = (input: ContactMapInput, section?: MallSection): Partial<UpdatePageSectionREQ> => {
  const raw = section?.rawSection;
  const rawContent = (raw?.content || {}) as Record<string, any>;
  const rawMap = (rawContent.map || {}) as Record<string, any>;
  const rawCompany = (rawContent.company || {}) as Record<string, any>;

  return {
    section_type: 'contact_information',
    title: input.heading ?? raw?.title ?? '찾아오시는 길',
    subtitle: raw?.subtitle ?? null,
    description: input.description !== undefined ? input.description : (raw?.description ?? null),
    image: raw?.image ?? null,
    link: raw?.link ?? null,
    is_active: raw?.is_active ?? section?.enabled ?? true,
    metadata: raw?.metadata ?? null,
    content: {
      map: {
        ...rawMap,
        address: input.address || rawMap.address || '',
        latitude: input.latitude,
        longitude: input.longitude,
        zoom: rawMap.zoom ?? 15,
        provider: rawMap.provider ?? 'image',
      },
      company: {
        ...rawCompany,
        name: input.place_name || rawCompany.name || '주식회사 헤브론',
      },
    },
  };
};

export const transformSectionToUpdatePayload = (
  section: MallSection,
  overrideContent?: Record<string, any>,
  overrides?: Partial<UpdatePageSectionREQ>,
): UpdatePageSectionREQ => {
  const raw = section.rawSection;
  return {
    section_type: overrides?.section_type ?? section.type,
    title: overrides?.title ?? raw?.title ?? section.name,
    subtitle: overrides?.subtitle !== undefined ? overrides.subtitle : (raw?.subtitle ?? null),
    description: overrides?.description !== undefined ? overrides.description : (raw?.description ?? null),
    content: overrideContent ?? overrides?.content ?? raw?.content ?? {},
    image: overrides?.image !== undefined ? overrides.image : (raw?.image ?? null),
    link: overrides?.link !== undefined ? overrides.link : (raw?.link ?? null),
    is_active: overrides?.is_active ?? section.enabled ?? true,
    metadata: overrides?.metadata !== undefined ? overrides.metadata : (raw?.metadata ?? null),
  };
};
