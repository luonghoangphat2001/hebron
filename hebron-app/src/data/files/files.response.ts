import type { FileType } from '@/utils/enums/file.enum';
import type { FileAttachmentREQ } from './files.request';

export type FileCreatorRESP = {
  id: number;
  name: string;
};

/** Upload API (`POST /files`) response file object. */
export type FileRESP = {
  id: number;
  name: string;
  path: string;
  url: string;
  type: FileType;
  mime_type: string;
  size: number;
  created_by: FileCreatorRESP | null;
  created_at: string;
  updated_at: string;
};

export type FileUploadRESP = {
  file: FileRESP;
};

/** Entity attachment (inquiry, …) — same 4 fields as REQ + file_url. Not for Notice. */
export type FileAttachmentRESP = FileAttachmentREQ & {
  id?: number;
  file_url: string;
};
