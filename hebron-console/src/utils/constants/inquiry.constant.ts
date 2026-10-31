import { InquiryStatus, InquiryType } from '../enums/inquiry.enum';

export const INQUIRY_TYPE_BADGE: Record<InquiryType, string> = {
  [InquiryType.QUOTE]: 'bg-violet-100 text-violet-600 rounded-sm',
  [InquiryType.SHIPPING]: 'bg-blue-100 text-blue-600 rounded-sm',
  [InquiryType.REWORK]: 'bg-amber-100 text-amber-600 rounded-sm',
  [InquiryType.CONTACT_US]: 'bg-emerald-100 text-emerald-600 rounded-sm',
};

export const INQUIRY_STATUS_BADGE: Record<InquiryStatus, string> = {
  [InquiryStatus.PENDING]: 'bg-yellow-100 text-yellow-600 rounded-sm',
  [InquiryStatus.RESPONDED]: 'bg-green-100 text-green-600 rounded-sm',
};
