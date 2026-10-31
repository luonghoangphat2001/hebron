import type { SortOrder } from '@/utils/enums/common.enum';
import type { OptionGroupSort } from '@/utils/enums/option-group.enum';
import type { ExportExcelBaseREQ } from '@/utils/types/export.type';
import type { PaginationREQ } from '@/utils/types/request.type';

export type OptionGroupListREQ = PaginationREQ & {
  code?: string;
  name?: string;
  display_type?: string;
  is_required?: boolean;
  order_by?: OptionGroupSort;
  sort_order?: SortOrder;
};

export type OptionGroupCreateREQ = {
  code: string;
  name: string;
  display_type: string;
  is_required: boolean;
};

export type OptionGroupUpdateREQ = {
  id: number;
  name: string;
  display_type: string;
  is_required: boolean;
};

export type OptionGroupAssignProductsREQ = {
  id: number;
  product_ids: number[];
};

export type OptionGroupExportExcelREQ = Omit<OptionGroupListREQ, 'page'> & ExportExcelBaseREQ;
