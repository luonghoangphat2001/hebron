import type { QuoteStatus } from '@/utils/enums/quote.enum';

export type QuoteItem = {
  id: string;
  createdAt: string;
  category: string;
  title: string;
  managerName: string;
  phone: string;
  status: QuoteStatus;
  isNew?: boolean;
};
