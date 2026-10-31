import {
  VENDOR_PAGE_SECTION_TYPE,
  type VendorHeroItemRESP,
  type VendorHeroSectionContentRESP,
  type VendorPageRESP,
  type VendorPageSectionRESP,
  type VendorProductCatalogContentRESP,
} from '../vendor-pages/vendor-pages.response';

export type VendorBannerItemView = {
  id: number;
  image: string;
  alt: string;
};

export type VendorHeroSectionView = {
  banners: VendorBannerItemView[];
  autoplay: boolean;
};

export const findVendorSection = (page?: VendorPageRESP, ...types: string[]): VendorPageSectionRESP | undefined => {
  if (!page?.sections?.length) return undefined;
  return page.sections.find((section) => section.is_active !== false && types.includes(section.section_type));
};

export const mapVendorHeroBanners = (content?: VendorHeroSectionContentRESP | null): VendorBannerItemView[] => {
  if (!content?.items?.length) return [];
  return content.items
    .filter((item: VendorHeroItemRESP) => item.is_active !== false)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((item) => ({
      id: item.sort_order,
      image: item.image_url,
      alt: item.alt || item.title || 'banner',
    }));
};

export const mapVendorHeroSection = (page?: VendorPageRESP): VendorHeroSectionView => {
  const section = findVendorSection(page, VENDOR_PAGE_SECTION_TYPE.HERO_SECTION);
  const content = (
    section?.content && typeof section.content === 'object' ? section.content : null
  ) as VendorHeroSectionContentRESP | null;
  return {
    banners: mapVendorHeroBanners(content),
    autoplay: content?.autoplay ?? true,
  };
};

export const mapVendorCatalogSection = (page?: VendorPageRESP): VendorProductCatalogContentRESP | undefined => {
  const section = findVendorSection(page, VENDOR_PAGE_SECTION_TYPE.PRODUCT_CATALOG);
  return (section?.content && typeof section.content === 'object' ? section.content : undefined) as
    | VendorProductCatalogContentRESP
    | undefined;
};
