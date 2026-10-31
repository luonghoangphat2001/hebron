export enum SiteType {
  SHOPPING_MALL = 'SHOPPING_MALL',
  BRAND_SITE = 'BRAND_SITE',
  PLAIN_SITE = 'PLAIN_SITE',
}

export enum PageType {
  HOME_PAGE = 'home_page',
  BRAND_STORY = 'brand_story',
  ORDER_INQUIRY = 'order_inquiry',
  PRIVACY_POLICY = 'privacy_policy',
  TERMS = 'terms',
  FAQS = 'faqs',
  PORTFOLIO = 'portfolio',
  PORTFOLIO_DETAIL = 'portfolio_detail',
  PROCESS = 'process',
  MEDIA = 'media',
  CONTACT_US = 'contact_us',
  PRODUCTION_INQUIRY = 'production_inquiry',
  STANDARD_PRODUCTS = 'standard_products',
}

export enum SectionType {
  HERO_SECTION = 'hero_section',
  CATEGORY_SHORTCUTS = 'category_shortcuts',
  PRODUCT_PREVIEW = 'product_preview',
  SECONDARY_BANNER = 'secondary_banner',
  STEADY_SELLER = 'steady_seller',
  PORTFOLIO_PREVIEW = 'portfolio_preview',
  NOTICES_PREVIEW = 'notices_preview',
  CATEGORY_PRODUCT_SHOWCASE = 'category_product_showcase',
  FAQ_SECTION = 'faq_section',
  CUSTOMER_CENTER = 'customer_center',
  FOOTER_QUICK_LINKS = 'footer_quick_links',
  CLIENT_LOGOS = 'client_logos',
  BRAND_STATEMENT = 'brand_statement',
  CRAFTSMANSHIP_VALUES = 'craftsmanship_values',
  CUSTOM_PROCESS = 'custom_process',
  PRESS_PREVIEW = 'press_preview',
  MANUFACTURING_PROCESS = 'manufacturing_process',
  ABOUT_CTA = 'about_cta',
  BRAND_IDENTITY = 'brand_identity',
  COMPANY_HISTORY = 'company_history',
  CERTIFICATES = 'certificates',
  PORTFOLIO_LIST = 'portfolio_list',
  PROJECT_OVERVIEW = 'project_overview',
  PROCESS_STEPS = 'process_steps',
  PRODUCTION_VIDEO = 'production_video',
  EQUIPMENT_GALLERY = 'equipment_gallery',
  QUALITY_CONTROL = 'quality_control',
  MEDIA_LIST = 'media_list',
  BRAND_VIDEOS = 'brand_videos',
  SNS_LINKS = 'sns_links',
  CONTACT_HERO = 'contact_hero',
  CONTACT_INFORMATION = 'contact_information',
  CONTACT_FORM = 'contact_form',
  ACHIEVEMENT_CTA = 'achievement_cta',
  INQUIRY_INTRO = 'inquiry_intro',
  INQUIRY_FORM = 'inquiry_form',
  PRODUCT_CATALOG = 'product_catalog',
  PRODUCT_LIST = 'product_list',
}

export const SITE_PAGE_MAP: Record<SiteType, PageType[]> = {
  [SiteType.SHOPPING_MALL]: [PageType.HOME_PAGE, PageType.ORDER_INQUIRY, PageType.TERMS, PageType.PRIVACY_POLICY],
  [SiteType.BRAND_SITE]: [
    PageType.HOME_PAGE,
    PageType.BRAND_STORY,
    PageType.STANDARD_PRODUCTS,
    PageType.PORTFOLIO,
    PageType.PORTFOLIO_DETAIL,
    PageType.PROCESS,
    PageType.MEDIA,
    PageType.CONTACT_US,
    PageType.PRODUCTION_INQUIRY,
    PageType.FAQS,
  ],
  [SiteType.PLAIN_SITE]: [PageType.HOME_PAGE, PageType.STANDARD_PRODUCTS],
};

export const SITE_PAGE_SECTION_MAP: Record<SiteType, Partial<Record<PageType, SectionType[]>>> = {
  [SiteType.SHOPPING_MALL]: {
    [PageType.HOME_PAGE]: [
      SectionType.HERO_SECTION,
      SectionType.CATEGORY_SHORTCUTS,
      SectionType.PRODUCT_PREVIEW,
      SectionType.SECONDARY_BANNER,
      SectionType.STEADY_SELLER,
      SectionType.NOTICES_PREVIEW,
      SectionType.CATEGORY_PRODUCT_SHOWCASE,
      SectionType.FAQ_SECTION,
      SectionType.CUSTOMER_CENTER,
      SectionType.FOOTER_QUICK_LINKS,
    ],
  },
  [SiteType.BRAND_SITE]: {
    [PageType.HOME_PAGE]: [
      SectionType.HERO_SECTION,
      SectionType.CLIENT_LOGOS,
      SectionType.BRAND_STATEMENT,
      SectionType.CRAFTSMANSHIP_VALUES,
      SectionType.MANUFACTURING_PROCESS,
      // SectionType.CUSTOM_PROCESS,
      SectionType.PRESS_PREVIEW,
      SectionType.PORTFOLIO_PREVIEW,
      SectionType.ABOUT_CTA,
    ],
    [PageType.BRAND_STORY]: [
      SectionType.HERO_SECTION,
      SectionType.BRAND_IDENTITY,
      SectionType.COMPANY_HISTORY,
      SectionType.CERTIFICATES,
    ],
    [PageType.PORTFOLIO]: [SectionType.PORTFOLIO_LIST],
    [PageType.PORTFOLIO_DETAIL]: [SectionType.PROJECT_OVERVIEW],
    [PageType.PROCESS]: [SectionType.HERO_SECTION, SectionType.PROCESS_STEPS, SectionType.ABOUT_CTA],
    [PageType.STANDARD_PRODUCTS]: [SectionType.HERO_SECTION, SectionType.PRODUCT_LIST, SectionType.ABOUT_CTA],
    [PageType.MEDIA]: [
      SectionType.HERO_SECTION,
      SectionType.MEDIA_LIST,
      SectionType.BRAND_VIDEOS,
      SectionType.SNS_LINKS,
      SectionType.ABOUT_CTA,
    ],
    [PageType.CONTACT_US]: [SectionType.HERO_SECTION, SectionType.CONTACT_INFORMATION, SectionType.ABOUT_CTA],
    [PageType.PRODUCTION_INQUIRY]: [SectionType.HERO_SECTION, SectionType.INQUIRY_FORM, SectionType.ABOUT_CTA],
    [PageType.FAQS]: [SectionType.HERO_SECTION, SectionType.FAQ_SECTION, SectionType.ABOUT_CTA],
  },
  [SiteType.PLAIN_SITE]: {
    [PageType.HOME_PAGE]: [SectionType.HERO_SECTION, SectionType.PRODUCT_CATALOG],
  },
};

export const getPagesBySiteType = (siteType: SiteType): PageType[] => {
  return SITE_PAGE_MAP[siteType] || [];
};

export const getSectionsBySiteAndPage = (siteType: SiteType, pageType: PageType): SectionType[] => {
  return SITE_PAGE_SECTION_MAP[siteType]?.[pageType] || [];
};

export enum ShortcutLinkType {
  NAVIGATE = 'navigate',
  DOWNLOAD = 'download',
}
