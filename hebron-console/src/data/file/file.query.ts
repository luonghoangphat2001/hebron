import type { BaseRESP, ErrorRESP, PaginationRESP } from '@/utils/types/response.type';
import { useMutation, useQuery, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { getUploadedImageDetailAPI, getUploadedImageListAPI, uploadFileAPI } from './file.api';
import type { FileUploadedREQ, FileUploadREQ } from './file.request';
import type { FileUploadRESP, UploadedImageListRESP } from './file.response';

export const FILE_QUERY_KEYS = {
  UPLOADED_IMAGE_LIST: 'FILE_LIST',
  DETAIL: 'FILE_DETAIL',
};

export const useUploadFileMutation = (
  options?: UseMutationOptions<BaseRESP<FileUploadRESP>, AxiosError<ErrorRESP>, FileUploadREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (req: FileUploadREQ) => uploadFileAPI(req.file, req.type),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [FILE_QUERY_KEYS.UPLOADED_IMAGE_LIST] });
      options?.onSuccess?.(...args);
    },
  });
};

export const useUploadedImageDetailQuery = (id?: number | null) =>
  useQuery({
    queryKey: [FILE_QUERY_KEYS.DETAIL, id],
    queryFn: () => getUploadedImageDetailAPI(id as number),
    select: (resp) => resp.data,
    enabled: !!id,
  });

export const useUploadedImageListQuery = (params: FileUploadedREQ) =>
  useQuery({
    queryKey: [FILE_QUERY_KEYS.UPLOADED_IMAGE_LIST, params],
    queryFn: () => getUploadedImageListAPI(params),
    select: (resp: PaginationRESP<UploadedImageListRESP>) => ({
      list: resp.data.files,
      pagination: resp.pagination,
    }),
  });
