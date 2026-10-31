import type { BrandProductionInquiryRESP } from '@/data/brand-production-inquiry/brand-production-inquiry.response';

export type BrandContactUsRESP = Omit<BrandProductionInquiryRESP, 'quantity_type' | 'budget_type' | 'deadline'>;

export type BrandContactUsCreateRESP = {
  inquiry: BrandContactUsRESP;
};
