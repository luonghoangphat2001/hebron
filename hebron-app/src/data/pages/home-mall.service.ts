import { getBrandMediaDetailPath } from '@/utils/constants/route.constant';
import type {
  Banner,
  BannerCarouselItem,
  CategoryShortcutView,
  CustomerCenterInquiryView,
  CustomerCenterView,
  HeroBannerSectionView,
  HomeBannerItem,
  InPressCardItem,
  MallFaqItemView,
  MallFaqSectionView,
  MallInPressItemView,
  MallInPressSectionView,
  PopularCardItem,
  PopularCategoryView,
  PopularGroupItem,
  PopularSectionView,
  RecommendCategoryView,
  RecommendSectionView,
  ShowcaseProductView,
  SteadySellerSectionView,
} from '@/utils/types/home-mall.type';
import type { ProductItemRESP } from '../products/products.response';
import {
  CATEGORY_SHORTCUT_TYPE,
  PAGE_SECTION_TYPE,
  type CategoryProductShowcaseContentRESP,
  type CategoryShortcutsContentRESP,
  type CategoryShowcaseProductRESP,
  type FooterQuickLinksContentRESP,
  type HeroSectionContentRESP,
  type MallFaqSectionContentRESP,
  type MallProductPreviewContentRESP,
  type MallProductPreviewItemRESP,
  type PageRESP,
  type PageSectionRESP,
  type PopularCategoriesContentRESP,
  type PortfolioPreviewContentRESP,
  type PressPreviewContentRESP,
  type SecondaryBannerContentRESP,
} from './pages.response';

export type * from '@/utils/types/home-mall.type';

const getBrandMediaUrl = (id: string | number) => `https://hebron-brand.axndx.org${getBrandMediaDetailPath(id)}`;

const asContent = <T>(section?: PageSectionRESP): T | null => {
  if (!section?.content || typeof section.content !== 'object') return null;
  return section.content as T;
};

const findActiveSection = (page?: PageRESP, ...types: string[]): PageSectionRESP | undefined => {
  if (!page?.sections?.length) return undefined;
  return page.sections.find((section) => section.is_active !== false && types.includes(section.section_type));
};

export const normalizeBannerItem = (banner: BannerCarouselItem, index: number): Banner => ({
  id: banner.id ?? index + 1,
  title: banner.title ?? banner.name ?? '',
  subtitle: banner.subtitle ?? undefined,
  description: banner.description ?? undefined,
  buttonLabel: banner.buttonLabel ?? banner.button_label ?? undefined,
  mediaType: banner.mediaType ?? banner.media_type ?? 'image',
  imageUrl: banner.image ?? banner.image_url ?? '',
  imageUrlMobile: banner.image_url_mobile ?? undefined,
  videoUrl: banner.video_url ?? undefined,
  videoUrlMobile: banner.video_url_mobile ?? undefined,
  linkUrl: banner.linkUrl ?? banner.link_url ?? undefined,
  siteType: banner.siteType ?? banner.site_type ?? undefined,
  alt: banner.alt ?? banner.title ?? banner.name ?? `banner ${index + 1}`,
  sortOrder: banner.sortOrder ?? banner.sort_order ?? index + 1,
});

export const mapHeroBannerSection = (page?: PageRESP): HeroBannerSectionView => {
  const heroSection = findActiveSection(page, PAGE_SECTION_TYPE.HERO_SECTION);
  const content = asContent<HeroSectionContentRESP>(heroSection);
  if (!content?.items?.length) {
    return {
      banners: [],
      autoplay: false,
      autoplayInterval: 5000,
    };
  }

  const banners = content.items
    .filter((item) => item.is_active !== false)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((item, index) => ({
      id: item.key || `banner-${index + 1}`,
      title: item.title || '',
      subtitle: item.subtitle || '',
      description: item.description || '',
      button_label: item.button_label || '',
      image_url: item.image_url || undefined,
      image_url_mobile: item.mobile_image_url || item.image_url || undefined,
      video_url: item.video_url || undefined,
      media_type: item.media_type || (item.video_url ? 'video' : 'image'),
      link_url: item.link || undefined,
      name: item.title || item.image_alt || `banner ${index + 1}`,
      alt: item.image_alt || item.title || 'banner',
      sort_order: item.sort_order ?? index + 1,
    }));

  return {
    banners,
    autoplay: content.autoplay ?? true,
    autoplayInterval: content.autoplay_interval ?? 5000,
  };
};

export const mapCategoryShortcuts = (page?: PageRESP): CategoryShortcutView[] => {
  const section = findActiveSection(page, PAGE_SECTION_TYPE.CATEGORY_SHORTCUTS);
  const content = asContent<CategoryShortcutsContentRESP>(section);
  if (!content?.items?.length) return [];

  return content.items
    .filter((item) => item.link)
    .map((item) => ({
      type: item.type ?? CATEGORY_SHORTCUT_TYPE.NAVIGATE,
      icon: item.icon,
      label: item.label || '',
      link: item.link || '',
    }));
};

const mapRawProductToProductRESP = (
  item: Partial<CategoryShowcaseProductRESP & MallProductPreviewItemRESP & { name?: string }>,
  idx: number,
): ProductItemRESP => {
  const price =
    typeof item.selling_price === 'number'
      ? item.selling_price
      : typeof item.sale_price === 'number'
        ? item.sale_price
        : (item.price ?? 0);
  const supplyPrice =
    typeof item.supply_price === 'number'
      ? item.supply_price
      : typeof item.original_price === 'number'
        ? item.original_price
        : price;
  const discountRate =
    typeof item.discount_rate === 'number'
      ? item.discount_rate
      : supplyPrice > price && supplyPrice > 0
        ? Math.round(((supplyPrice - price) / supplyPrice) * 100)
        : 0;

  const rawLink = item.link || '';
  const cleanSlug =
    (rawLink ? rawLink.replace(/^\/?(mall\/)?products?\/?/, '').replace(/^\//, '') : '') ||
    item.product_code ||
    `product-${idx + 1}`;

  const title = item.title || item.name || '';

  return {
    id: typeof item.product_id === 'number' ? item.product_id : idx + 1,
    category_id: null,
    name: {
      ko: title,
      en: title,
    },
    slug: cleanSlug,
    link: rawLink || undefined,
    short_description: null,
    selling_price: price,
    supply_price: supplyPrice,
    sku: item.product_code || (typeof item.product_id === 'number' ? String(item.product_id) : `sku-${idx + 1}`),
    first_image: item.image_url || null,
    is_popular: Boolean(item.is_popular ?? item.badge === 'BEST'),
    is_featured: Boolean(item.is_featured ?? item.badge === 'NEW'),
    is_active: true,
    sort_order: idx + 1,
    has_discount: item.has_discount !== undefined ? item.has_discount : Boolean(discountRate > 0),
    discount_percentage: discountRate || null,
    average_rating: null,
    total_reviews: null,
    view_count: 0,
    stock_quantity: 100,
    min_quantity: 1,
    max_quantity: 999,
    has_option: false,
    visible_roles: null,
    created_at: '',
    updated_at: '',
    deleted_at: null,
    categories: [],
    price_content: item.price_content,
  };
};

const mapProductPreviewSection = (
  page?: PageRESP,
  sectionType: string | string[] = PAGE_SECTION_TYPE.PRODUCT_PREVIEW,
  defaultTitle = '',
): RecommendSectionView => {
  const types = Array.isArray(sectionType) ? sectionType : [sectionType];
  const section = findActiveSection(page, ...types);
  if (!section) {
    return {
      title: '',
      categories: [],
      categorySlugs: [],
      products: [],
    };
  }

  const content = asContent<MallProductPreviewContentRESP>(section);
  const categoriesMap = new Map<string, RecommendCategoryView>();

  (content?.categories || []).forEach((cat, index) => {
    const slug = cat.category_slug || cat.category_name || `cat-${index + 1}`;
    categoriesMap.set(slug, {
      id: slug,
      slug,
      label: cat.category_name || slug,
      imageUrl: cat.image_url,
      icon: cat.icon || null,
      link: cat.link,
      products: (cat.products || []).map((p, pIdx) => mapRawProductToProductRESP(p, pIdx)),
    });
  });

  (content?.items || []).forEach((item, index) => {
    const slug = item.slug || item.label || `item-${index + 1}`;
    const existing = categoriesMap.get(slug);
    if (existing) {
      if (!existing.label && item.label) existing.label = item.label;
      if (!existing.link && item.link) existing.link = item.link;
      if (!existing.imageUrl && item.image_url) existing.imageUrl = item.image_url;
      if (!existing.icon && item.icon) existing.icon = item.icon;
    } else {
      categoriesMap.set(slug, {
        id: slug,
        slug,
        label: item.label || slug,
        imageUrl: item.image_url,
        icon: item.icon || null,
        link: item.link,
        products: [],
      });
    }
  });

  const categorySlugs = content?.category_slugs || Array.from(categoriesMap.keys());
  const categories: RecommendCategoryView[] = [];
  categorySlugs.forEach((slug) => {
    const cat = categoriesMap.get(slug);
    if (cat) {
      categories.push(cat);
      categoriesMap.delete(slug);
    }
  });
  categories.push(...Array.from(categoriesMap.values()));

  return {
    title: section.title || defaultTitle,
    categories,
    categorySlugs,
    defaultCategorySlug: content?.category_slug || categories[0]?.slug || '',
    products: (content?.products || []).map((p, idx) => mapRawProductToProductRESP(p, idx)),
    viewAllLink: content?.view_all_link || section.link || undefined,
    viewAllLabel: content?.view_all_label || undefined,
  };
};

export const mapRecommendSection = (page?: PageRESP): RecommendSectionView =>
  mapProductPreviewSection(page, PAGE_SECTION_TYPE.PRODUCT_PREVIEW);

export const mapSteadySellerSection = (page?: PageRESP): SteadySellerSectionView =>
  mapProductPreviewSection(page, [PAGE_SECTION_TYPE.STEADY_SELLER, 'steady_seller'], 'STEADY SELLER');

export const mapInPressItems = (items?: MallInPressItemView[]): InPressCardItem[] => {
  if (!items?.length) return [];
  return items.map((item, idx) => ({
    id: item.id || idx + 1,
    image: item.imageUrl,
    category: item.category,
    title: item.title,
    subtitle: item.subtitle,
    date: item.date,
    link: item.link,
  }));
};

export const mapMallInPressSection = (page?: PageRESP): MallInPressSectionView => {
  const section = findActiveSection(
    page,
    PAGE_SECTION_TYPE.NOTICES_PREVIEW,
    PAGE_SECTION_TYPE.PORTFOLIO_PREVIEW,
    PAGE_SECTION_TYPE.PRESS_PREVIEW,
  );
  if (!section) {
    return {
      title: '',
      items: [],
    };
  }

  const portfolioContent = asContent<PortfolioPreviewContentRESP>(section);
  const pressContent = asContent<PressPreviewContentRESP>(section);

  const items: MallInPressItemView[] = [];

  if (section.section_type === PAGE_SECTION_TYPE.PORTFOLIO_PREVIEW) {
    portfolioContent?.items?.forEach((item, index) => {
      items.push({
        id: String(item.id || `portfolio-${index + 1}`),
        title: item.title || '',
        category: item.category || '',
        subtitle: item.description || '',
        imageUrl: item.cover_image || '',
        link: item.id ? getBrandMediaUrl(item.id) : '',
        date: item.created_at || '',
      });
    });
  } else {
    pressContent?.items?.forEach((item, index) => {
      const category = typeof item.category === 'object' ? item.category?.name : item.category;
      const subtitle = (item.description || item.subtitle || '')
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .trim();

      items.push({
        id: String(item.id || item.link_url || item.link || `press-${index + 1}`),
        title: item.title || '',
        category: category || '',
        subtitle,
        imageUrl: item.image_url || item.url || '',
        link: item.link_url || item.link || (item.id ? getBrandMediaUrl(item.id) : ''),
        date: item.published_at || item.created_at || '',
      });
    });
  }

  return {
    title: section.title || '',
    viewAllLink: portfolioContent?.view_all_link || pressContent?.view_all_link || section.link || undefined,
    viewAllLabel: portfolioContent?.view_all_label || pressContent?.view_all_label || undefined,
    items,
  };
};

export const mapPopularGroups = (categories?: PopularCategoryView[]): PopularGroupItem[] => {
  if (!categories?.length) return [];
  return categories.map((c, i) => ({
    id: c.slug || c.id || `${i + 1}`,
    slug: c.slug || c.id || `${i + 1}`,
    name: c.label || c.slug,
    image: c.imageUrl,
  }));
};

export const mapPopularItems = (products?: ShowcaseProductView[]): PopularCardItem[] => {
  if (!products?.length) return [];
  return products.map((p, idx) => ({
    id: p.id || `${idx + 1}`,
    name: p.title,
    sellingPrice: p.sellingPrice,
    supplyPrice: p.supplyPrice,
    priceContent: p.priceContent,
    image: p.imageUrl,
    link: p.link,
  }));
};

const mapShowcaseProducts = (products?: CategoryShowcaseProductRESP[]): ShowcaseProductView[] => {
  if (!products?.length) return [];
  return products.map((item, idx) => {
    const sellingPrice = item.selling_price ?? item.sale_price ?? item.price ?? 0;
    const supplyPrice = item.supply_price ?? item.original_price ?? sellingPrice;

    return {
      id: String(item.product_id || item.product_code || `showcase-${idx + 1}`),
      title: item.title || '',
      sellingPrice,
      supplyPrice,
      priceContent: item.price_content,
      imageUrl: item.image_url || '',
      link: item.link || '',
      productCode: item.product_code || '',
    };
  });
};

export const mapPopularSection = (page?: PageRESP): PopularSectionView => {
  const showcaseSection = findActiveSection(page, PAGE_SECTION_TYPE.CATEGORY_PRODUCT_SHOWCASE);
  const popSection = findActiveSection(page, PAGE_SECTION_TYPE.POPULAR_CATEGORIES);

  if (!showcaseSection && !popSection) {
    return {
      title: '',
      categories: [],
      showcaseTitle: '',
      showcaseBackground: '',
      showcaseProducts: [],
    };
  }

  const showcaseContent = asContent<CategoryProductShowcaseContentRESP>(showcaseSection);
  const popContent = asContent<PopularCategoriesContentRESP>(popSection);

  const categoriesMap = new Map<string, PopularCategoryView>();

  if (showcaseContent?.categories?.length) {
    showcaseContent.categories.forEach((cat, index) => {
      const slug = cat.category_slug || cat.category_name || `cat-${index + 1}`;
      const products = mapShowcaseProducts(cat.products);
      categoriesMap.set(slug, {
        id: slug,
        slug,
        label: cat.category_name || slug,
        imageUrl: cat.image_url || products[0]?.imageUrl || '',
        link: cat.link || `/mall/products/${encodeURIComponent(slug)}`,
        subtitle: cat.subtitle || undefined,
        products,
      });
    });
  }

  const itemsList = showcaseContent?.items || popContent?.items || [];
  itemsList.forEach((item, index) => {
    const slug = item.slug || item.label || `pop-${index + 1}`;
    const existing = categoriesMap.get(slug);
    if (existing) {
      if (!existing.imageUrl && item.image_url) {
        existing.imageUrl = item.image_url;
      }
      if (!existing.label && item.label) {
        existing.label = item.label;
      }
      if (!existing.link && item.link) {
        existing.link = item.link;
      }
    } else {
      categoriesMap.set(slug, {
        id: slug,
        slug,
        label: item.label || slug,
        imageUrl: item.image_url || '',
        link: item.link || `/mall/products/${encodeURIComponent(slug)}`,
        products: [],
      });
    }
  });

  const categories = Array.from(categoriesMap.values());

  const firstCategoryWithProducts = categories.find((c) => c.products.length > 0);
  const defaultCategorySlug =
    (showcaseContent?.category_slug &&
      categories.find((c) => c.slug === showcaseContent.category_slug && c.products.length > 0)?.slug) ||
    firstCategoryWithProducts?.slug ||
    showcaseContent?.category_slug ||
    categories[0]?.slug ||
    '';

  const defaultCategory = categories.find((c) => c.slug === defaultCategorySlug) || categories[0];
  const directProducts = mapShowcaseProducts(showcaseContent?.products);
  const showcaseProducts = directProducts.length ? directProducts : (defaultCategory?.products ?? []);

  return {
    title: showcaseSection?.title || popSection?.title || '',
    categories,
    showcaseTitle: defaultCategory?.label || showcaseSection?.title || '',
    showcaseBackground: showcaseContent?.background_image_url || showcaseSection?.image || '',
    showcaseProducts,
    defaultCategorySlug,
  };
};

export const mapCustomerCenter = (page?: PageRESP): CustomerCenterView => {
  const section = findActiveSection(page, PAGE_SECTION_TYPE.CUSTOMER_CENTER);
  if (!section) {
    return {
      title: '',
      phone: '',
      email: '',
      fax: '',
      businessHours: '',
      closedDays: '',
      lunchHours: '',
      emailDescription: '',
      inquiryItems: [],
    };
  }

  let phone = '';
  let email = '';
  let fax = '';
  let businessHours = '';
  let closedDays = '';
  let lunchHours = '';
  let emailDescription = '';
  const inquiryItems: CustomerCenterInquiryView[] = [];

  const rawContent = section.content;

  if (Array.isArray(rawContent)) {
    rawContent.forEach((item: any) => {
      const type = (item.type || '').toLowerCase();
      if (type === 'phone') {
        phone = item.text || phone;
        businessHours = item.textarea || businessHours;
      } else if (type === 'email') {
        email = item.text || email;
        emailDescription = item.textarea || emailDescription;
      } else if (type === 'fax') {
        fax = item.text || fax;
      } else {
        inquiryItems.push({
          type: item.type || '',
          label: item.text || '',
          value: item.textarea || '',
          textarea: item.textarea,
        });
      }
    });
  } else if (rawContent && typeof rawContent === 'object') {
    const obj = rawContent as Record<string, any>;
    phone = obj.phone || '';
    email = obj.email || '';
    fax = obj.fax || '';
    businessHours = obj.business_hours || '';
    closedDays = obj.closed_days || '';
    lunchHours = obj.lunch_hours || '';
    (obj.inquiry_items || []).forEach((item: any) => {
      inquiryItems.push({
        type: item.type || '',
        label: item.label || item.text || '',
        value: item.value || item.textarea || '',
      });
    });
  }

  return {
    title: section.title || '',
    phone,
    email,
    fax,
    businessHours,
    closedDays,
    lunchHours,
    emailDescription,
    inquiryItems,
  };
};

export const mapMallFaqSection = (page?: PageRESP): MallFaqSectionView => {
  const section = findActiveSection(page, PAGE_SECTION_TYPE.FAQ_SECTION);
  if (!section) {
    return {
      title: '',
      items: [],
    };
  }

  const content = asContent<MallFaqSectionContentRESP>(section);

  const rawItems = (content?.items || []).filter((item) => item.is_active !== false);

  let sortedItems = [...rawItems];
  if (content?.faq_ids?.length) {
    const idMap = new Map<number, (typeof rawItems)[number]>();
    rawItems.forEach((it) => {
      if (typeof it.id === 'number') idMap.set(it.id, it);
    });
    sortedItems = [];
    content.faq_ids.forEach((id) => {
      const found = idMap.get(id);
      if (found) {
        sortedItems.push(found);
        idMap.delete(id);
      }
    });
    sortedItems.push(...Array.from(idMap.values()));
  } else {
    sortedItems.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  }

  const items: MallFaqItemView[] = sortedItems.map((item, idx) => ({
    id: item.id || idx + 1,
    category: item.category || '',
    question: item.question || '',
    answer: item.answer || '',
    cleanAnswer: (item.answer || '')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .trim(),
    date: (item.created_at || item.updated_at || '').slice(0, 10).replace(/-/g, '.'),
    sortOrder: item.sort_order,
  }));

  return {
    title: section.title || 'FAQs',
    viewAllLabel: content?.view_all_label,
    items,
  };
};

export const mapHomeImageBanners = (page?: PageRESP): HomeBannerItem[] => {
  const section = findActiveSection(
    page,
    PAGE_SECTION_TYPE.SECONDARY_BANNER,
    'secondary_banner',
    'banner_section',
    'promo_banners',
    'image_banners',
    'home_banners',
  );
  if (!section) return [];
  const content = asContent<SecondaryBannerContentRESP>(section);
  if (!content?.items?.length) return [];
  return content.items
    .filter((it) => it.image || it.image_url)
    .map((it, idx) => ({
      id: (it as { id?: string | number }).id || it.name || `banner-${idx + 1}`,
      imageUrl: it.image || it.image_url || '',
      linkUrl: it.link || it.link_url || undefined,
      alt: it.name || it.title || it.alt || 'Secondary Banner',
    }));
};

export const mapFooterQuickLinksOrderMethodImage = (page?: PageRESP): string | undefined => {
  const section = findActiveSection(page, PAGE_SECTION_TYPE.FOOTER_QUICK_LINKS, 'footer_quick_links');
  if (!section) return undefined;

  const content = asContent<FooterQuickLinksContentRESP>(section);
  const orderMethodItem = content?.items?.find((item) => item?.field_name === 'order_method');
  return orderMethodItem?.image || undefined;
};
