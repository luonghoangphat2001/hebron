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
  type: string;
  side: string;
  field_key: string;
  label: string;
  default_value: string;
  image_url: string;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  style: {
    font_family: string;
    font_weight: string;
    font_size: number;
    line_height: number;
    letter_spacing: number;
    color: string;
    align: string;
  };
}

export interface Template {
  id: number;
  name: string;
  product_id: number;
  file_path: string;
  specifications: {
    additionalProp1: unknown;
  };
  safety_line: {
    additionalProp1: unknown;
  };
  cut_line: {
    additionalProp1: unknown;
  };
  font_set: {
    additionalProp1: unknown;
  };
  color_set: {
    additionalProp1: unknown;
  };
  spot_color: {
    additionalProp1: unknown;
  };
  layout_config: {
    version: number;
    page: {
      width: number;
      height: number;
      unit: string;
      sidedness: string;
    };
    background: {
      front_image_url: string;
      back_image_url: string;
    };
    layers: Layer[];
  };
  front_preview_url: string;
  back_preview_url: string;
  status: {
    value: string;
    label: string;
  };
  is_active: boolean;
  registrant: {
    id: 1;
    username: string;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

export interface TemplateRESP {
  templates: Template[];
}

export interface TemplateDetailRESP {
  template: Template;
}
