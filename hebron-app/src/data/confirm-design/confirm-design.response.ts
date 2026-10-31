import type { ConfirmDesignStatus } from '@/utils/enums/common.enum';

export type ConfirmDesignInfo = {
  slug: string;
  status: ConfirmDesignStatus;
  files: {
    url: string;
    name: string;
    size: number;
  }[];
  comments: string[];
  created_at: string;
};

export type ConfirmDesignRESP = {
  design_revision: ConfirmDesignInfo;
};
