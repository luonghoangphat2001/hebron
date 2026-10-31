import { ERROR_MESSAGE } from '@/utils/constants/error-message.constant';
import { z } from 'zod';

// --- Brand Identity ---
export const brandIdentityValueSchema = z.object({
  key: z.string().min(1, ERROR_MESSAGE.FIELD_REQUIRED),
  title: z.string().min(1, ERROR_MESSAGE.FIELD_REQUIRED),
  position: z.string().optional(),
  description: z.string().default(''),
});

export const brandIdentityUpsertSchema = z.object({
  heading: z.string().optional(),
  description: z.string().nullish(),
  values: z.array(brandIdentityValueSchema).default([]),
});

export type BrandIdentityValueItem = z.infer<typeof brandIdentityValueSchema>;
export type BrandIdentityInput = z.infer<typeof brandIdentityUpsertSchema>;

// --- Certificates / Company Introduction ---
export const companyInfoItemSchema = z.object({
  label: z.string().min(1, ERROR_MESSAGE.FIELD_REQUIRED),
  value: z.string().min(1, ERROR_MESSAGE.FIELD_REQUIRED),
});

export const certificatesUpsertSchema = z.object({
  heading: z.string().optional(),
  description: z.string().nullish(),
  image_url: z.string().optional(),
  company_info: z.array(companyInfoItemSchema).default([]),
});

export type CompanyInfoItem = z.infer<typeof companyInfoItemSchema>;
export type CertificatesInput = z.infer<typeof certificatesUpsertSchema>;

// --- Company History ---
export const companyHistoryImageSchema = z.object({
  image_alt: z.string().optional(),
  image_url: z.string().min(1, ERROR_MESSAGE.FIELD_REQUIRED),
});

export const companyHistoryItemSchema = z.object({
  year: z.string().min(1, ERROR_MESSAGE.FIELD_REQUIRED),
  title: z.string().min(1, ERROR_MESSAGE.FIELD_REQUIRED),
  description: z.string().default(''),
  images: z.array(companyHistoryImageSchema).optional(),
});

export const companyHistoryPeriodSchema = z.object({
  period: z.string().min(1, ERROR_MESSAGE.FIELD_REQUIRED),
  title: z.string().optional(),
  items: z.array(companyHistoryItemSchema).default([]),
});

export const companyHistoryUpsertSchema = z.object({
  heading: z.string().optional(),
  description: z.string().nullish(),
  timeline: z.array(companyHistoryPeriodSchema).default([]),
});

export type CompanyHistoryImage = z.infer<typeof companyHistoryImageSchema>;
export type CompanyHistoryItem = z.infer<typeof companyHistoryItemSchema>;
export type CompanyHistoryPeriod = z.infer<typeof companyHistoryPeriodSchema>;
export type CompanyHistoryInput = z.infer<typeof companyHistoryUpsertSchema>;

// --- Inquiry Form ---
export const inquiryProcessStepSchema = z.object({
  key: z.string().min(1, ERROR_MESSAGE.FIELD_REQUIRED),
  title: z.string().min(1, ERROR_MESSAGE.FIELD_REQUIRED),
  description: z.string().default(''),
});

export const inquiryFormUpsertSchema = z.object({
  heading: z.string().optional(),
  description: z.string().nullish(),
  subtitle: z.string().nullish(),
  image_url: z.string().optional(),
  images: z.array(z.string()).optional(),
  process_title: z.string().optional(),
  process_steps: z.array(inquiryProcessStepSchema).default([]),
});

export type InquiryProcessStep = z.infer<typeof inquiryProcessStepSchema>;
export type InquiryFormInput = z.infer<typeof inquiryFormUpsertSchema>;

// --- Contact Map (Kakao Map) ---
export const contactMapUpsertSchema = z.object({
  heading: z.string().optional(),
  description: z.string().nullish(),
  place_name: z.string().optional(),
  company_name: z.string().optional(),
  address: z.string().optional(),
  address_detail: z.string().optional(),
  address_en: z.string().optional(),
  map_link: z.string().optional(),
  kakao_map_url: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  image_url: z.string().optional(),
  images: z.array(z.string()).optional(),
});

export type ContactMapInput = z.infer<typeof contactMapUpsertSchema>;
