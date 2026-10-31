export type VendorProductDetailREQ = {
  slug: string;
};

export const VENDOR_CATALOG_PAGE_SIZE = 12;
export const VENDOR_CATALOG_PAGE_SIZE_OPTIONS = [VENDOR_CATALOG_PAGE_SIZE, 20, 50] as const;
