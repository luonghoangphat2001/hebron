import { api } from '@/api';
import type { FileType } from '@/utils/enums/file.enum';
import type { BaseRESP } from '@/utils/types/response.type';
import { FILE_TYPE_FIELD, FILE_UPLOAD_FIELD } from './files.request';
import type { FileUploadRESP } from './files.response';

export const FILE_UPLOAD_ENDPOINT = '/files';

export const uploadFileAPI = (file: File, type: FileType): Promise<BaseRESP<FileUploadRESP>> => {
  const formData = new FormData();
  formData.append(FILE_UPLOAD_FIELD, file);
  formData.append(FILE_TYPE_FIELD, type);

  return api.post(FILE_UPLOAD_ENDPOINT, formData);
};
