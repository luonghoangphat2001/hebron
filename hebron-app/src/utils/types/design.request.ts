export interface DesignREQ {
  id?: number;
  include_layout: boolean;
}

export interface AddDesignREQ {
  order_id?: number;
  order_item_id?: number;
  design_mode_id?: number;
  side: string;
  design_group_id?: number;
  text_fields: Record<string, string>;
  metadata: Record<string, unknown>;
}

export interface UpdateDesignREQ {
  id: number;
  side: string;
  design_group_id?: number;
  text_fields: Record<string, string>;
  metadata: Record<string, unknown>;
}

export interface UploadLogoREQ {
  id: number;
  data: FormData;
}

export interface SaveLayoutREQ {
  id: number;
  layout_data: unknown;
  format: unknown;
}

export interface GeneratePreviewREQ {
  id: number;
  format: string;
}
