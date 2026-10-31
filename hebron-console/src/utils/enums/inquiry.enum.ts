export enum InquiryType {
  QUOTE = 'quote',
  SHIPPING = 'shipping',
  REWORK = 'rework',
  CONTACT_US = 'contact_us',
}

export enum InquiryStatus {
  PENDING = 'pending',
  RESPONDED = 'responded',
}

export enum SendVia {
  EMAIL = 'EMAIL',
  KAKAO_TALK = 'KAKAO_TALK',
}

export enum InquirySortBy {
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
  INQUIRY_TYPE = 'inquiry_type',
  STATUS = 'status',
  CUSTOMER_NAME = 'customer_name',
}
