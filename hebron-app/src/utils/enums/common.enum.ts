export enum MemberType {
  INDIVIDUAL = 'individual',
  BUSINESS = 'business',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BLOCKED = 'blocked',
  WITHDRAWN = 'withdrawn',
}

export enum UserAuthority {
  SUPER_ADMIN = 'super_admin',
  STORE_ADMIN = 'store_admin',
  NORMAL_USER = 'normal_user',
}

export enum VerifyCodeType {
  EMAIL = 'email',
  MOBILE = 'mobile',
  BUSINESS = 'business',
}

export enum VerifyCodePurpose {
  REGISTER = 'register',
  FIND_ID = 'find_id',
  FIND_USERNAME = 'find_username',
  RESET_PASSWORD = 'reset_password',
  CHANGE_PHONE = 'change_phone',
}

export enum SearchParams {
  SEARCH = 'search',
  PARENT_CATEGORY = 'parent_category',
  PAGE = 'page',
  PER_PAGE = 'per_page',
}

export enum ActiveStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum SiteType {
  SHOPPING_MALL = 'SHOPPING_MALL',
  BRAND_SITE = 'BRAND_SITE',
  PLAIN_SITE = 'PLAIN_SITE',
}

export enum SocialProvider {
  KAKAO = 'kakao',
  NAVER = 'naver',
}

export enum ConfirmDesignStatus {
  PENDING = 'pending',
  MODIFY = 'modify',
  APPROVE = 'approve',
}

export enum ExportType {
  ALL = 'ALL',
  CURRENT_PAGE = 'CURRENT_PAGE',
}

export enum ExportStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}
