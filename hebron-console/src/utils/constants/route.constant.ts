export const ROUTE_NAME = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  ADMINISTRATOR: '/administrator',
  OUTSOURCING: '/outsourcing',
  MEMBER: '/member',
  PRODUCT: '/products',
  CATEGORY: '/category',
  PAYMENT: '/payment',
  DELIVERY: '/delivery',
  CONTENT: '/content',
  INQUIRY: '/inquiry',
  ORDER: '/order',
  PERMISSION: '/permission',
  SYSTEM: '/system',
  MES: '/mes',
  HOME_PAGE_MANAGEMENT: '/homepage-management',
};

export const MY_ROUTE = {
  LOGIN: ROUTE_NAME.LOGIN,
  DASHBOARD: {
    INDEX: ROUTE_NAME.DASHBOARD + '/overview',
    STATISTICS: ROUTE_NAME.DASHBOARD + '/statistics',
  },

  ADMINISTRATOR: ROUTE_NAME.ADMINISTRATOR,
  OUTSOURCING: ROUTE_NAME.OUTSOURCING,

  MEMBER: {
    LIST: ROUTE_NAME.MEMBER + '/list',
    DETAIL: (id: string | number) => `${MY_ROUTE.MEMBER.LIST}/${id}`,
    APPROVAL: ROUTE_NAME.MEMBER + '/approval',
    MEMBERSHIP_LEVEL: ROUTE_NAME.MEMBER + '/membership-level',
  },

  PRODUCT: {
    LIST: ROUTE_NAME.PRODUCT + '/management',
    CREATE: ROUTE_NAME.PRODUCT + '/management/create',
    EDIT: (id: string | number) => ROUTE_NAME.PRODUCT + `/management/${id}/edit`,
    DETAIL: (id: string | number) => ROUTE_NAME.PRODUCT + `/management/${id}`,
    TEMPLATE_LIST: ROUTE_NAME.PRODUCT + '/templates',
    TEMPLATE_CREATE: ROUTE_NAME.PRODUCT + '/templates/create',
    TEMPLATE_DETAIL: (id: string | number) => ROUTE_NAME.PRODUCT + `/templates/${id}`,
    TEMPLATE_EDIT: (id: string | number) => ROUTE_NAME.PRODUCT + `/templates/${id}/edit`,
    BACKGROUND_LIST: ROUTE_NAME.PRODUCT + '/backgrounds',
    CALLIGRAPHY_LIST: ROUTE_NAME.PRODUCT + '/calligraphies',
    OPTION_LIST: ROUTE_NAME.PRODUCT + '/options',
    OPTION_DETAIL: (id: string | number) => `${ROUTE_NAME.PRODUCT}/options/${id}`,
    SHOPPING_SETTING: ROUTE_NAME.PRODUCT + '/shopping-setting',
  },

  CATEGORY: {
    INDEX: ROUTE_NAME.CATEGORY,
    DETAIL: (id: string | number) => `${ROUTE_NAME.CATEGORY}/${id}`,
  },

  PAYMENT: {
    LIST: ROUTE_NAME.PAYMENT + '/list',
    POST_LIMIT: ROUTE_NAME.PAYMENT + '/post-limit',
    SETTLEMENT: ROUTE_NAME.PAYMENT + '/settlement',
  },

  DELIVERY: {
    SHIPPING: ROUTE_NAME.DELIVERY + '/shipping',
  },

  CONTENT: {
    BANNER: ROUTE_NAME.CONTENT + '/banner',
    POPUP: ROUTE_NAME.CONTENT + '/popup',
    NOTICE: ROUTE_NAME.CONTENT + '/notice',
    GUIDE: ROUTE_NAME.CONTENT + '/guide',
    UPLOADED_IMAGE: ROUTE_NAME.CONTENT + '/uploaded-image',
    FAQ: ROUTE_NAME.CONTENT + '/faq',
    CTA: ROUTE_NAME.CONTENT + '/cta',
    CRAFTSMANSHIP: ROUTE_NAME.CONTENT + '/craftsmanship',
    MEDIA: ROUTE_NAME.CONTENT + '/media',
    SAMPLE: ROUTE_NAME.CONTENT + '/sample',
  },

  HOME_PAGE_MANAGEMENT: {
    MALL: ROUTE_NAME.HOME_PAGE_MANAGEMENT + '/mall',
    BRAND: ROUTE_NAME.HOME_PAGE_MANAGEMENT + '/brand',
    BRAND_HOME: ROUTE_NAME.HOME_PAGE_MANAGEMENT + '/brand/home',
    BRAND_STORY: ROUTE_NAME.HOME_PAGE_MANAGEMENT + '/brand/brand-story',
    BRAND_PRODUCTS: ROUTE_NAME.HOME_PAGE_MANAGEMENT + '/brand/standard-products',
    BRAND_PROCESS: ROUTE_NAME.HOME_PAGE_MANAGEMENT + '/brand/process',
    BRAND_MEDIA: ROUTE_NAME.HOME_PAGE_MANAGEMENT + '/brand/media',
    BRAND_CONTACT: ROUTE_NAME.HOME_PAGE_MANAGEMENT + '/brand/contact-us',
    BRAND_PORTFOLIO: ROUTE_NAME.HOME_PAGE_MANAGEMENT + '/brand/portfolio',
    BRAND_INQUIRY: ROUTE_NAME.HOME_PAGE_MANAGEMENT + '/brand/production-inquiry',
    VENDOR: ROUTE_NAME.HOME_PAGE_MANAGEMENT + '/vendor',
  },

  PORTFOLIO: ROUTE_NAME.CONTENT + '/portfolio',

  INQUIRY: {
    LIST: ROUTE_NAME.INQUIRY,
    DETAIL: (id: string | number) => `${ROUTE_NAME.INQUIRY}/${id}`,
  },

  ORDER: {
    LIST: ROUTE_NAME.ORDER,
    DETAIL: (id: string | number) => `${ROUTE_NAME.ORDER}/${id}`,
  },

  PERMISSION: ROUTE_NAME.PERMISSION,

  SYSTEM: {
    CONNECTION_LOG: ROUTE_NAME.SYSTEM + '/connection-log',
    OPERATION_LOG: ROUTE_NAME.SYSTEM + '/operation-log',
    EMAIL_SETTINGS: ROUTE_NAME.SYSTEM + '/email-settings',
    BANK_ACCOUNT_SETTINGS: ROUTE_NAME.SYSTEM + '/bank-account-settings',
  },

  MES_MONITORING: ROUTE_NAME.MES,
};

export const DEFAULT_ROUTE = MY_ROUTE.LOGIN;
