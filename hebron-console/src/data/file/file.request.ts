import type { SortOrder } from '@/utils/enums/common.enum';
import type { FileType, FileUploadedSortBy } from '@/utils/enums/file.enum';
import type { PaginationREQ } from '@/utils/types/request.type';

export const FILE_UPLOAD_FIELD = 'file';
export const FILE_TYPE_FIELD = 'type';

export type FileUploadREQ = {
  file: File;
  type: FileType;
};

export type FileUploadedREQ = PaginationREQ & {
  created_by?: number | null;
  name?: string | null;
  type?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  sort_by?: FileUploadedSortBy | null;
  sort_order?: SortOrder | null;
};
