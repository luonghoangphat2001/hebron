import { api } from '@/api';
import type { BaseRESP } from '@/utils/types/response.type';
import type { DesignCreateREQ, DesignUpdateREQ } from './design.request';
import type { DesignCreateRESP, DesignDetailRESP } from './design.response';

const ENDPOINT = {
  ROOT: '/designs',
  HISTORY: '/mypage/designs',
};

export const DesignAPI = {
  create: (body: DesignCreateREQ): Promise<BaseRESP<DesignCreateRESP>> => api.post(ENDPOINT.ROOT, body),
  update: (body: DesignUpdateREQ): Promise<BaseRESP<DesignCreateRESP>> => api.put(`${ENDPOINT.ROOT}/${body.id}`, body),
  detail: (designId: number): Promise<BaseRESP<DesignDetailRESP>> => api.get(`${ENDPOINT.ROOT}/${designId}`),
  downloadPrintPdf: (designId: number): Promise<Blob> =>
    api.get(`${ENDPOINT.ROOT}/${designId}/export-pdf`, { responseType: 'blob' }) as Promise<Blob>,
  uploadPrintPdf: (designId: number, revision: string, blob: Blob): Promise<BaseRESP<DesignCreateRESP>> => {
    const body = new FormData();
    body.append('file', blob, 'print.pdf');
    body.append('design_revision', revision);
    return api.post(`${ENDPOINT.ROOT}/${designId}/print-pdf`, body);
  },
};
