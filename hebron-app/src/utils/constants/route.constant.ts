export const BRAND_ROUTE = {
  HOME: '/',
  BRAND_PAGE: '/brand-page',
  PRODUCTS: '/products',
  PRODUCTS_DETAIL: '/products/:productSlug',
  PROCESS: '/process',
  PORTFOLIO: '/portfolio',
  PORTFOLIO_DETAIL: '/portfolio/:id',
  MEDIA: '/media',
  MEDIA_DETAIL: '/media/:id',
  FAQ: '/faq',
  CONTACT: '/contact-us',
  PRODUCT_INQUIRY: '/product-inquiry',
} as const;

export const VENDOR_ROUTE = {
  HOME: '/',
  SEARCH: '/search',
  PRODUCT_DETAIL: '/products/:productSlug',
  CATEGORY_PRODUCTS: '/products/category/:categorySlug',
  PRODUCT_INQUIRY: '/product-inquiry',
};

export const getVendorProductDetailPath = (productSlug: string) =>
  VENDOR_ROUTE.PRODUCT_DETAIL.replace(':productSlug', encodeURIComponent(productSlug));

export const getVendorCategoryProductsPath = (categorySlug: string) =>
  VENDOR_ROUTE.CATEGORY_PRODUCTS.replace(':categorySlug', encodeURIComponent(categorySlug));

export const getBrandProductsPath = () => BRAND_ROUTE.PRODUCTS;
export const getBrandProductInquiryPath = () => BRAND_ROUTE.PRODUCT_INQUIRY;
export const getBrandProductDetailPath = (slugOrId: string | number) => `${BRAND_ROUTE.PRODUCTS}/${slugOrId}`;
export const getBrandPortfolioDetailPath = (id: string | number) => `${BRAND_ROUTE.PORTFOLIO}/${id}`;
export const getBrandMediaDetailPath = (id: string | number) => `${BRAND_ROUTE.MEDIA}/${id}`;

export const ROUTE_NAME = {
  HOME: '/',
  SEARCH: '/search',
  LOGIN: '/login',
  REGISTER: '/register',
  ORDER_INQUIRY: '/order-inquiry',
  TERMS: '/terms',
  PRIVACY_POLICY: '/privacy-policy',
  MY_PAGE: '/my-page',
  PRODUCT: '/product',
  CHECKOUT: '/checkout',
  CART: '/cart',
  CANVAS_EDITOR: '/canvas-editor',
  SOCIAL_CALLBACK: '/oauth2/callback',
  CONFIRM_DESIGN: '/confirm-design',
  EXAMPLE_SAMPLES: '/example-samples',
};

const COMPACT_MAIN_PAGE_EXACT_PATHS = new Set<string>([
  ROUTE_NAME.LOGIN,
  ROUTE_NAME.REGISTER,
  ROUTE_NAME.ORDER_INQUIRY,
  ROUTE_NAME.TERMS,
  ROUTE_NAME.PRIVACY_POLICY,
]);

export const isCompactMainPagePath = (pathname: string) =>
  pathname.startsWith(ROUTE_NAME.MY_PAGE) ||
  pathname.startsWith(ROUTE_NAME.CHECKOUT) ||
  pathname.startsWith(ROUTE_NAME.SEARCH) ||
  pathname.startsWith(ROUTE_NAME.SOCIAL_CALLBACK) ||
  pathname.startsWith(ROUTE_NAME.CONFIRM_DESIGN) ||
  COMPACT_MAIN_PAGE_EXACT_PATHS.has(pathname);

export const MY_ROUTE = {
  HOME: ROUTE_NAME.HOME,
  SEARCH: ROUTE_NAME.SEARCH,
  LOGIN: ROUTE_NAME.LOGIN,
  REGISTER: ROUTE_NAME.REGISTER,
  ORDER_INQUIRY: ROUTE_NAME.ORDER_INQUIRY,
  TERMS: ROUTE_NAME.TERMS,
  PRIVACY_POLICY: ROUTE_NAME.PRIVACY_POLICY,
  MY_PAGE: {
    HOME: ROUTE_NAME.MY_PAGE,
    INFO: 'info',
    ORDERS: 'orders',
    ORDER_DETAIL: ':orderId',
    ADDRESSES: 'addresses',
    ADDRESS_CREATE: 'new',
    ADDRESS_EDIT: ':addressId/edit',
    POINTS: 'points',
    FAQ: 'faq',
    NOTICE: 'notice',
    NOTICE_DETAIL: ':noticeId',
    QUOTE: 'quote',
    QUOTE_CREATE: 'new',
    QUOTE_EDIT: ':quoteId/edit',
    QUOTE_DETAIL: ':quoteId',
    SHIPPING_INQUIRY: 'shipping-inquiry',
    SHIPPING_INQUIRY_CREATE: 'new',
    SHIPPING_INQUIRY_EDIT: ':inquiryId/edit',
    SHIPPING_INQUIRY_DETAIL: ':inquiryId',
    REWORK_REQUEST: 'rework-request',
    REWORK_REQUEST_CREATE: 'new',
    REWORK_REQUEST_EDIT: ':requestId/edit',
    REWORK_REQUEST_DETAIL: ':requestId',
  },
  PRODUCT_LIST: ROUTE_NAME.PRODUCT,
  PRODUCT_LIST_BY_CATEGORY: `${ROUTE_NAME.PRODUCT}/category/:categorySlug`,
  PRODUCT_DETAIL: `${ROUTE_NAME.PRODUCT}/:productSlug`,
  CART: ROUTE_NAME.CART,
  CHECKOUT: ROUTE_NAME.CHECKOUT,
  CHECKOUT_SUCCESS: `${ROUTE_NAME.CHECKOUT}/success`,
  CHECKOUT_FAIL: `${ROUTE_NAME.CHECKOUT}/fail`,
  CHECKOUT_RESULT: `${ROUTE_NAME.CHECKOUT}/result`,
  SOCIAL_CALLBACK: `${ROUTE_NAME.SOCIAL_CALLBACK}/:provider`,
  CONFIRM_DESIGN: `${ROUTE_NAME.CONFIRM_DESIGN}/:slug`,
  EXAMPLE_SAMPLES: ROUTE_NAME.EXAMPLE_SAMPLES,
  EXAMPLE_SAMPLE_DETAIL: `${ROUTE_NAME.EXAMPLE_SAMPLES}/:id`,
};

export const getExampleSampleDetailPath = (id: number) => `${ROUTE_NAME.EXAMPLE_SAMPLES}/${id}`;

export const getMyPageOrdersPath = () => `${ROUTE_NAME.MY_PAGE}/${MY_ROUTE.MY_PAGE.ORDERS}`;
export const getMyPageFaqPath = () => `${ROUTE_NAME.MY_PAGE}/${MY_ROUTE.MY_PAGE.FAQ}`;
export const getMyPageNoticePath = () => `${ROUTE_NAME.MY_PAGE}/${MY_ROUTE.MY_PAGE.NOTICE}`;
export const getMyPageQuotePath = () => `${ROUTE_NAME.MY_PAGE}/${MY_ROUTE.MY_PAGE.QUOTE}`;
export const getMyPageQuoteCreatePath = () => `${ROUTE_NAME.MY_PAGE}/${MY_ROUTE.MY_PAGE.QUOTE}/${MY_ROUTE.MY_PAGE.QUOTE_CREATE}`;
export const getMyPageQuoteDetailPath = (quoteId: string) => `${ROUTE_NAME.MY_PAGE}/${MY_ROUTE.MY_PAGE.QUOTE}/${quoteId}`;
export const getMyPageQuoteEditPath = (quoteId: string) => `${ROUTE_NAME.MY_PAGE}/${MY_ROUTE.MY_PAGE.QUOTE}/${quoteId}/edit`;

export const getMyPageShippingInquiryPath = () => `${ROUTE_NAME.MY_PAGE}/${MY_ROUTE.MY_PAGE.SHIPPING_INQUIRY}`;
export const getMyPageShippingInquiryCreatePath = () =>
  `${ROUTE_NAME.MY_PAGE}/${MY_ROUTE.MY_PAGE.SHIPPING_INQUIRY}/${MY_ROUTE.MY_PAGE.SHIPPING_INQUIRY_CREATE}`;
export const getMyPageShippingInquiryEditPath = (inquiryId: string) =>
  `${ROUTE_NAME.MY_PAGE}/${MY_ROUTE.MY_PAGE.SHIPPING_INQUIRY}/${inquiryId}/edit`;
export const getMyPageShippingInquiryDetailPath = (inquiryId: string) =>
  `${ROUTE_NAME.MY_PAGE}/${MY_ROUTE.MY_PAGE.SHIPPING_INQUIRY}/${inquiryId}`;

export const getMyPageReworkRequestPath = () => `${ROUTE_NAME.MY_PAGE}/${MY_ROUTE.MY_PAGE.REWORK_REQUEST}`;
export const getMyPageReworkRequestCreatePath = () =>
  `${ROUTE_NAME.MY_PAGE}/${MY_ROUTE.MY_PAGE.REWORK_REQUEST}/${MY_ROUTE.MY_PAGE.REWORK_REQUEST_CREATE}`;
export const getMyPageReworkRequestEditPath = (requestId: string) =>
  `${ROUTE_NAME.MY_PAGE}/${MY_ROUTE.MY_PAGE.REWORK_REQUEST}/${requestId}/edit`;
export const getMyPageReworkRequestDetailPath = (requestId: string) =>
  `${ROUTE_NAME.MY_PAGE}/${MY_ROUTE.MY_PAGE.REWORK_REQUEST}/${requestId}`;

export const getMyPageOrderDetailPath = (orderId: string) => `${ROUTE_NAME.MY_PAGE}/${MY_ROUTE.MY_PAGE.ORDERS}/${orderId}`;

export const getMyPageAddressesPath = () => `${ROUTE_NAME.MY_PAGE}/${MY_ROUTE.MY_PAGE.ADDRESSES}`;
export const getMyPageAddressCreatePath = () =>
  `${ROUTE_NAME.MY_PAGE}/${MY_ROUTE.MY_PAGE.ADDRESSES}/${MY_ROUTE.MY_PAGE.ADDRESS_CREATE}`;
export const getMyPageAddressEditPath = (addressId: string) =>
  `${ROUTE_NAME.MY_PAGE}/${MY_ROUTE.MY_PAGE.ADDRESSES}/${addressId}/edit`;

export const getMyPageNoticeDetailPath = (noticeId: string) => `${ROUTE_NAME.MY_PAGE}/${MY_ROUTE.MY_PAGE.NOTICE}/${noticeId}`;

export const getProductDetailPath = (productSlug: string) => {
  const cleanSlug = (productSlug || '')
    .trim()
    .replace(/^\/?(mall\/)?products?\/?/, '')
    .replace(/^\//, '');
  return `${MY_ROUTE.PRODUCT_LIST}/${cleanSlug}`;
};
export const getProductListByCategoryPath = (categorySlug: string) => {
  const cleanSlug = (categorySlug || '')
    .trim()
    .replace(/^\/?(mall\/)?category\/?/, '')
    .replace(/^\/?(product\/)?category\/?/, '')
    .replace(/^\/?(mall\/)?products?\/?/, '')
    .replace(/^\//, '');
  return `${ROUTE_NAME.PRODUCT}/category/${cleanSlug || categorySlug}`;
};

export const getSocialCallbackUrl = (provider: string) => `${ROUTE_NAME.SOCIAL_CALLBACK}/${provider}`;
export const getConfirmDesignUrl = (slug: string) => `${ROUTE_NAME.CONFIRM_DESIGN}/${slug}`;

export const MALL_URL = `https://${import.meta.env.VITE_MALL_HOST}`;

export const MALL_ROUTE = {
  HOME: MALL_URL,
  PRODUCT: `${MALL_URL}/product`,
} as const;

export const getMallProductDetailPath = (slugOrId: string) => `${MALL_ROUTE.PRODUCT}/${slugOrId}`;

export const DEFAULT_ROUTE = MY_ROUTE.HOME;
