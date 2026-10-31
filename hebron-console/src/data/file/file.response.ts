import type { FileType } from '@/utils/enums/file.enum';

export type FileCreatorRESP = {
  id: number;
  name: string;
};

export type FileRESP = {
  id: number;
  name: string;
  path: string;
  url: string;
  type: FileType;
  mime_type: string;
  size: number;
  created_by: FileCreatorRESP;
  created_at: string;
  updated_at: string;
};

export type FileUploadRESP = {
  file: FileRESP;
};

export type UploadedImageListRESP = {
  files: FileRESP[];
};
