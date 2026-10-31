import { Typography } from '@/components/typography/Typography';
import { Button } from '@/components/ui/button';
import type { NoticeAttachment } from '@/data/files/files.request';
import { NOTICE_TABLE_LABELS } from '@/utils/constants/notice.constant';
import {
  downloadNoticeAttachment,
  getNoticeAttachmentDisplayName,
  getNoticeAttachmentSizeLabel,
} from '@/utils/helper/file.helper';
import { DownloadSimpleIcon, PaperclipIcon } from '@phosphor-icons/react';

type NoticeDetailAttachmentsProps = {
  attachments: NoticeAttachment[];
};

const NoticeDetailAttachments = ({ attachments }: NoticeDetailAttachmentsProps) => {
  if (attachments.length === 0) return null;

  return (
    <section className='flex flex-col gap-4'>
      <Typography weight='bold' className='text-md flex items-center gap-2 text-neutral-950'>
        <PaperclipIcon className='size-5 text-neutral-950' aria-hidden />
        {NOTICE_TABLE_LABELS.attachments} ({attachments.length})
      </Typography>

      <ul className='flex flex-col gap-3'>
        {attachments.map((file) => {
          const fileName = getNoticeAttachmentDisplayName(file);
          const sizeLabel = getNoticeAttachmentSizeLabel(file);

          const handleDownload = () => {
            void downloadNoticeAttachment(file);
          };

          return (
            <li key={file.key} className='flex items-center gap-3'>
              <Button
                type='button'
                variant='ghost'
                onClick={handleDownload}
                className='text-blue-brand h-auto min-w-0 justify-start rounded-none border-0 bg-transparent p-0 text-sm font-normal hover:bg-transparent hover:underline'>
                {fileName}
                {sizeLabel ? ` (${sizeLabel})` : ''}
              </Button>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                onClick={handleDownload}
                className='size-5 shrink-0 rounded-none border-0 bg-transparent p-0 text-neutral-500 hover:bg-transparent hover:text-neutral-950'
                aria-label={`${fileName} 다운로드`}>
                <DownloadSimpleIcon className='size-5' aria-hidden />
              </Button>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default NoticeDetailAttachments;
