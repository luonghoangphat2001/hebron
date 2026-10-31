import { api } from '@/api';
import type { FileType } from '@/utils/enums/file.enum';
import type { BaseRESP, PaginationRESP } from '@/utils/types/response.type';
import type { FileUploadedREQ } from './file.request';
import { FILE_TYPE_FIELD, FILE_UPLOAD_FIELD } from './file.request';
import type { FileRESP, FileUploadRESP } from './file.response';
import type { UploadedImageListRESP } from './file.response';

export const FILE_UPLOAD_ENDPOINT = '/admin/files';
const FILE_UPLOAD_TIMEOUT_MS = 60_000;

export const uploadFileAPI = (file: File, type: FileType): Promise<BaseRESP<FileUploadRESP>> => {
  const formData = new FormData();
  formData.append(FILE_UPLOAD_FIELD, file);
  formData.append(FILE_TYPE_FIELD, type);

  return api.post(FILE_UPLOAD_ENDPOINT, formData, { timeout: FILE_UPLOAD_TIMEOUT_MS });
};

export const getUploadedImageDetailAPI = (id: number): Promise<BaseRESP<FileRESP>> => api.get(`${FILE_UPLOAD_ENDPOINT}/${id}`);

export const getUploadedImageListAPI = (params: FileUploadedREQ): Promise<PaginationRESP<UploadedImageListRESP>> => {
  return api.get(FILE_UPLOAD_ENDPOINT, { params });
};
