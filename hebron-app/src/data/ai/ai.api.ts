import { api } from '@/api';
import type { BaseRESP } from '@/utils/types/response.type';

export type GeneratePlaqueTextREQ = {
  situation: string;
  receiver: string;
  message: string;
  date: string;
  sender: string;
};

export type GeneratedPlaqueText = {
  title: string;
  message: string;
  style?: string;
  recipient?: string;
  date?: string;
  sender?: string;
};

export type GeneratePlaqueTextRESP = {
  items: GeneratedPlaqueText[];
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
};

const normalizeDate = (date: string) => {
  const match = date.trim().match(/^(\d{4})[.]([0-1]\d)[.]([0-3]\d)$/);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : date;
};

export const AIAPI = {
  generatePlaqueText: (body: GeneratePlaqueTextREQ): Promise<BaseRESP<GeneratePlaqueTextRESP>> =>
    api.post('/ai/generate', { ...body, date: normalizeDate(body.date) }),
};
