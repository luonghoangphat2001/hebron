import { uploadFileAPI } from '@/data/files/files.api';
import type { FileAttachmentREQ, NoticeAttachment } from '@/data/files/files.request';
import type { FileAttachmentRESP, FileRESP } from '@/data/files/files.response';
import { FileType } from '@/utils/enums/file.enum';

// ─── Size / accept utils (shared via attachment.constant) ─────────────────────

export const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)}GB`;
};

export const bytesToMegabytes = (bytes: number) => bytes / (1024 * 1024);

export const isAttachmentFileAccepted = (file: File, accept: string): boolean => {
  if (!accept || accept === '*') return true;

  const acceptList = accept.split(',').map((rule) => rule.trim().toLowerCase());
  const fileName = file.name.toLowerCase();
  const fileMime = file.type.toLowerCase();

  return acceptList.some((rule) => {
    if (rule.startsWith('.')) return fileName.endsWith(rule);
    if (rule.endsWith('/*')) return fileMime.startsWith(rule.replace('/*', '/'));
    return fileMime === rule;
  });
};

// ─── Shared form attachment (inquiry, …) — NOT Notice ─────────────────────────

export type LocalAttachmentDraft = {
  localId: string;
  file: File;
};

export type RemoteAttachmentValue = FileAttachmentREQ & {
  localId: string;
};

export type AttachmentFormValue = LocalAttachmentDraft | RemoteAttachmentValue;

export const isLocalAttachment = (item: AttachmentFormValue): item is LocalAttachmentDraft =>
  'file' in item && item.file instanceof File;

export const createLocalAttachmentDraft = (file: File): LocalAttachmentDraft => ({
  localId: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
  file,
});

export const toFileAttachmentREQ = (file: FileRESP, filePath: 'path' | 'url' = 'path'): FileAttachmentREQ => ({
  file_path: file[filePath],
  file_name: file.name,
  file_size: file.size,
  file_type: file.mime_type,
});

export const toRemoteAttachmentValue = (attachment: FileAttachmentRESP): RemoteAttachmentValue => ({
  localId: `remote-${attachment.id ?? attachment.file_path}`,
  file_path: attachment.file_path,
  file_name: attachment.file_name,
  file_size: attachment.file_size,
  file_type: attachment.file_type,
});

export const resolveAttachmentFiles = async (
  value: AttachmentFormValue[] | undefined,
  type: FileType,
  filePath: 'path' | 'url' = 'path',
): Promise<FileAttachmentREQ[]> => {
  const items = value ?? [];
  if (!items.length) return [];

  return Promise.all(
    items.map(async (item) => {
      if (!isLocalAttachment(item)) {
        const { file_path, file_name, file_size, file_type } = item;
        return { file_path, file_name, file_size, file_type };
      }

      const resp = await uploadFileAPI(item.file, type);
      return toFileAttachmentREQ(resp.data.file, filePath);
    }),
  );
};

/** Like `resolveAttachmentFiles`, but yields URLs — for payloads typed `attachments: string[]`. */
export const resolveAttachmentUrls = async (value: AttachmentFormValue[] | undefined, type: FileType): Promise<string[]> => {
  const items = value ?? [];
  if (!items.length) return [];

  return Promise.all(
    items.map(async (item) => {
      // ponytail: already-uploaded items only carry `file_path`, so this yields a relative path where a fresh
      // upload yields an absolute URL. Fine while only create-flows use it; revisit if an edit-flow needs it.
      if (!isLocalAttachment(item)) return item.file_path;

      const resp = await uploadFileAPI(item.file, type);
      return resp.data.file.url;
    }),
  );
};

// ─── Notice only — legacy { key, name, url, size } ────────────────────────────

export type NoticeRemoteAttachmentValue = NoticeAttachment & {
  localId: string;
};

export type NoticeAttachmentFormValue = LocalAttachmentDraft | NoticeRemoteAttachmentValue;

export const isNoticeLocalAttachment = (item: NoticeAttachmentFormValue): item is LocalAttachmentDraft =>
  'file' in item && item.file instanceof File;

export const toNoticeAttachment = (file: FileRESP): NoticeAttachment => ({
  key: file.path,
  name: file.name,
  url: file.url,
  size: file.size,
});

export const toNoticeRemoteAttachmentValue = (attachment: NoticeAttachment): NoticeRemoteAttachmentValue => ({
  localId: `remote-${attachment.key}`,
  ...attachment,
});

export const resolveNoticeAttachments = async (
  value: NoticeAttachmentFormValue[] | undefined,
  type: FileType = FileType.NOTICE_ATTACHMENTS,
): Promise<NoticeAttachment[]> => {
  const items = value ?? [];
  if (!items.length) return [];

  return Promise.all(
    items.map(async (item) => {
      if (!isNoticeLocalAttachment(item)) {
        const { key, name, url, size } = item;
        return { key, name, url, size };
      }

      const resp = await uploadFileAPI(item.file, type);
      return toNoticeAttachment(resp.data.file);
    }),
  );
};

// ─── Display / download ───────────────────────────────────────────────────────

type DownloadableFile = {
  name: string;
  url: string;
};

export const downloadBlob = (blob: Blob, name: string) => {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = name;
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
};

export const downloadByUrl = async ({ name, url }: DownloadableFile) => {
  if (!url) return;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Download failed: ${response.status}`);

    const blob = await response.blob();
    downloadBlob(blob, name);
  } catch {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};

export const getFileAttachmentDisplayName = (file: FileAttachmentRESP) => file.file_name;

export const getFileAttachmentSizeLabel = (file: FileAttachmentRESP) =>
  file.file_size > 0 ? formatFileSize(file.file_size) : '';

export const getFileAttachmentHref = (file: FileAttachmentRESP) => file.file_url || '#';

export const downloadFileAttachment = async (file: FileAttachmentRESP) =>
  downloadByUrl({ name: file.file_name, url: file.file_url });

export const downloadAttachment = async (file: FileAttachmentREQ) => downloadByUrl({ name: file.file_name, url: file.file_path });

export const getNoticeAttachmentDisplayName = (file: NoticeAttachment) => file.name;

export const getNoticeAttachmentSizeLabel = (file: NoticeAttachment) => (file.size > 0 ? formatFileSize(file.size) : '');

export const downloadNoticeAttachment = async (file: NoticeAttachment) => downloadByUrl({ name: file.name, url: file.url });
