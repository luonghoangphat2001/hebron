import type { ConfirmDesignStatus } from '@/utils/enums/common.enum';

export type ConfirmDesignREQ = {
  slug: string;
  status: ConfirmDesignStatus;
  comment?: string;
};
