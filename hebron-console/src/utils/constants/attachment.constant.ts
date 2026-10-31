export const DEFAULT_ATTACHMENT_MAX_SIZE_MB = 5;

/** Default accept: images only. */
export const DEFAULT_ATTACHMENT_ACCEPT = 'image/jpeg,image/jpg,image/png,image/webp,image/gif,.jpeg,.jpg,.png,.webp,.gif';

/** Notice attachments: PDF / JPEG / PNG, max 5MB. */
export const NOTICE_ATTACHMENT_ACCEPT = '.pdf,.jpeg,.jpg,.png,application/pdf,image/jpeg,image/png';

/** Guide content attachments: PDF / JPEG / PNG, max 5MB. */
export const GUIDE_ATTACHMENT_ACCEPT = '.pdf,.jpeg,.jpg,.png,application/pdf,image/jpeg,image/png';

/** Product images: JPEG / JPG / PNG / WEBP, max 5MB each, max 5 files. */
export const PRODUCT_IMAGE_ACCEPT = '.jpeg,.jpg,.png,.webp,image/jpeg,image/jpg,image/png,image/webp';
export const PRODUCT_IMAGE_MAX_COUNT = 5;

/** Product draft/design file: one Adobe Illustrator (.ai) file, max 5MB. */
export const PRODUCT_AI_ACCEPT = '.ai';
export const PRODUCT_AI_MAX_SIZE_MB = 5;

/** Business registration file: PDF / JPG / JPEG / PNG, max 10MB. */
export const BUSINESS_REG_ATTACHMENT_ACCEPT = '.pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/jpg,image/png';
export const BUSINESS_REG_MAX_SIZE_MB = 10;
