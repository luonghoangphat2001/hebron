import type { FileAttachmentRESP } from '@/data/files/files.response';
import type { InquiryCommentRESP } from '@/data/inquiries/inquiries.response';
import { formatDate } from '@/utils/helper/common.helper';

export type NormalizedInquiryReply = {
  id: number | string;
  userId: number | string;
  username: string;
  content: string;
  date: string;
  isAdmin: boolean;
  files: FileAttachmentRESP[];
};

export const isImageFile = (fileName?: string, fileType?: string): boolean => {
  if (fileType?.startsWith('image/')) return true;
  if (!fileName) return false;
  return /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(fileName);
};

export const normalizeInquiryReply = (comment?: InquiryCommentRESP | null): NormalizedInquiryReply | null => {
  if (!comment) return null;

  const rawDate = comment.created_at || comment.updated_at;

  return {
    id: comment.id,
    userId: comment.user_id,
    username: comment.author_name || '관리자',
    content: comment.content || '',
    date: rawDate ? formatDate(rawDate, 'YYYY.MM.DD HH:mm') : '',
    isAdmin: comment.is_admin ?? true,
    files: comment.attachments ?? [],
  };
};

export const transferInquiryReplyData = normalizeInquiryReply;
