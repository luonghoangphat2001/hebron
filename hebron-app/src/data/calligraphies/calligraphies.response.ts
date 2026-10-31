import type { CalligraphyType } from './calligraphies.request';

export type CalligraphyRESP = {
  id: number;
  image_path: string;
  image_url: string;
  type: CalligraphyType;
  type_label: string;
  text: string | null;
};

export type GetCalligraphiesRESP = {
  calligraphies: CalligraphyRESP[];
};
