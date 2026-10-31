import { Typography } from '@/components/typography/Typography';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { FileAttachmentRESP } from '@/data/files/files.response';
import type { InquiryCommentRESP } from '@/data/inquiries/inquiries.response';
import { normalizeInquiryReply } from '@/data/inquiries/inquiries.service';
import { cn } from '@/lib/utils';
import { downloadFileAttachment, getFileAttachmentDisplayName, getFileAttachmentSizeLabel } from '@/utils/helper/file.helper';
import { ChatCircleDotsIcon, ClockIcon, DownloadSimpleIcon, PaperclipIcon } from '@phosphor-icons/react';
import DOMPurify from 'dompurify';
import { UserCircle } from 'lucide-react';

export type MyPageInquiryReplyAttachmentsProps = {
  attachments: FileAttachmentRESP[];
  className?: string;
};

export const MyPageInquiryReplyAttachments = ({ attachments, className }: MyPageInquiryReplyAttachmentsProps) => {
  if (attachments.length === 0) return null;

  return (
    <section className={cn('mt-2 flex flex-col gap-4 border-t border-neutral-200 pt-5', className)}>
      <Typography weight='bold' className='text-md flex items-center gap-2 text-neutral-950'>
        <PaperclipIcon className='size-5 text-neutral-950' aria-hidden />
        첨부파일 ({attachments.length})
      </Typography>

      <ul className='flex flex-col gap-3'>
        {attachments.map((file, index) => {
          const fileName = getFileAttachmentDisplayName(file) || '첨부파일';
          const sizeLabel = getFileAttachmentSizeLabel(file);

          const handleDownload = () => {
            void downloadFileAttachment(file);
          };

          return (
            <li key={file.id ?? file.file_path ?? file.file_url ?? index} className='flex items-center gap-3'>
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

export type MyPageInquiryRepliesProps = {
  comments?: InquiryCommentRESP[];
  inquiryStatus?: string;
  className?: string;
};

export const MyPageInquiryReplies = ({ comments = [], inquiryStatus, className }: MyPageInquiryRepliesProps) => {
  const reply = normalizeInquiryReply(comments[0]);
  const isAnswered = inquiryStatus === 'ANSWERED';

  return (
    <div className={cn('flex flex-col gap-4 rounded-xl py-4 md:py-6', className)}>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2.5'>
          <div className='bg-blue-brand-50 text-blue-brand-700 flex size-8 items-center justify-center rounded-lg'>
            <ChatCircleDotsIcon className='size-5' />
          </div>
          <Typography weight='bold' className='text-base text-neutral-950'>
            답변 내용
          </Typography>
        </div>

        {inquiryStatus && (
          <Badge
            variant={isAnswered ? 'default' : 'white'}
            size='default'
            className={cn('font-medium', isAnswered ? 'bg-blue-brand-700 text-white' : 'text-neutral-600')}>
            {isAnswered ? '답변 완료' : '답변 대기'}
          </Badge>
        )}
      </div>

      {reply ? (
        <article className='flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm md:p-5'>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <div className='flex items-center justify-start gap-2'>
              <UserCircle size={20} />
              <Typography weight='bold' className='text-sm text-neutral-950'>
                {reply.username}
              </Typography>
            </div>

            {reply.date && (
              <div className='flex items-center gap-1 text-xs text-neutral-500'>
                <ClockIcon className='size-3.5 text-neutral-400' />
                <span>{reply.date}에 답장함</span>
              </div>
            )}
          </div>

          <div className='pt-1'>
            {reply.content ? (
              <div
                className='[&_a]:!text-blue-brand-600 flex flex-col gap-2 text-sm leading-relaxed text-neutral-800 [&_*]:!text-inherit [&_a]:underline [&_b]:!text-neutral-950 [&_h1]:!text-neutral-950 [&_h2]:!text-neutral-950 [&_h3]:!text-neutral-950 [&_h4]:!text-neutral-950 [&_img]:my-3 [&_img]:max-w-full [&_img]:rounded-lg [&_p]:mb-2 [&_p:last-child]:mb-0 [&_span]:!text-inherit [&_strong]:!text-neutral-950'
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(reply.content),
                }}
              />
            ) : (
              <Typography className='text-sm text-neutral-400 italic'>(작성된 답변 내용이 없습니다)</Typography>
            )}
          </div>

          <MyPageInquiryReplyAttachments attachments={reply.files} />
        </article>
      ) : (
        <div className='flex flex-col items-center justify-center gap-2 py-8 text-center'>
          <div className='flex size-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-400'>
            <ClockIcon className='size-6' />
          </div>
          <Typography weight='medium' className='text-sm text-neutral-700'>
            등록된 답변이 없습니다
          </Typography>
          <Typography className='text-xs text-neutral-500'>
            담당자가 문의 내용을 확인한 후 신속히 답변을 등록해 드립니다.
          </Typography>
        </div>
      )}
    </div>
  );
};

export default MyPageInquiryReplies;
