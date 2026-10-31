import type { ExportStatus, ExportType } from '../enums/common.enum';

export type ExportHistoryRESP = {
  id: number;
  user_id: number;
  module: string;
  file_name: string;
  file_path: string;
  download_url: string;
  status: ExportStatus;
  filters: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type ExportExcelRESP = {
  history: ExportHistoryRESP;
};

// Extend with the module's own list-filter fields to build a concrete export request type.
export type ExportExcelBaseREQ = {
  export_type: ExportType;
  selected_ids?: number[];
  current_page?: number;
  per_page?: number;
  locale?: string;
};
