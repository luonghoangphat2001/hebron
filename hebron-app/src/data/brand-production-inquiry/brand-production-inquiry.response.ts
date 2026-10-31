import type { InquiryItemRESP } from '@/data/inquiries/inquiries.response';
import type { SiteType } from '@/utils/enums/common.enum';
import type { BudgetType, QuantityType } from '@/utils/enums/inquiry.enum';
import type { ProductType } from '@/utils/enums/product.enum';

export type BrandProductionInquiryRESP = Omit<InquiryItemRESP, 'comments' | 'author_name'> & {
  author_name: string | null;
  company_name: string;
  manager_name: string;
  email: string;
  deadline: string | null;
  product_type: ProductType;
  site_type: SiteType;
  quantity_type: QuantityType;
  budget_type: BudgetType;
};

export type BrandProductionInquiryCreateRESP = {
  inquiry: BrandProductionInquiryRESP;
};
