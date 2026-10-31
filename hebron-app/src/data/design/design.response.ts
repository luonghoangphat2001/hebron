import type { DesignSide } from '@/utils/enums/design.enum';
import type { DesignLayer, DesignWebEditor } from '@/utils/types/design.type';

export type ArtWork = {
  id: number;
  side: DesignSide;
  layout_data: {
    background: {
      color?: string;
      image_url?: string;
    };
    objects: DesignLayer[];
  };
  layout_s3_path: string;
  logo_path?: string;
  preview_image_path: string;
  cutline_image_url?: string;
};

export type DesignGroup = {
  id: number;
  design_revision?: string;
  print_pdf?: { available: boolean; revision: string | null };
  user_id?: number | null;
  product_id: number | null;
  title: string;
  size_option_id?: number;
  size_option_width?: number;
  size_option_height?: number;
  width_mm?: number;
  height_mm?: number;
  layout_data?: Record<string, unknown> | null;
  preview_image_path: string | null;
  preview_pdf_url?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at?: string;
  updated_at?: string;
  web_editor?: DesignWebEditor | null;
  artworks?: ArtWork[];
};

export type DesignCreateRESP = {
  design_group: DesignGroup;
};

export type DesignDetailRESP = DesignGroup;
