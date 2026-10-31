export type AboutCtaButtonREQ = {
  label?: string;
  link?: string;
  variant?: string;
};

export type AboutCtaItemREQ = {
  image: string;
  product_id: number;
};

export type AboutCtaContentREQ = {
  label?: string;
  heading?: string;
  description?: string;
  button_label?: string;
  button_variant?: string;
  primary_button?: AboutCtaButtonREQ;
  secondary_button?: AboutCtaButtonREQ;
  third_button?: AboutCtaButtonREQ;
  item?: AboutCtaItemREQ[];
  product_images?: string[];
};

export type AboutCtaUpdateREQ = {
  title?: string;
  subtitle?: string | null;
  link?: string | null;
  image?: string | null;
  content: AboutCtaContentREQ;
  metadata?: Record<string, any> | null;
};
