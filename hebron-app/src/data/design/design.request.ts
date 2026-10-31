import type { DesignSide } from '@/utils/enums/design.enum';
import type { DesignLayer } from '@/utils/types/design.type';

export type ArtWorkREQ = {
  side: DesignSide;
  layout_data: {
    background: {
      color?: string;
      image_url?: string;
    };
    objects: DesignLayer[];
  };
  layout_s3_path: string;
  preview_image_path: string;
  cutline_image_url: string;
};

export type ArtWorkUpdateREQ = ArtWorkREQ & {
  id?: number;
};

export type LayoutDataREQ = {
  background: {
    color?: string;
    image_url?: string;
  };
  objects: DesignLayer[];
};

export type DesignCreateREQ = {
  user_id?: number;
  product_id: number;
  title: string;
  layout_data?: LayoutDataREQ;
  preview_image_path?: string;
  metadata?: Record<string, unknown>;
};

export type DesignUpdateREQ = Partial<DesignCreateREQ> & {
  id: number;
};
