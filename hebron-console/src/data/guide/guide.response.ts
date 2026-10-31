import type { PostingStatus } from '@/utils/enums/common.enum';
import type { GuideType } from '@/utils/enums/content.enum';

export type GuideExposureStatusRESP = {
  value: PostingStatus;
  label: string;
};

export type GuideAuthorRESP = {
  id: number;
  username: string;
  name: string;
};

export type GuideAttachmentRESP = {
  no?: number | string;
  key?: string;
  name: string;
  url: string;
  size?: number | string;
};

export type GuideDetail = {
  id: number | string;
  title: string;
  content: string;
  type: GuideType | string;
  attachments: GuideAttachmentRESP[];
  is_active: boolean;
  exposure_status: GuideExposureStatusRESP;
  exposure_target: Array<number | string> | string | null;
  exposure_start_date: string | null;
  exposure_end_date: string | null;
  author: GuideAuthorRESP;
  created_at: string;
  updated_at: string;
};

export type GuideListRESP = {
  guide_contents: GuideDetail[];
};

export type GuideDetailRESP = {
  guide_content: GuideDetail;
};

export type GuideCreateRESP = GuideDetailRESP;
