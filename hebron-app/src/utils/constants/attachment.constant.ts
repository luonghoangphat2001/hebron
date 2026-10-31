/** Shared attachment limits — used by all AppFileDropzone / FormFileDropzone forms. */
export const ATTACHMENT_MAX_FILES = 3;

export const ATTACHMENT_MAX_SIZE_MB = 5;

export const ATTACHMENT_MAX_SIZE_BYTES = ATTACHMENT_MAX_SIZE_MB * 1024 * 1024;

/** JPG / PNG / HEIC / PDF */
export const ATTACHMENT_ACCEPT =
  'image/jpeg,image/jpg,image/png,image/heic,image/heif,application/pdf,.jpeg,.jpg,.png,.heic,.heif,.pdf';

export const ATTACHMENT_ACCEPT_LABEL = `JPG, PNG, HEIC, PDF (최대 ${ATTACHMENT_MAX_SIZE_MB}MB)`;
