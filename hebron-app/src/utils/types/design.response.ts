import type { ObjectType } from './canvas.types';

export interface Design {
  id: number;
  order_id: number;
  order_item_id: number;
  design_mode_id: number;
  design_group_id: number;
  side: string;
  text_fields: Record<string, string>;
  logo: {
    front: {
      logo_path: string;
      logo_url: string;
    };
    back: {
      logo_path: string;
      logo_url: string;
    };
  };
  preview: {
    front: {
      preview_path: string;
      preview_url: string;
    };
    back: {
      preview_path: string;
      preview_url: string;
    };
  };
  metadata: unknown;
  created_at: string;
  updated_at: string;
  layout_data: unknown;
  has_layout_s3: boolean;
}

export interface DesignRESP {
  design: Design;
}

export interface GeneratePreviewRESP {
  preview_url: string;
}

export interface PreviewImageRESP {
  front: {
    preview_path: string;
    preview_url: string;
  };
  back: {
    preview_path: string;
    preview_url: string;
  };
}

export interface BackgroundLayer {
  type: ObjectType;
  src: string;
  originalWidth: number;
  originalHeight: number;
  cropX: number;
  cropY: number;
  cropWidth: number;
  cropHeight: number;
}

export interface Layer {
  id: string;
  type: 'text' | 'image' | 'shape';
  side?: 'front' | 'back';
  field_key?: string;
  label?: string;
  default_value?: string;
  image_url?: string;
  mask_image_url?: string;
  mask_shape?: 'none' | 'circle' | 'rectangle' | 'custom';
  shape_type?: 'rectangle' | 'roundedRectangle' | 'doubleRectangle' | 'ellipse' | 'line' | 'triangle' | 'star' | 'polygon';
  polygon_sides?: number;
  locked?: boolean;
  visible?: boolean;
  editable?: boolean;
  replaceable?: boolean;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  rotation?: number;
  style?: {
    font_family?: string;
    font_weight?: 'regular' | 'medium' | 'bold' | '400' | '700';
    font_size?: number;
    line_height?: number;
    letter_spacing?: number;
    color?: string;
    align?: 'left' | 'center' | 'right' | 'justify';
    stroke_color?: string;
    stroke_width?: number;
    opacity?: number;
    fill_image_url?: string;
    shadow_color?: string;
    shadow_blur?: number;
    shadow_offset_x?: number;
    shadow_offset_y?: number;
    shadow_opacity?: number;
  };
}

export interface Template {
  id: number;
  name: string;
  size_option: null;
  product_id: number | null;
  background_id?: number | null;
  background?: {
    id: number;
    image_path: string;
    image_url: string;
  } | null;
  file_path: string | null;
  specifications: Record<string, unknown> | unknown[];
  safety_line: unknown | null;
  cut_line: unknown | null;
  font_set: Record<string, unknown> | unknown[];
  color_set: Record<string, unknown> | unknown[];
  spot_color: Record<string, unknown> | null;
  layout_config: {
    version: number;
    side: 'single' | 'double';
    page: {
      width: number;
      height: number;
      unit: 'mm' | 'px';
    };
    background?: {
      front_image_url?: string | null;
      back_image_url?: string | null;
      front_width?: number | null;
      front_height?: number | null;
      back_width?: number | null;
      back_height?: number | null;
    };
    guides?: {
      front?: TemplateGuide;
      back?: TemplateGuide;
      cut_width?: number;
      cut_height?: number;
      safe_margin?: number;
      cut_offset_x?: number | null;
      cut_offset_y?: number | null;
      cut_frame_width?: number | null;
      cut_frame_height?: number | null;
      cut_offset_unit?: 'px';
      layer_coordinate_space?: 'cutline' | 'background';
      background_transform?: { x?: number; y?: number; scale?: number };
      unit?: 'mm' | 'px';
    };
    layers: Layer[];
  } | null;
  front_preview_url: string | null;
  back_preview_url: string | null;
  preview_images: string[];
}

export type TemplateGuide = {
  cut_width?: number;
  cut_height?: number;
  safe_margin?: number;
  cut_offset_x?: number | null;
  cut_offset_y?: number | null;
  cut_frame_width?: number | null;
  cut_frame_height?: number | null;
  cut_offset_unit?: 'px';
  layer_coordinate_space?: 'cutline' | 'background';
  background_transform?: { x?: number; y?: number; scale?: number };
  unit?: 'mm' | 'px';
};

export interface TemplateRESP {
  templates: Template[];
}

export interface TemplateDetailRESP {
  template: Template;
}
