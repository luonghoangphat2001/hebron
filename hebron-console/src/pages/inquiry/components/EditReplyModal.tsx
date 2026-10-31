import { appToast } from '@/components/toast/AppToast';
import { AppRichTextEditor } from '@/components/shared/app-rich-text-editor';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AttachmentFile, { uploadAttachmentFiles, type AttachmentFileValue } from '@/components/upload/AttachmentFile';
import { useInquiryReplyUpdateMutation } from '@/data/inquiry/inquiry.query';
import type { InquiryReplyItemRESP } from '@/data/inquiry/inquiry.response';
import { parseNotificationChannels, transformInquiryAttachmentsToAttachmentValues } from '@/data/inquiry/inquiry.service';
import { FileType } from '@/utils/enums/file.enum';
import { Loader2, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

type EditReplyModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inquiryId: string;
  reply: InquiryReplyItemRESP | null;
};

const isHtmlEmpty = (html?: string) => {
  if (!html) return true;
  const stripped = html.replace(/<[^>]*>/g, '').trim();
  return stripped.length === 0;
};

const EditReplyModal = ({ open, onOpenChange, inquiryId, reply }: EditReplyModalProps) => {
  const { t: tInquiry } = useTranslation('inquiry');
  const { t: tCommon } = useTranslation('common');

  const [responseContent, setResponseContent] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [sendNotification, setSendNotification] = useState<boolean>(true);
  const [notificationChannels, setNotificationChannels] = useState<string[]>(['email']);
  const [replyAttachments, setReplyAttachments] = useState<AttachmentFileValue[]>([]);
  const [isUploadingAttachments, setIsUploadingAttachments] = useState(false);
  const { mutate: updateReply, isPending: isUpdatingReply } = useInquiryReplyUpdateMutation();

  const toggleNotificationChannel = (channel: string) => {
    setNotificationChannels((prev) => (prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel]));
  };

  const handleToggleSendNotification = (checked: boolean) => {
    setSendNotification(checked);
    if (checked && notificationChannels.length === 0) {
      setNotificationChannels(['email']);
    }
  };

  const resetForm = () => {
    setResponseContent('');
    setContactPhone('');
    setSendNotification(true);
    setNotificationChannels(['email']);
    setReplyAttachments([]);
  };

  const populateForm = (item: InquiryReplyItemRESP) => {
    setResponseContent(item.content || '');
    setContactPhone(item.contact_phone || '');
    const channels = parseNotificationChannels(item.notification_channel, item.notification_channels);
    setNotificationChannels(channels);
    const isSend =
      typeof item.send_notification === 'boolean'
        ? item.send_notification
        : item.notification_sent !== false && (item.notification_channel !== null ? channels.length > 0 : true);
    setSendNotification(isSend);
    setReplyAttachments(transformInquiryAttachmentsToAttachmentValues(item.attachments));
  };

  useEffect(() => {
    if (open && reply) {
      populateForm(reply);
    } else if (!open) {
      resetForm();
    }
  }, [reply, open]);

  const handleSave = async () => {
    if (!reply || !inquiryId) return;

    if (isHtmlEmpty(responseContent)) {
      appToast.error(tInquiry('placeholder.write_response'));
      return;
    }

    if (sendNotification && notificationChannels.length === 0) {
      appToast.error(tInquiry('placeholder.select_send_channel'));
      return;
    }

    try {
      setIsUploadingAttachments(true);

      const uploadedFiles = await uploadAttachmentFiles(replyAttachments, FileType.INQUIRY_ATTACHMENTS);
      const attachmentsPayload = uploadedFiles.map((file) => ({
        key: file.path || file.url,
        name: file.name,
        url: file.url,
        size: file.size,
      }));

      const body = {
        reply_content: responseContent.trim(),
        contact_phone: contactPhone.trim() || undefined,
        attachments: attachmentsPayload,
        send_notification: sendNotification,
        notification_channels: sendNotification ? notificationChannels : [],
        channels: sendNotification ? notificationChannels : [],
      };

      updateReply(
        {
          inquiryId,
          replyId: String(reply.id),
          body,
        },
        {
          onSuccess: () => {
            onOpenChange(false);
            appToast.success(tCommon('notify.success_update'));
          },
          onError: (error) => {
            appToast.error(error.message || tCommon('notify.fail_update'));
          },
        },
      );
    } catch (error: any) {
      appToast.error(error?.message || tCommon('notify.fail_upload'));
    } finally {
      setIsUploadingAttachments(false);
    }
  };

  const isSubmitting = isUpdatingReply || isUploadingAttachments;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[90dvh] w-full max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl p-0 sm:max-w-3xl lg:max-w-4xl'>
        <DialogHeader className='shrink-0 px-4 pt-5 pb-2 sm:px-6 sm:pt-6'>
          <DialogTitle className='text-lg font-semibold text-gray-900'>
            {tInquiry('button.update_response') || 'Edit Reply'}
          </DialogTitle>
        </DialogHeader>

        <div className='flex-1 space-y-4 overflow-y-auto px-4 py-3 sm:px-6 sm:py-4'>
          {/* Content Field */}
          <div className='space-y-1.5'>
            <Label className='text-sm font-medium'>
              {tInquiry('field.response_content')}
              <span className='ml-0.5 text-red-500'>*</span>
            </Label>
            <AppRichTextEditor
              placeholder={tInquiry('placeholder.write_response')}
              value={responseContent}
              onValueChange={setResponseContent}
              minHeight={160}
              imageUploadMode='immediate'
              imageFileType={FileType.INQUIRY_ATTACHMENTS}
              disabled={isSubmitting}
            />
          </div>

          {/* Contact Phone Field */}
          <div className='space-y-1.5'>
            <Label className='text-sm font-medium'>{tInquiry('field.phone')}</Label>
            <Input
              placeholder={tInquiry('placeholder.customer_contact_phone')}
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Attachments Field */}
          <div className='space-y-1.5'>
            <Label className='text-sm font-medium'>{tInquiry('field.attachments')}</Label>
            <AttachmentFile
              value={replyAttachments}
              onChange={(val) => setReplyAttachments(Array.isArray(val) ? val : val ? [val] : [])}
              multiple
              accept='*'
              uploading={isSubmitting}
              disabled={isSubmitting}
            />
            <p className='text-muted-foreground mt-1 text-xs'>
              {tInquiry('label.attachment_limit', { count: replyAttachments.length })}
            </p>
          </div>

          {/* Send Notification Card */}
          <div className='rounded-lg border border-gray-200 bg-gray-50/60 p-3.5 transition-colors'>
            <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
              <label className='flex cursor-pointer items-center gap-2.5 select-none'>
                <Checkbox
                  checked={sendNotification}
                  onCheckedChange={(checked) => handleToggleSendNotification(Boolean(checked))}
                  disabled={isSubmitting}
                />
                <div>
                  <p className='text-sm font-medium text-gray-900'>
                    {tInquiry('field.send_notification') || 'Send Notification'}
                  </p>
                  <p className='text-muted-foreground text-xs'>
                    {tInquiry('label.send_notification_hint') || 'Notify customer via selected channels'}
                  </p>
                </div>
              </label>

              {sendNotification && (
                <div className='flex items-center gap-4 rounded-md border border-gray-200 bg-white px-3 py-1.5 shadow-xs'>
                  <label className='flex cursor-pointer items-center gap-2 text-xs font-medium select-none'>
                    <Checkbox
                      checked={notificationChannels.includes('email')}
                      onCheckedChange={() => toggleNotificationChannel('email')}
                      disabled={isSubmitting}
                    />
                    <span>{tInquiry('label.email') || 'Email'}</span>
                  </label>
                  <div className='h-3.5 w-px bg-gray-200' />
                  <label className='flex cursor-pointer items-center gap-2 text-xs font-medium select-none'>
                    <Checkbox
                      checked={notificationChannels.includes('kakao')}
                      onCheckedChange={() => toggleNotificationChannel('kakao')}
                      disabled={isSubmitting}
                    />
                    <span>{tInquiry('label.kakao_talk') || 'KakaoTalk'}</span>
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <DialogFooter className='flex shrink-0 flex-col-reverse justify-end gap-2 border-t border-gray-100 bg-gray-50/50 px-4 py-3 sm:flex-row sm:px-6 sm:py-4'>
          <Button variant='outline' onClick={() => onOpenChange(false)} disabled={isSubmitting} className='w-full sm:w-auto'>
            {tCommon('button.cancel')}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSubmitting || isHtmlEmpty(responseContent) || (sendNotification && notificationChannels.length === 0)}
            className='w-full gap-2 bg-amber-500 text-white hover:bg-amber-600 sm:w-auto'>
            {isSubmitting ? <Loader2 className='size-4 animate-spin' /> : <Save className='size-4' />}
            {tCommon('button.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditReplyModal;
