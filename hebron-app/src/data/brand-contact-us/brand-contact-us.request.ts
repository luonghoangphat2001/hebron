import type { FileAttachmentREQ } from '@/data/files/files.request';
import type { SiteType } from '@/utils/enums/common.enum';
import type { ProductType } from '@/utils/enums/product.enum';

export type BrandContactUsCreateREQ = {
  product_type: ProductType;
  site_type: SiteType;
  company_name: string;
  manager_name: string;
  phone: string;
  email: string;
  message: string;
  attachments: FileAttachmentREQ[];
};
