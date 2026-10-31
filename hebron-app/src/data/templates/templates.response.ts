import type { Template } from '@/utils/types/design.response';
import type { Pagination } from '@/utils/types/response.type';

export type TemplatePublicRESP = Template;

export type GetTemplatesRESP = {
  templates: TemplatePublicRESP[];
  pagination: Required<Pagination>;
};

export type GetTemplateDetailRESP = {
  template: TemplatePublicRESP;
};
