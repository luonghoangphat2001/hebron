import type { FileAttachmentREQ } from '@/data/files/files.request';
import type { SiteType } from '@/utils/enums/common.enum';
import type { BudgetType, QuantityType } from '@/utils/enums/inquiry.enum';
import type { ProductType } from '@/utils/enums/product.enum';

export type BrandProductionInquiryCreateREQ = {
  product_type: ProductType;
  site_type: SiteType;
  company_name: string;
  manager_name: string;
  phone: string;
  email: string;
  quantity_type: QuantityType;
  deadline?: string;
  budget_type: BudgetType;
  message: string;
  product_id?: number | null;
  attachments: FileAttachmentREQ[];
};
