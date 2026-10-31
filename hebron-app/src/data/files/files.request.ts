/** Shared attachment payload (inquiry, etc.) — NOT used by Notice. */
export type FileAttachmentREQ = {
  file_path: string;
  file_name: string;
  file_size: number;
  file_type: string;
};

/**
 * Notice attachment only (legacy BE shape).
 * Create/update Notice + Notice detail response use this format.
 */
export type NoticeAttachment = {
  key: string;
  name: string;
  url: string;
  size: number;
};

export const FILE_UPLOAD_FIELD = 'file';
export const FILE_TYPE_FIELD = 'type';
