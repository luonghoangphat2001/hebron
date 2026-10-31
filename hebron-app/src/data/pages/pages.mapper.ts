import {
  Custom1,
  Custom2,
  Custom3,
  Custom4,
  Custom5,
  Intro,
  Partner1,
  Partner2,
  Partner3,
  Partner4,
  Partner5,
  Partner6,
  Partner7,
  PortFolio1,
  PortFolio2,
  PortFolio3,
} from '@/assets/images';
import {
  BRAND_HOME_MANUFACTURING_VIDEO,
  BRAND_HOME_PRESS_COVERAGE,
  BRAND_HOME_STATS,
  BRAND_HOME_VALUE_ITEMS,
} from '@/utils/constants/brand-home.constant';
import { BRAND_MOMENT_TROPHIES } from '@/utils/constants/brand-moment.constant';
import { BRAND_ROUTE, ROUTE_NAME } from '@/utils/constants/route.constant';

export type * from '@/utils/types/pages.type';

import { formatPrice } from '@/utils/helper/common.helper';
import type {
  BrandHomeAboutCtaProductItemView,
  BrandHomeAboutCtaView,
  BrandHomeCustomProcessView,
  BrandHomeHeroView,
  BrandHomeIntroductionView,
  BrandHomeManufacturingView,
  BrandHomePartnerLogoView,
  BrandHomePortfolioView,
  BrandHomePressView,
  BrandHomeStatView,
  BrandHomeValuesView,
  BrandHomeViewModel,
  BrandMediaPageView,
  BrandProcessPageView,
  BrandProcessStepView,
  BrandStoryHeroView,
  BrandStoryHistoryView,
  BrandStoryIdentityView,
  BrandStoryPageView,
  BrandStoryTimelineItemView,
  CompanyInfoView,
} from '@/utils/types/pages.type';
import type {
  AboutCtaContentRESP,
  AboutCtaProductItemRESP,
  AchievementCtaContentRESP,
  BrandIdentityContentRESP,
  BrandStatementContentRESP,
  CertificatesContentRESP,
  ClientLogosContentRESP,
  CompanyHistoryContentRESP,
  CompanyHistoryItemRESP,
  CraftsmanshipValuesContentRESP,
  CustomProcessContentRESP,
  EquipmentGalleryContentRESP,
  HeroSectionContentRESP,
  ManufacturingProcessContentRESP,
  PageRESP,
  PageSectionRESP,
  PortfolioPreviewContentRESP,
  PressPreviewContentRESP,
  ProcessStepsContentRESP,
  ProductPreviewContentRESP,
  ProductionVideoContentRESP,
  QualityControlContentRESP,
} from './pages.response';
import { PAGE_SECTION_TYPE } from './pages.response';

const CMS_PATH_TO_APP_ROUTE: Record<string, string> = {
  '/': BRAND_ROUTE.HOME,
  '/home': BRAND_ROUTE.HOME,
  '/inquiry': BRAND_ROUTE.PRODUCT_INQUIRY,
  '/product-inquiry': BRAND_ROUTE.PRODUCT_INQUIRY,
  '/company': BRAND_ROUTE.BRAND_PAGE,
  '/brand-page': BRAND_ROUTE.BRAND_PAGE,
  '/portfolio': BRAND_ROUTE.PORTFOLIO,
  '/process': BRAND_ROUTE.PROCESS,
  '/media': BRAND_ROUTE.MEDIA,
  '/faq': BRAND_ROUTE.FAQ,
  '/contact': BRAND_ROUTE.CONTACT,
  '/contact-us': BRAND_ROUTE.CONTACT,
  '/products': ROUTE_NAME.HOME,
};

export const resolveCmsLink = (link: string | null | undefined, fallback: string): string => {
  if (!link) return fallback;

  const trimmed = link.trim();
  if (!trimmed) return fallback;
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('mailto:') || trimmed.startsWith('tel:')) {
    return trimmed;
  }

  const normalized = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return CMS_PATH_TO_APP_ROUTE[normalized] ?? normalized;
};

const isActiveSection = (section: PageSectionRESP) => section.is_active !== false;

export const findSection = (page: PageRESP, ...sectionTypes: string[]) =>
  page.sections.find((section) => isActiveSection(section) && sectionTypes.includes(section.section_type));

export const asContent = <T>(section: PageSectionRESP | undefined): T | null => {
  if (!section?.content || typeof section.content !== 'object') return null;
  return section.content as T;
};

export const getSortedHeroItems = (content?: HeroSectionContentRESP | null) =>
  (content?.items ?? []).filter((item) => item.is_active !== false).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

/** Prefer CMS media; never leave list/media slots without a usable src. */
const withMediaFallback = (value: string | null | undefined, fallback: string | undefined): string => {
  const trimmed = value?.trim();
  if (trimmed) return trimmed;
  return fallback ?? '';
};

const DEFAULT_PARTNERS: BrandHomePartnerLogoView[] = [Partner1, Partner2, Partner3, Partner4, Partner5, Partner6, Partner7].map(
  (logoUrl, index) => ({
    id: `partner-${index + 1}`,
    name: '',
    logoUrl,
    link: null,
  }),
);

const DEFAULT_HERO: BrandHomeHeroView = {
  heading: '그 순간을\n영원히 담다',
  description: '수십 년의 장인 정신으로 만들어낸\n고품격 트로피 · 상패 · 기념패',
  ctaLabel: '제작 문의',
  ctaLink: BRAND_ROUTE.PRODUCT_INQUIRY,
  imageUrlPC: null,
  imageUrlMB: null,
  overlayOpacity: 0.64,
};

const DEFAULT_INTRODUCTION: BrandHomeIntroductionView = {
  heading: '헤브론 소개',
  description: `㈜헤브론은 맞춤형 트로피와 상패 분야의 선두주자입니다.
창의적 디자인과 최고 품질로 스포츠 대회부터 기업 시상까지
다양한 고객 요구에 맞춘 서비스를 제공해왔습니다.
전국 6,000여 거래처와의 신뢰를 바탕으로,
단일 제품부터 대량 주문까지 예산과 목적에 맞는 솔루션을 제공합니다.
독창적 디자인과 맞춤 제작으로
고객의 특별한 순간을 빛내어 드릴 것을 약속드립니다.`,
  imageUrl: Intro,
  mediaType: 'image',
  imageAlt: '',
};

const DEFAULT_VALUES: BrandHomeValuesView = {
  heading: '장인의 손끝에서\n탄생하는 가치',
  description: '1998년부터 이어온 헤브론의 제조 철학—최고의 소재, 정밀한 공정, 그리고 당신만의 이야기.',
  cards: BRAND_HOME_VALUE_ITEMS.map((item) => ({
    id: item.id,
    title: item.title,
    subtitle: item.subtitle,
    image: item.image,
    imageAlt: '',
    buttonLabel: '더 보기',
    link: BRAND_ROUTE.BRAND_PAGE,
    description: item.description,
    products: [],
  })),
};

const DEFAULT_CUSTOM_PROCESS: BrandHomeCustomProcessView = {
  heading: '트로피 맞춤제작과정',
  description: '정성 어린 손길과 검증된 공정으로,\n당신의 순간을 완성합니다',
  steps: [
    {
      id: 'sketch',
      title: '스케치',
      description: '고객의 요구사항을 바탕으로\n제품의 첫 번째 형태를 손으로 그려냅니다.',
      image: Custom1,
      imageAlt: '',
    },
    {
      id: '3d-design',
      title: '3D 제품디자인',
      description: '스케치를 기반으로 정밀한\n3D 모델링 작업을 진행합니다.',
      image: Custom2,
      imageAlt: '',
    },
    {
      id: 'rendering',
      title: '렌더링 (3D시안)',
      description: '완성된 3D 모델을 실제와\n동일하게 렌더링하여 시안을 제작합니다.',
      image: Custom3,
      imageAlt: '',
    },
    {
      id: 'mockup',
      title: '석고목업 (or 3D프린팅)',
      description: '실제 제작 전 목업을 제작하여\n형태와 비율을 최종 검토합니다.',
      image: Custom4,
      imageAlt: '',
    },
    {
      id: 'completed',
      title: '최종완성제품',
      description: '검증된 설계를 바탕으로\n최고의 소재와 공정으로 완성합니다.',
      image: Custom5,
      imageAlt: '',
    },
  ],
};

const DEFAULT_PRESS: BrandHomePressView = {
  title: BRAND_HOME_PRESS_COVERAGE.title,
  subtitle: BRAND_HOME_PRESS_COVERAGE.subtitle,
  items: BRAND_HOME_PRESS_COVERAGE.items.map((item) => ({
    id: item.id,
    category: item.category,
    title: item.title,
    subtitle: item.subtitle,
    image: item.image,
    link: null,
  })),
};

const DEFAULT_MANUFACTURING: BrandHomeManufacturingView = {
  title: BRAND_HOME_MANUFACTURING_VIDEO.title,
  subtitle: BRAND_HOME_MANUFACTURING_VIDEO.subtitle,
  slides: BRAND_HOME_MANUFACTURING_VIDEO.slides.map((slide) => ({
    id: slide.id,
    title: slide.title,
    poster: slide.poster,
    videoUrl: slide.videoUrl,
  })),
};

const DEFAULT_PORTFOLIO_IMAGES = [PortFolio1, PortFolio2, PortFolio3] as const;

const DEFAULT_PORTFOLIO: BrandHomePortfolioView = {
  heading: '포트폴리오',
  description: '골프장에서, 시상대 위에서, 회의실 한켠에서—\n헤브론은 그 자리에 있었습니다',
  viewAllLabel: '전체 보기',
  viewAllLink: BRAND_ROUTE.PORTFOLIO,
  items: DEFAULT_PORTFOLIO_IMAGES.map((image, index) => ({
    id: `portfolio-${index + 1}`,
    title: '',
    image,
    imageMobile: image,
    linkUrl: BRAND_ROUTE.PORTFOLIO,
  })),
};

const DEFAULT_ABOUT_CTA: BrandHomeAboutCtaView = {
  heading: '당신의 순간을\nHEBRON이 완성합니다',
  description: '기업 행사, 골프 대회, 포상식, 기념일\n어떤 자리든 헤브론의 상패가 그 가치를 더합니다',
  primaryLabel: '제작문의',
  primaryLink: BRAND_ROUTE.PRODUCT_INQUIRY,
  secondaryLabel: '기성품 보러가기',
  secondaryLink: BRAND_ROUTE.PRODUCTS,
  productImages: [...BRAND_MOMENT_TROPHIES],
};

const mapHero = (page: PageRESP): BrandHomeHeroView => {
  const section = findSection(page, PAGE_SECTION_TYPE.HERO_SECTION);
  const content = asContent<HeroSectionContentRESP>(section);
  const sortedItems = getSortedHeroItems(content);
  const firstItem = sortedItems[0];

  const heading = content?.heading?.trim() || section?.title?.trim() || firstItem?.title?.trim() || DEFAULT_HERO.heading;

  const description =
    content?.description?.trim() ||
    section?.description?.trim() ||
    section?.subtitle?.trim() ||
    firstItem?.description?.trim() ||
    firstItem?.subtitle?.trim() ||
    DEFAULT_HERO.description;

  const imageUrlPC = firstItem?.image_url || DEFAULT_HERO.imageUrlPC;

  return {
    heading,
    description,
    ctaLabel: content?.primary_cta?.label || firstItem?.button_label || DEFAULT_HERO.ctaLabel,
    ctaLink: resolveCmsLink(content?.primary_cta?.link || firstItem?.link || section?.link, DEFAULT_HERO.ctaLink),
    imageUrlPC,
    imageUrlMB: firstItem?.mobile_image_url || imageUrlPC,
    overlayOpacity: firstItem?.overlay_opacity ?? DEFAULT_HERO.overlayOpacity,
  };
};

const mapStats = (page: PageRESP): BrandHomeStatView[] => {
  const section = findSection(page, PAGE_SECTION_TYPE.HERO_SECTION);
  const content = asContent<HeroSectionContentRESP>(section);
  const stats = content?.stats;

  if (!stats?.length) {
    return BRAND_HOME_STATS.map((item) => ({ value: item.value, label: item.label }));
  }

  return stats.map((stat) => ({
    value: stat.value,
    label: (stat.lines ?? []).join('\n'),
  }));
};

const mapPartners = (page: PageRESP): BrandHomePartnerLogoView[] => {
  const section = findSection(page, PAGE_SECTION_TYPE.CLIENT_LOGOS);
  const content = asContent<ClientLogosContentRESP>(section);
  const logos = content?.logos;

  if (!logos?.length) return DEFAULT_PARTNERS;

  return logos.map((logo, index) => {
    const fallback = DEFAULT_PARTNERS[index % DEFAULT_PARTNERS.length];
    return {
      id: `${logo.name ?? 'partner'}-${index}`,
      name: logo.name ?? '',
      logoUrl: withMediaFallback(logo.logo_url, fallback?.logoUrl),
      link: logo.link ?? null,
    };
  });
};

const mapIntroduction = (page: PageRESP): BrandHomeIntroductionView => {
  const section = findSection(page, PAGE_SECTION_TYPE.BRAND_STATEMENT);
  const content = asContent<BrandStatementContentRESP>(section);

  const heading = content?.heading?.trim() || section?.title?.trim() || DEFAULT_INTRODUCTION.heading;
  const description =
    content?.description?.trim() || section?.description?.trim() || section?.subtitle?.trim() || DEFAULT_INTRODUCTION.description;

  return {
    heading,
    description,
    imageUrl: withMediaFallback(content?.visual?.image_url || section?.image, DEFAULT_INTRODUCTION.imageUrl ?? undefined),
    mediaType: content?.visual?.media_type === 'video' && content.visual.image_url?.trim() ? 'video' : 'image',
    imageAlt: content?.visual?.alt || '',
  };
};

const mapValues = (page: PageRESP): BrandHomeValuesView => {
  const section = findSection(page, PAGE_SECTION_TYPE.CRAFTSMANSHIP_VALUES, PAGE_SECTION_TYPE.PRODUCT_PREVIEW);
  if (!section) return DEFAULT_VALUES;

  const craftContent = asContent<CraftsmanshipValuesContentRESP>(section);
  const prodContent = asContent<ProductPreviewContentRESP>(section);

  const heading = section.title?.trim() || prodContent?.heading?.trim() || DEFAULT_VALUES.heading;

  const description =
    section.description?.trim() || section.subtitle?.trim() || prodContent?.description?.trim() || DEFAULT_VALUES.description;

  if (craftContent?.items?.length) {
    const activeItems = craftContent.items
      .filter((item) => item.is_active !== false)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

    return {
      heading,
      description,
      cards: activeItems.map((item, index) => {
        const fallback = DEFAULT_VALUES.cards[index % DEFAULT_VALUES.cards.length];
        const products = (item.products || [])
          .filter((p) => p.is_active !== false)
          .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
          .map((prod, pIdx) => {
            const title = typeof prod.name === 'object' ? prod.name.ko || prod.name.en || '' : prod.name || '';
            const rawPrice = prod.supply_price ?? 0;

            return {
              id: String(prod.product_id || prod.product_code || `prod-${pIdx}`),
              title: title || '제품 제목',
              price: formatPrice(rawPrice),
              image: prod.first_image?.trim() || '',
              slug: prod.slug,
            };
          });

        return {
          id: String(item.id || `value-${index}`),
          title: item.title || fallback?.title || '',
          subtitle: item.subtitle || fallback?.subtitle || '',
          image: withMediaFallback(item.image_url, fallback?.image),
          imageAlt: item.title || '',
          buttonLabel: item.button_label || '더 보기',
          link: BRAND_ROUTE.BRAND_PAGE,
          description: item.description || fallback?.description || '',
          products,
        };
      }),
    };
  }

  if (prodContent?.cards?.length) {
    return {
      heading,
      description,
      cards: prodContent.cards.map((card, index) => {
        const fallback = DEFAULT_VALUES.cards[index % DEFAULT_VALUES.cards.length];
        return {
          id: card.key || `value-${index}`,
          title: card.title || fallback?.title || '',
          subtitle: card.subtitle || fallback?.subtitle || '',
          image: withMediaFallback(card.image_url, fallback?.image),
          imageAlt: card.image_alt || '',
          buttonLabel: card.button_label || '더 보기',
          link: resolveCmsLink(card.link || prodContent.catalog_link || section?.link, BRAND_ROUTE.BRAND_PAGE),
          description: card.description || '',
          products: [],
        };
      }),
    };
  }

  return {
    heading,
    description,
    cards: DEFAULT_VALUES.cards,
  };
};

const mapCustomProcess = (page: PageRESP): BrandHomeCustomProcessView => {
  const section = findSection(page, PAGE_SECTION_TYPE.CUSTOM_PROCESS);
  const content = asContent<CustomProcessContentRESP>(section);

  const heading = content?.heading?.trim() || section?.title?.trim() || DEFAULT_CUSTOM_PROCESS.heading;
  const description =
    content?.description?.trim() ||
    section?.description?.trim() ||
    section?.subtitle?.trim() ||
    DEFAULT_CUSTOM_PROCESS.description;

  const steps = content?.steps?.length
    ? content.steps.map((step, index) => {
        const fallback = DEFAULT_CUSTOM_PROCESS.steps[index % DEFAULT_CUSTOM_PROCESS.steps.length];
        return {
          id: step.key || step.number || fallback?.id || `step-${index}`,
          title: step.title || fallback?.title || '',
          description: step.description || fallback?.description || '',
          image: withMediaFallback(step.image_url, fallback?.image),
          imageAlt: step.image_alt || '',
        };
      })
    : DEFAULT_CUSTOM_PROCESS.steps;

  return {
    heading,
    description,
    steps,
  };
};

const mapPress = (page: PageRESP): BrandHomePressView => {
  const section = findSection(page, PAGE_SECTION_TYPE.PRESS_PREVIEW);
  const content = asContent<PressPreviewContentRESP>(section);

  const title = section?.title?.trim() || content?.heading?.trim() || DEFAULT_PRESS.title;
  const subtitle =
    section?.description?.trim() || content?.description?.trim() || section?.subtitle?.trim() || DEFAULT_PRESS.subtitle;

  const items = content?.items?.length
    ? content.items.map((item, index) => {
        const fallback = DEFAULT_PRESS.items[index % DEFAULT_PRESS.items.length];
        const category = typeof item.category === 'object' ? item.category?.name : item.category;
        const cleanSubtitle = (item.description || item.subtitle || '')
          .replace(/<[^>]*>/g, '')
          .replace(/&nbsp;/g, ' ')
          .trim();

        return {
          id: String(item.id ?? `press-${index}`),
          category: category || fallback?.category || '',
          title: item.title || fallback?.title || '',
          subtitle: cleanSubtitle || fallback?.subtitle || '',
          image: withMediaFallback(item.image_url || item.url, fallback?.image),
          link: item.link_url || item.link || null,
        };
      })
    : DEFAULT_PRESS.items;

  return {
    title,
    subtitle,
    items,
  };
};

const mapManufacturing = (page: PageRESP): BrandHomeManufacturingView => {
  const section = findSection(page, PAGE_SECTION_TYPE.MANUFACTURING_PROCESS);
  const content = asContent<ManufacturingProcessContentRESP>(section);

  const title = content?.heading?.trim() || section?.title?.trim() || DEFAULT_MANUFACTURING.title;
  const subtitle =
    content?.description?.trim() || section?.description?.trim() || section?.subtitle?.trim() || DEFAULT_MANUFACTURING.subtitle;

  const slides = content?.items?.length
    ? content.items.map((item, index) => {
        const fallback = DEFAULT_MANUFACTURING.slides[index % DEFAULT_MANUFACTURING.slides.length];
        return {
          id: item.key || `manufacturing-${index}`,
          title: item.title && !item.title.includes('${') ? item.title : fallback?.title || '',
          description: item.description || '',
          poster: withMediaFallback(item.image_url || item.thumbnail_url || section?.image, fallback?.poster),
          videoUrl: item.video_url || '',
        };
      })
    : DEFAULT_MANUFACTURING.slides;

  return {
    title,
    subtitle,
    slides,
  };
};

export const mapPortfolio = (page: PageRESP): BrandHomePortfolioView => {
  const section = findSection(page, PAGE_SECTION_TYPE.PORTFOLIO_PREVIEW);
  const content = asContent<PortfolioPreviewContentRESP>(section);

  const heading = content?.heading?.trim() || section?.title?.trim() || DEFAULT_PORTFOLIO.heading;
  const description =
    content?.description?.trim() || section?.description?.trim() || section?.subtitle?.trim() || DEFAULT_PORTFOLIO.description;

  const items = content?.items ?? [];

  return {
    heading,
    description,
    viewAllLabel: content?.view_all_label || DEFAULT_PORTFOLIO.viewAllLabel,
    viewAllLink: resolveCmsLink(content?.view_all_link || section?.link, DEFAULT_PORTFOLIO.viewAllLink),
    items:
      items.length > 0
        ? items.map((item, index) => {
            const fallbackImage = DEFAULT_PORTFOLIO_IMAGES[index % DEFAULT_PORTFOLIO_IMAGES.length];
            const image = withMediaFallback(item.cover_image, fallbackImage);
            const linkUrl = item.id ? `${BRAND_ROUTE.PORTFOLIO}/${item.id}` : BRAND_ROUTE.PORTFOLIO;

            return {
              id: String(item.id ?? `portfolio-${index}`),
              title: item.title || '',
              image,
              imageMobile: image,
              linkUrl,
            };
          })
        : DEFAULT_PORTFOLIO.items,
  };
};

export const mapAboutCta = (page: PageRESP): BrandHomeAboutCtaView => {
  const section = findSection(page, PAGE_SECTION_TYPE.ABOUT_CTA);
  const content = asContent<AboutCtaContentRESP>(section);

  const heading = content?.heading?.trim() || section?.title?.trim() || DEFAULT_ABOUT_CTA.heading;
  const description =
    content?.description?.trim() || section?.description?.trim() || section?.subtitle?.trim() || DEFAULT_ABOUT_CTA.description;

  const rawItems = (content?.item ?? content?.items ?? []) as (AboutCtaProductItemRESP | string)[];
  const items: BrandHomeAboutCtaProductItemView[] = rawItems
    .map((it) => {
      if (typeof it === 'string') {
        const image = it.trim();
        return image ? { image } : null;
      }
      const image = it?.image?.trim() || '';
      return image ? { slug: it?.slug, image } : null;
    })
    .filter((it): it is BrandHomeAboutCtaProductItemView => Boolean(it));

  const itemImages = items.map((it) => it.image);
  const productImages = (content?.product_images?.length ? content.product_images : itemImages).filter((url) =>
    Boolean(url?.trim()),
  );

  return {
    heading,
    description,
    primaryLabel: content?.primary_button?.label || content?.button_label || DEFAULT_ABOUT_CTA.primaryLabel,
    primaryLink: resolveCmsLink(content?.primary_button?.link || section?.link, DEFAULT_ABOUT_CTA.primaryLink),
    secondaryLabel: content?.secondary_button?.label || DEFAULT_ABOUT_CTA.secondaryLabel,
    secondaryLink: resolveCmsLink(content?.secondary_button?.link, DEFAULT_ABOUT_CTA.secondaryLink),
    thirdLabel: content?.third_button?.label,
    thirdLink: content?.third_button?.link ? resolveCmsLink(content.third_button.link, '') : undefined,
    productImages: productImages.length > 0 ? productImages : DEFAULT_ABOUT_CTA.productImages,
    items: items.length > 0 ? items : undefined,
  };
};

export const mapBrandHomePage = (page: PageRESP): BrandHomeViewModel => ({
  hero: mapHero(page),
  stats: mapStats(page),
  partners: mapPartners(page),
  introduction: mapIntroduction(page),
  values: mapValues(page),
  customProcess: mapCustomProcess(page),
  press: mapPress(page),
  manufacturing: mapManufacturing(page),
  portfolio: mapPortfolio(page),
  aboutCta: mapAboutCta(page),
});

export const createFallbackBrandHomeView = (): BrandHomeViewModel => ({
  hero: DEFAULT_HERO,
  stats: BRAND_HOME_STATS.map((item) => ({ value: item.value, label: item.label })),
  partners: DEFAULT_PARTNERS,
  introduction: DEFAULT_INTRODUCTION,
  values: DEFAULT_VALUES,
  customProcess: DEFAULT_CUSTOM_PROCESS,
  press: DEFAULT_PRESS,
  manufacturing: DEFAULT_MANUFACTURING,
  portfolio: DEFAULT_PORTFOLIO,
  aboutCta: DEFAULT_ABOUT_CTA,
});

const mapBrandStoryHero = (page: PageRESP): BrandStoryHeroView | undefined => {
  const section = findSection(page, PAGE_SECTION_TYPE.HERO_SECTION);
  if (!section) return undefined;

  const content = asContent<HeroSectionContentRESP>(section);
  const sortedItems = getSortedHeroItems(content);
  const bgItem = sortedItems[0];
  const bannerItem = sortedItems[1];
  const backgroundImageUrlPC = bgItem?.image_url || null;

  return {
    heading: section.title || content?.heading || '브랜드',
    description: section.description || section.subtitle || content?.description || '',
    backgroundImageUrlPC,
    backgroundImageUrlMB: bgItem?.mobile_image_url || backgroundImageUrlPC,
    imageUrl: bannerItem?.image_url || null,
    stats: content?.stats?.map((s) => ({
      value: s.value,
      label: s.label || (s.lines ? s.lines.join(' ') : ''),
    })),
  };
};

const mapBrandStoryCompanyIntro = (page: PageRESP): CompanyInfoView | undefined => {
  const section = findSection(page, PAGE_SECTION_TYPE.CERTIFICATES);
  if (!section) return undefined;

  const content = asContent<CertificatesContentRESP>(section);
  if (!content?.company_info?.length) return undefined;

  return {
    heading: section.title || content.heading || '회사소개',
    description: section.description || section.subtitle || content.description,
    imageUrl: content.image_url || section.image || null,
    companyInfo: content.company_info.map((info) => ({
      label: info.label || '',
      value: info.value || '',
    })),
  };
};

const mapBrandStoryIdentity = (page: PageRESP): BrandStoryIdentityView | undefined => {
  const section = findSection(page, PAGE_SECTION_TYPE.BRAND_IDENTITY);
  if (!section) return undefined;

  const content = asContent<BrandIdentityContentRESP>(section);

  return {
    title: section.title || '',
    heading: content?.heading || section.title || undefined,
    image: content?.background_image || content?.image || section.image || null,
    philosophy: content?.philosophy,
    centerTitle: content?.center_title,
    centerDescription: content?.center_description,
    values: (content?.values ?? []).map((v) => ({
      key: v.key,
      title: v.title || '',
      description: v.description || '',
    })),
  };
};

const mapBrandStoryHistory = (page: PageRESP): BrandStoryHistoryView | undefined => {
  const section = findSection(page, PAGE_SECTION_TYPE.COMPANY_HISTORY);
  if (!section) return undefined;

  const content = asContent<CompanyHistoryContentRESP>(section);

  const timelineItems: BrandStoryTimelineItemView[] = [];
  if (content?.timeline) {
    content.timeline.forEach((groupOrItem) => {
      const items: CompanyHistoryItemRESP[] =
        'items' in groupOrItem && Array.isArray(groupOrItem.items)
          ? (groupOrItem.items as CompanyHistoryItemRESP[])
          : [groupOrItem as CompanyHistoryItemRESP];

      items.forEach((item) => {
        const rawYear = typeof item.year === 'number' ? item.year : parseInt(String(item.year || 0), 10);
        const yearNum = !isNaN(rawYear) && rawYear > 0 ? rawYear : 2000;
        //First Image base on Figma require
        const firstImage =
          Array.isArray(item.images) && item.images.length > 0
            ? typeof item.images[0] === 'string'
              ? item.images[0]
              : item.images[0]?.image_url
            : item.image_url;

        timelineItems.push({
          year: yearNum,
          title: item.title,
          description: item.description || item.title || '',
          images: firstImage ? [firstImage] : undefined,
        });
      });
    });
  }

  return {
    title: section.title || '회사연혁',
    heading: content?.heading || section.title || undefined,
    description: content?.description || content?.intro,
    intro: content?.intro || content?.description,
    timeline: timelineItems,
  };
};

const mapBrandStoryCertificates = (page: PageRESP) => {
  const section = findSection(page, PAGE_SECTION_TYPE.CERTIFICATES);
  if (!section) return undefined;

  const content = asContent<CertificatesContentRESP>(section);
  if (!content?.items?.length) return undefined;

  return {
    title: section.title || 'Certificates',
    items: content.items.map((item) => ({
      type: item.type || 'award',
      year: String(item.year || ''),
      title: item.title || '',
      issuer: item.issuer || '',
      image: item.image || null,
    })),
  };
};

export const mapBrandStoryPage = (page: PageRESP): BrandStoryPageView => ({
  title: page.title || '',
  hero: mapBrandStoryHero(page),
  companyIntro: mapBrandStoryCompanyIntro(page),
  identity: mapBrandStoryIdentity(page),
  history: mapBrandStoryHistory(page),
  certificates: mapBrandStoryCertificates(page),
});

export const mapAchievementCta = (page: PageRESP): BrandHomeAboutCtaView | undefined => {
  const section = findSection(page, PAGE_SECTION_TYPE.ACHIEVEMENT_CTA);
  if (!section) return undefined;

  const content = asContent<AchievementCtaContentRESP>(section);
  if (!content) return undefined;

  const primaryBtn = content.buttons?.find((b) => b.variant === 'primary');
  const secondaryBtn = content.buttons?.find((b) => b.variant === 'outline');
  const trophyImages = (content.trophy_images ?? []).filter((url) => Boolean(url?.trim()));

  return {
    heading: section.title || DEFAULT_ABOUT_CTA.heading,
    description: content.description || DEFAULT_ABOUT_CTA.description,
    primaryLabel: primaryBtn?.label || DEFAULT_ABOUT_CTA.primaryLabel,
    primaryLink: resolveCmsLink(primaryBtn?.href || section.link, DEFAULT_ABOUT_CTA.primaryLink),
    secondaryLabel: secondaryBtn?.label || DEFAULT_ABOUT_CTA.secondaryLabel,
    secondaryLink: resolveCmsLink(secondaryBtn?.href, DEFAULT_ABOUT_CTA.secondaryLink),
    productImages: trophyImages.length > 0 ? trophyImages : DEFAULT_ABOUT_CTA.productImages,
  };
};

export const mapBrandProcessPage = (page: PageRESP): BrandProcessPageView => {
  const heroSection = findSection(page, PAGE_SECTION_TYPE.HERO_SECTION);
  const heroContent = asContent<HeroSectionContentRESP>(heroSection);
  const heroItems = getSortedHeroItems(heroContent);
  const bgItem = heroItems[0];
  const heroBackgroundImageUrlPC = bgItem?.image_url || null;
  const heroBackgroundImageUrlMB = bgItem?.mobile_image_url || heroBackgroundImageUrlPC;

  const stepsSection = findSection(page, PAGE_SECTION_TYPE.PROCESS_STEPS);
  const videoSection = findSection(page, PAGE_SECTION_TYPE.PRODUCTION_VIDEO);
  const equipmentSection = findSection(page, PAGE_SECTION_TYPE.EQUIPMENT_GALLERY);
  const qcSection = findSection(page, PAGE_SECTION_TYPE.QUALITY_CONTROL);

  const stepsContent = asContent<ProcessStepsContentRESP>(stepsSection);
  const rawSteps = stepsContent?.steps ?? [];

  const steps: BrandProcessStepView[] = rawSteps.map((step, idx) => {
    const stepKey = step.key || `step-${idx + 1}`;

    return {
      id: stepKey,
      key: stepKey,
      name: step.key || '',
      title: step.title || '',
      subtitle: step.subtitle,
      description: step.description || '',
      image: step.image || '',
    };
  });

  return {
    title: page.title || '',
    heroTitle: heroSection?.title || '공정',
    heroBackgroundImageUrlPC,
    heroBackgroundImageUrlMB,
    stepsSectionTitle: stepsSection?.title || '',
    steps,
    productionVideo: videoSection
      ? {
          title: videoSection.title || '',
          url: asContent<ProductionVideoContentRESP>(videoSection)?.url || null,
        }
      : undefined,
    equipmentGallery: equipmentSection
      ? {
          title: equipmentSection.title || '',
          items: (asContent<EquipmentGalleryContentRESP>(equipmentSection)?.items ?? []).map((item, idx) => ({
            key: item.key || `item-${idx + 1}`,
            name: item.name || '',
            title: item.title || '',
            image: item.image_url || '',
            description: item.description || '',
          })),
        }
      : undefined,
    qualityControl: qcSection
      ? {
          title: qcSection.title || '',
          description: asContent<QualityControlContentRESP>(qcSection)?.description || '',
          visual: asContent<QualityControlContentRESP>(qcSection)?.visual || null,
        }
      : undefined,
    aboutCta: mapAboutCta(page),
  };
};

export const mapBrandMediaPage = (page: PageRESP): BrandMediaPageView => {
  const heroSection = findSection(page, PAGE_SECTION_TYPE.HERO_SECTION);
  const heroContent = asContent<HeroSectionContentRESP>(heroSection);
  const heroItems = getSortedHeroItems(heroContent);
  const bgItem = heroItems[0];
  const heroBackgroundImageUrlPC = bgItem?.image_url || null;
  const heroBackgroundImageUrlMB = bgItem?.mobile_image_url || heroBackgroundImageUrlPC;

  return {
    title: page.title || 'Media',
    heroTitle: heroSection?.title || heroItems?.[0]?.title || page.title || 'Media',
    heroBackgroundImageUrlPC,
    heroBackgroundImageUrlMB,
    imageUrl: bgItem?.image_url || undefined,
    aboutCta: mapAboutCta(page),
  };
};

export type BrandProductsPageView = {
  title?: string;
  heroTitle?: string;
  heroBackgroundImageUrl?: string | null;
  aboutCta?: BrandHomeAboutCtaView;
};

export const mapBrandProductsPage = (page: PageRESP): BrandProductsPageView => {
  const heroSection = findSection(page, PAGE_SECTION_TYPE.HERO_SECTION);
  const heroContent = asContent<HeroSectionContentRESP>(heroSection);
  const heroItems = getSortedHeroItems(heroContent);
  const bgItem = heroItems[0];
  const heroBackgroundImageUrl = heroSection?.image || bgItem?.image_url || null;

  return {
    title: page.title || '기성품',
    heroTitle: heroSection?.title || heroItems?.[0]?.title || page.title || '기성품',
    heroBackgroundImageUrl,
    aboutCta: mapAboutCta(page),
  };
};
