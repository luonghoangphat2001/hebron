export type SortOrder = 'asc' | 'desc';
export type TemplateSide = 'single' | 'double';
export type TemplateType = 'no-fold' | '2-fold' | '3-fold' | '4-fold';
export type CanvasSide = 'front' | 'back';
export type TemplateLayerType = 'text' | 'image' | 'shape';
export type TemplateShapeType =
  | 'rectangle'
  | 'roundedRectangle'
  | 'doubleRectangle'
  | 'ellipse'
  | 'line'
  | 'triangle'
  | 'star'
  | 'polygon';
export type TemplateMaskShape = 'none' | 'circle' | 'rectangle' | 'custom';

export type PageParams = {
  page?: number;
  per_page?: number;
};

export type ProductListParams = PageParams & {
  search_term?: string;
  product_name?: string;
  product_code?: string;
  category_id?: number;
  category_name?: string;
  status?: 'sold' | 'hidden';
  is_promotional?: boolean;
  product_type?: string;
  branch?: string;
  client_name?: string;
  is_public?: boolean;
  has_quotation?: boolean;
  quotation?: boolean;
  availability?: 'in_stock' | 'out_of_stock';
  sort_by?: 'created_at' | 'updated_at' | 'sort_order' | 'name' | 'view_count';
  sort_order?: SortOrder;
  [key: string]: string | number | boolean | undefined;
};

export type TemplateListParams = PageParams & {
  template_name?: string;
  linked_product?: string;
  product_id?: number;
  specification?: string;
  status?: 'active' | 'inactive';
  registrant?: string;
  last_modified_from?: string;
  last_modified_to?: string;
  sort_by?: 'name' | 'is_active' | 'created_at' | 'updated_at';
  sort_order?: SortOrder;
};

export type AdminList<T> = {
  items: T[];
  total: number;
  page: number;
  perPage: number;
};

export type ProductRow = {
  id: number;
  sku: string;
  name: string;
  name_en?: string;
  category?: ProductCategory;
  categories?: ProductCategory[];
  category_ids?: number[];
  images: string[];
  is_active: boolean;
  status?: 'sold' | 'hidden';
  created_at: string;
  updated_at?: string;
  [key: string]: unknown;
};

export type ProductCategory = {
  id?: number;
  name?: string;
  name_en?: string;
  slug?: string;
};

export type ProductOption = {
  label: string;
  value: string;
  erp_option_id: number;
  additional_price: number;
  metadata: [];
  sort_order: number;
  is_active: boolean;
};

export type ProductOptionGroup = {
  code: string;
  erp_option_group_id: number;
  name: string;
  display_type: string;
  is_required: boolean;
  sort_order: number;
  options: ProductOption[];
};

export type ProductWrite = {
  category_id: number;
  allow_file_upload: boolean;
  is_blank_canvas: boolean;
  is_active: boolean;
  is_popular: boolean;
  requires_separate_shipping: boolean;
  separate_shipshipping: number;
  name: string;
  name_en: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  sku: string;
  images: string[];
  specification: {
    production_time_days: number;
    notes: string;
  };
  info_icon: {
    size: string | null;
    paper: string | null;
    printed_color: string | null;
    quantity: string | null;
    post_processing: string | null;
    design: string | null;
  };
  option_groups: ProductOptionGroup[];
  quantity_prices: Array<{ quantity: number; price: number }>;
  product_sets: {
    quantity: number;
    set_type: 'input';
    min_set: number;
    max_set: number;
    step_set: number;
  };
};

export type ProductDetail = ProductRow & Partial<ProductWrite>;

export type ErpOption = {
  id: number;
  code?: string;
  label?: string;
  name?: string;
  value?: string;
  price?: number;
  additional_price?: number;
  sort_order?: number;
  is_active?: boolean;
};

export type ErpOptionGroup = {
  id: number;
  code: string;
  label?: string;
  name?: string;
  display_type?: string;
  is_required?: boolean;
  sort_order?: number;
  options: ErpOption[];
};

export type SizeOption = {
  id: number;
  name: string;
  cutting_width: number;
  cutting_height: number;
  working_width?: number;
  working_height?: number;
  size_ratio?: number;
  unit?: string;
};

export type TemplateProduct = {
  id: number;
  name: string;
  sku?: string | null;
};

export type TemplateRegistrant = {
  id?: number;
  username?: string;
  name?: string;
};

export type TemplateLayer = {
  layer_id: string;
  type: TemplateLayerType;
  side: CanvasSide;
  field_key: string;
  default_value: string;
  image_url: string;
  mask_image_url: string;
  mask_shape: TemplateMaskShape;
  shape_type: TemplateShapeType;
  polygon_sides: number;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  rotation: number;
  font_family: string;
  font_size: number;
  font_weight: string;
  line_height: number;
  color: string;
  fill_image_url: string;
  align: 'left' | 'center' | 'right' | 'justify';
  stroke_color: string;
  stroke_width: number;
  locked: boolean;
  visible: boolean;
  editable: boolean;
  replaceable: boolean;
  opacity: number;
  shadow_color: string;
  shadow_blur: number;
  shadow_offset_x: number;
  shadow_offset_y: number;
  shadow_opacity: number;
};

export type TemplateWrite = {
  name: string;
  product_id?: number | null;
  background_id: number | null;
  type: TemplateType;
  specifications: Record<string, unknown>;
  font_set: Record<string, unknown>;
  color_set: Record<string, unknown>;
  spot_color: { enabled: boolean; [key: string]: unknown };
  layout_config: {
    version: 1;
    side: TemplateSide;
    page: { width: number; height: number; unit: 'mm' | 'px' };
    /** Response compatibility only. Backend resolves the selected background into these URLs. */
    background?: {
      front_image_url?: string | null;
      back_image_url?: string | null;
    };
    guides?: {
      front?: TemplateGuideConfig;
      back?: TemplateGuideConfig;
      safe_margin?: number;
      cut_offset_x?: number | null;
      cut_offset_y?: number | null;
      cut_frame_width?: number | null;
      cut_frame_height?: number | null;
      cut_offset_unit?: 'px';
      layer_coordinate_space?: 'cutline' | 'background';
      unit?: 'mm' | 'px';
    };
    layers: Array<{
      id: string;
      type: TemplateLayerType;
      side: CanvasSide;
      field_key: string;
      default_value: string;
      image_url: string;
      mask_image_url: string;
      mask_shape: TemplateMaskShape;
      shape_type: TemplateShapeType;
      polygon_sides: number;
      locked: boolean;
      visible: boolean;
      editable: boolean;
      replaceable: boolean;
      position: { x: number; y: number };
      size: { width: number; height: number };
      rotation: number;
      style: {
        font_family: string;
        font_size: number;
        font_weight: TemplateLayer['font_weight'];
        line_height: number;
        color: string;
        fill_image_url: string;
        align: TemplateLayer['align'];
        stroke_color: string;
        stroke_width: number;
        opacity: number;
        shadow_color: string;
        shadow_blur: number;
        shadow_offset_x: number;
        shadow_offset_y: number;
        shadow_opacity: number;
      };
    }>;
  };
  editor_permission: {
    allow_text_edit: boolean;
    allow_image_replace: boolean;
  };
  preview_images: string[];
  is_active: boolean;
};

export type TemplatePreviewSide = 'front' | 'back';

export type TemplatePreviewResult = {
  side: TemplatePreviewSide;
  path: string;
  url: string;
  preview_images: string[];
  front_preview_url: string | null;
  back_preview_url: string | null;
};

export type TemplateBulkUpdate = {
  template_ids: number[];
} & (
  | {
      field: 'is_active';
      value: boolean;
    }
  | {
      field: 'product_id';
      value: number | null;
    }
);

export type TemplateBulkDelete = {
  template_ids: number[];
};

export type TemplateBulkResult = {
  updated_count?: number;
  deleted_count?: number;
  total_count: number;
};

export type Template = Partial<TemplateWrite> & {
  id: number;
  name: string;
  product_id?: number | null;
  product?: TemplateProduct | null;
  background_id?: number | null;
  background?: {
    id: number;
    image_path: string;
    image_url: string;
  } | null;
  product_ids?: number[];
  products?: TemplateProduct[];
  side?: TemplateSide;
  safety_line?: unknown;
  cut_line?: unknown;
  is_active: boolean;
  status?: { value?: 'active' | 'inactive'; label?: string };
  registrant?: string | TemplateRegistrant;
  front_preview_url?: string | null;
  back_preview_url?: string | null;
  created_at?: string;
  updated_at?: string;
  size_option?: SizeOption;
};

export type TemplateBackgroundTransform = { x: number; y: number; scale: number };

export type TemplateFormState = {
  name: string;
  type: TemplateType;
  side: TemplateSide;
  is_active: boolean;
  allow_text_edit: boolean;
  allow_image_replace: boolean;
  spot_color_enabled: boolean;
  page_width: number;
  page_height: number;
  page_unit: 'mm';
  safe_margin: number;
  background_id: number | null;
  cut_offset_x: number | null;
  cut_offset_y: number | null;
  cut_frame_width: number | null;
  cut_frame_height: number | null;
  back_safe_margin: number;
  back_page_width: number;
  back_page_height: number;
  back_cut_offset_x: number | null;
  back_cut_offset_y: number | null;
  back_cut_frame_width: number | null;
  back_cut_frame_height: number | null;
  background_front_transform: TemplateBackgroundTransform;
  background_back_transform: TemplateBackgroundTransform;
  background_front: string;
  background_back: string;
  layers: TemplateLayer[];
};

export type TemplateGuideConfig = {
  background_transform?: TemplateBackgroundTransform;
  cut_width?: number;
  cut_height?: number;
  safe_margin?: number;
  cut_offset_x?: number | null;
  cut_offset_y?: number | null;
  cut_frame_width?: number | null;
  cut_frame_height?: number | null;
  cut_offset_unit?: 'px';
  layer_coordinate_space?: 'cutline' | 'background';
  unit?: 'mm' | 'px';
};

export type ExportScope = 'ALL' | 'CURRENT_PAGE' | 'SELECTED';

export type ExportRequest = Record<string, unknown> & {
  export_type: ExportScope;
  selected_ids?: Array<number | string>;
  current_page?: number;
  per_page?: number;
};

export type ExportHistory = {
  id: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  file_name?: string;
  file_path?: string;
};
