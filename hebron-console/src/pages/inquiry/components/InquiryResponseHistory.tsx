import { ImageColumnPreview } from '@/components/dialog/ImagePreviewDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { InquiryAttachmentRESP, InquiryReplyItemRESP } from '@/data/inquiry/inquiry.response';
import { getReplyNotificationInfo } from '@/data/inquiry/inquiry.service';
import { cn } from '@/lib/utils';
import { DATE_TIME_SHORT_FORMAT } from '@/utils/constants/date.constant';
import { formatDate, formatFileSize, formatPhone, getFileUrl, isImageSource } from '@/utils/helper/common.helper';
import { sanitizeHtml } from '@/utils/helper/string.helper';
import { Download, Mail, MessageCircle, Paperclip, Phone } from 'lucide-react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type InquiryReplyChannelBadgesProps = {
  isSend: boolean;
  channels: string[];
};

const InquiryReplyChannelBadges = React.memo(({ isSend, channels }: InquiryReplyChannelBadgesProps) => {
  const { t: tInquiry } = useTranslation('inquiry');

  if (!isSend || !channels || channels.length === 0) return null;

  return (
    <div className='flex shrink-0 items-center gap-1.5'>
      {channels.includes('email') && (
        <Badge
          variant='outline'
          className='inline-flex items-center gap-1 border-blue-200 bg-blue-50/80 px-2 py-0.5 text-xs font-medium text-blue-700 shadow-2xs'>
          <Mail className='size-3' />
          <span>{tInquiry('label.email') || 'Email'}</span>
        </Badge>
      )}
      {channels.includes('kakao') && (
        <Badge
          variant='outline'
          className='inline-flex items-center gap-1 border-amber-200 bg-amber-50/80 px-2 py-0.5 text-xs font-medium text-amber-800 shadow-2xs'>
          <MessageCircle className='size-3 text-amber-600' />
          <span>{tInquiry('label.kakao_talk') || 'KakaoTalk'}</span>
        </Badge>
      )}
    </div>
  );
});

InquiryReplyChannelBadges.displayName = 'InquiryReplyChannelBadges';

type InquiryReplyAttachmentItemProps = {
  file: InquiryAttachmentRESP;
  onPreviewImage: (url: string) => void;
  onDownloadFile: (fileUrl?: string, fileName?: string) => void;
};

const InquiryReplyAttachmentItem = React.memo(({ file, onPreviewImage, onDownloadFile }: InquiryReplyAttachmentItemProps) => {
  const { t: tCommon } = useTranslation('common');

  const fileName = file.file_name || file.name || 'file';
  const fileUrl = file.file_url || file.url || '';
  const fileSize = file.file_size || file.size;
  const fullUrl = getFileUrl(fileUrl);
  const isImage = isImageSource({ name: fileName, url: fileUrl });

  const handleFileNameClick = () => {
    if (isImage) {
      onPreviewImage(fullUrl);
    } else {
      onDownloadFile(fileUrl, fileName);
    }
  };

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDownloadFile(fileUrl, fileName);
  };

  return (
    <div className='flex items-center justify-between rounded-md border border-gray-200 bg-white p-2 text-xs'>
      <div className='flex items-center gap-2 overflow-hidden'>
        {isImage ? (
          <ImageColumnPreview
            src={fullUrl}
            alt={fileName}
            className='size-8 shrink-0'
            previewLabel={tCommon('button.preview') || 'Preview'}
            onClick={() => onPreviewImage(fullUrl)}
          />
        ) : (
          <Paperclip className='size-3.5 shrink-0 text-gray-500' />
        )}
        <span
          className={cn(
            'truncate font-medium',
            isImage ? 'cursor-pointer text-gray-900 hover:underline' : 'cursor-pointer text-blue-600 hover:underline',
          )}
          onClick={handleFileNameClick}>
          {fileName}
        </span>
        {fileSize ? <span className='text-muted-foreground'>({formatFileSize(fileSize)})</span> : null}
      </div>
      <Button
        variant='ghost'
        size='sm'
        className='h-6 w-6 shrink-0 p-0 text-gray-500 hover:text-gray-900'
        title={tCommon('button.download') || 'Download'}
        onClick={handleDownloadClick}>
        <Download className='size-3.5' />
      </Button>
    </div>
  );
});

InquiryReplyAttachmentItem.displayName = 'InquiryReplyAttachmentItem';

type InquiryReplyCardProps = {
  reply: InquiryReplyItemRESP;
  onPreviewImage: (url: string) => void;
  onDownloadFile: (fileUrl?: string, fileName?: string) => void;
};

const InquiryReplyCard = React.memo(({ reply, onPreviewImage, onDownloadFile }: InquiryReplyCardProps) => {
  const { t: tInquiry } = useTranslation('inquiry');

  const { isSend, channels } = useMemo(() => getReplyNotificationInfo(reply), [reply]);

  return (
    <li className='space-y-2.5 rounded-md bg-gray-50 p-4'>
      <div className='space-y-2'>
        <div
          className='prose prose-sm max-w-none text-sm text-gray-800'
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(reply.content) }}
        />
        {reply.attachments && reply.attachments.length > 0 && (
          <div className='mt-2 space-y-1.5'>
            {reply.attachments.map((file, idx) => (
              <InquiryReplyAttachmentItem
                key={file.id || file.key || file.url || file.file_url || idx}
                file={file}
                onPreviewImage={onPreviewImage}
                onDownloadFile={onDownloadFile}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer: Created Info on the left, Channel Badges on the far right */}
      <div className='flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 pt-0.5 text-xs'>
        <div className='text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1'>
          <span>
            {tInquiry('label.created_by_at', {
              date: formatDate(reply.created_at, DATE_TIME_SHORT_FORMAT),
              by: reply.created_by?.name || '-',
            })}
          </span>
          {reply.contact_phone && (
            <span className='inline-flex items-center gap-1 rounded bg-gray-100 px-1.5 py-0.5 font-medium text-gray-700'>
              <Phone className='size-3 text-gray-500' />
              {formatPhone(reply.contact_phone)}
            </span>
          )}
          {reply.updated_at !== reply.created_at && (
            <span>· {tInquiry('label.updated_at_short', { date: formatDate(reply.updated_at, DATE_TIME_SHORT_FORMAT) })}</span>
          )}
        </div>

        <InquiryReplyChannelBadges isSend={isSend} channels={channels} />
      </div>
    </li>
  );
});

InquiryReplyCard.displayName = 'InquiryReplyCard';

type InquiryResponseHistoryProps = {
  replyList?: InquiryReplyItemRESP[];
  onPreviewImage: (url: string) => void;
  onDownloadFile: (fileUrl?: string, fileName?: string) => void;
};

export const InquiryResponseHistory = React.memo(({ replyList, onPreviewImage, onDownloadFile }: InquiryResponseHistoryProps) => {
  const { t: tInquiry } = useTranslation('inquiry');

  return (
    <section className='space-y-4 rounded-md border border-gray-200 p-5'>
      <h2 className='flex items-center gap-2 text-sm font-semibold'>
        <MessageCircle className='size-4' />
        {tInquiry('section.response_history')}
      </h2>
      {!replyList || replyList.length === 0 ? (
        <p className='text-muted-foreground text-sm'>{tInquiry('empty.no_replies')}</p>
      ) : (
        <ul className='space-y-3'>
          {replyList.map((reply: InquiryReplyItemRESP) => (
            <InquiryReplyCard key={reply.id} reply={reply} onPreviewImage={onPreviewImage} onDownloadFile={onDownloadFile} />
          ))}
        </ul>
      )}
    </section>
  );
});

InquiryResponseHistory.displayName = 'InquiryResponseHistory';
