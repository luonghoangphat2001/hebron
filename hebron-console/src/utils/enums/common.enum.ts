export * from './homepage.enum';

export enum TargetSite {
  SHOPPING_SITE = 'SHOPPING_SITE',
  BRAND_SITE = 'BRAND_SITE',
  VENDOR_SITE = 'VENDOR_SITE',
}

export enum ExposureStatus {
  EXPOSED = 'exposed',
  NON_EXPOSED = 'non-exposed',
}

export enum PostingStatus {
  EXPOSED = 'exposed',
  NON_EXPOSED = 'non-exposed',
}

export enum Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum LogAction {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  DELETED = 'DELETED',
}

export enum MemberType {
  INDIVIDUAL = 'individual',
  BUSINESS = 'business',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

// Shared across every "Export Excel" feature in the app (list export scope).
export enum ExportType {
  ALL = 'ALL',
  CURRENT_PAGE = 'CURRENT_PAGE',
  SELECTED = 'SELECTED',
}

// Best-guess values for the export-history job status — adjust once confirmed against the backend.
export enum ExportStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum ExportFileName {
  ORDER = '주문목록',
  MEMBER = '회원목록',
  SHIPMENT = '배송목록',
  INQUIRY = '1대1문의목록',
  OPERATION_LOG = '작업로그목록',
  OPTION_GROUP = '옵션그룹목록',
  PRODUCT = '제품목록',
  PAYMENT = '결제내역목록',
  SETTLEMENT = '정산보고서',
  CUSTOMER_STATISTICS = '고객통계',
  ORDER_STATISTICS = '주문통계',
  PRODUCT_STATISTICS = '상품통계',
}

export enum DesignRevisionStatus {
  PENDING = 'pending',
  MODIFY = 'modify',
  APPROVE = 'approve',
}
