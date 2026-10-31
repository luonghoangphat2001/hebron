import Can from '@/components/Can';
import PageTitle from '@/components/PageTitle';
import { ImageColumnPreview, ImagePreviewDialog } from '@/components/dialog/ImagePreviewDialog';
import { appToast } from '@/components/toast/AppToast';
import AttachmentFile, { type AttachmentFileValue, uploadAttachmentFiles } from '@/components/upload/AttachmentFile';
import { InquiryResponseHistory } from './components/InquiryResponseHistory';
import { InquiryPersonInChargeCell, InquiryStatusCell, InquiryTypeCell } from './components/InquiryTableCells';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { AppRichTextEditor } from '@/components/shared/app-rich-text-editor';
import { Textarea } from '@/components/ui/textarea';
import {
  useInquiryAuditLogListQuery,
  useInquiryDetailQuery,
  useInquiryMemoCreateMutation,
  useInquiryMemoListQuery,
  useInquiryRelatedListQuery,
  useInquiryReplyCreateMutation,
  useInquiryReplyListQuery,
  useInquiryTimelineListQuery,
} from '@/data/inquiry/inquiry.query';
import type {
  InquiryAuditLogItemRESP,
  InquiryMemoRESP,
  InquiryTimelineItemRESP,
  RelatedInquiryRESP,
} from '@/data/inquiry/inquiry.response';
import { cn } from '@/lib/utils';
import { DATE_TIME_SHORT_FORMAT } from '@/utils/constants/date.constant';
import { INQUIRY_STATUS_BADGE } from '@/utils/constants/inquiry.constant';
import { MY_ROUTE } from '@/utils/constants/route.constant';
import { FileType } from '@/utils/enums/file.enum';
import {
  downloadBlob,
  formatCurrency,
  formatDate,
  formatFileSize,
  formatPhone,
  getFileUrl,
  isImageSource,
} from '@/utils/helper/common.helper';
import { sanitizeHtml } from '@/utils/helper/string.helper';
import { ChevronDown, ChevronUp, Clock, Download, FileText, Paperclip, Plus, Send, StickyNote } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

const InquiryDetailPage = () => {
  const { t: tEnum } = useTranslation('enum');
  const { t: tInquiry } = useTranslation('inquiry');
  const { t: tCommon } = useTranslation('common');
  const { t: tSidebar } = useTranslation('sidebar');
  const { id } = useParams<{ id: string }>();

  const [responseContent, setResponseContent] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [sendNotification, setSendNotification] = useState<boolean>(true);
  const [notificationChannels, setNotificationChannels] = useState<string[]>(['email']);

  const [isAddMemoOpen, setIsAddMemoOpen] = useState(false);
  const [memoContent, setMemoContent] = useState('');
  const [isAuditLogOpen, setIsAuditLogOpen] = useState(true);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [replyAttachments, setReplyAttachments] = useState<AttachmentFileValue[]>([]);
  const [isUploadingAttachments, setIsUploadingAttachments] = useState(false);

  const { data: inquiry, isLoading } = useInquiryDetailQuery(id || '');
  const { data: replyList } = useInquiryReplyListQuery(id || '');
  const { data: memoList } = useInquiryMemoListQuery(id || '');
  const { data: auditLogList } = useInquiryAuditLogListQuery(id || '');
  const { data: timelineList } = useInquiryTimelineListQuery(id || '');
  const { data: relatedInquiriesList } = useInquiryRelatedListQuery(id || '');

  const { mutate: createReply, isPending: isSubmittingReply } = useInquiryReplyCreateMutation();
  const { mutate: createMemo, isPending: isCreatingMemo } = useInquiryMemoCreateMutation();

  const handleImageDownload = async (fileURL?: string, fileName?: string) => {
    if (!fileURL) return;
    try {
      const fullUrl = getFileUrl(fileURL);
      const response = await fetch(fullUrl);
      const blob = await response.blob();
      downloadBlob(blob, fileName || 'download');
    } catch (error) {
      console.error('Failed to download file:', error);
    }
  };

  const handleCreateMemo = () => {
    if (!id || !memoContent.trim()) {
      appToast.error(tInquiry('placeholder.write_memo') || 'Please enter memo content');
      return;
    }
    createMemo(
      { inquiryId: id, body: { content: memoContent.trim() } },
      {
        onSuccess: () => {
          setMemoContent('');
          setIsAddMemoOpen(false);
          appToast.success(tCommon('notify.success_create'));
        },
        onError: (error) => {
          appToast.error(error.message || tCommon('notify.fail_create'));
        },
      },
    );
  };

  const resetResponseForm = () => {
    setResponseContent('');
    setContactPhone('');
    setReplyAttachments([]);
    setSendNotification(true);
    setNotificationChannels(['email']);
  };

  const toggleNotificationChannel = (channel: string) =>
    setNotificationChannels((prev) => (prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel]));

  const handleToggleSendNotification = (checked: boolean) => {
    setSendNotification(checked);
    if (checked && notificationChannels.length === 0) {
      setNotificationChannels(['email']);
    }
  };

  const isHtmlEmpty = (html?: string) => {
    if (!html) return true;
    const stripped = html.replace(/<[^>]*>/g, '').trim();
    return stripped.length === 0;
  };

  const handleSendResponse = async () => {
    if (!id || isHtmlEmpty(responseContent)) {
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

      createReply(
        {
          id,
          body,
        },
        {
          onSuccess: () => {
            resetResponseForm();
            appToast.success(tCommon('notify.success_create'));
          },
          onError: (error) => {
            appToast.error(error.message || tCommon('notify.fail_create'));
          },
        },
      );
    } catch (error: any) {
      appToast.error(error?.message || tCommon('notify.fail_upload'));
    } finally {
      setIsUploadingAttachments(false);
    }
  };

  if (isLoading) {
    return (
      <main className='space-y-5'>
        <PageTitle title={tSidebar('inquiry_management')} returnLink={MY_ROUTE.INQUIRY.LIST} />
        <div className='py-12 text-center text-sm text-gray-500'>Loading...</div>
      </main>
    );
  }

  if (!inquiry) {
    return (
      <main className='space-y-5'>
        <PageTitle title={tSidebar('inquiry_management')} returnLink={MY_ROUTE.INQUIRY.LIST} />
        <div className='py-12 text-center text-sm text-gray-500'>Inquiry not found</div>
      </main>
    );
  }

  return (
    <main className='space-y-5'>
      <PageTitle title={tSidebar('inquiry_management')} returnLink={MY_ROUTE.INQUIRY.LIST} />

      {/* Header */}
      <div className='space-y-1.5'>
        <p className='text-muted-foreground text-xs'>{inquiry.inquiry_number}</p>
        <h1 className='text-xl font-semibold'>{inquiry.title}</h1>
        <div className='flex items-center gap-2'>
          <InquiryTypeCell type={inquiry.inquiry_type} />
          <InquiryStatusCell status={inquiry.status} />
        </div>
        <p className='text-muted-foreground text-xs'>
          {tInquiry('label.registered_at')}: {formatDate(inquiry.created_at, DATE_TIME_SHORT_FORMAT)} ·{' '}
          {tInquiry('label.updated_at')}: {formatDate(inquiry.updated_at, DATE_TIME_SHORT_FORMAT)}
        </p>
      </div>

      <div className='grid grid-cols-[1fr_300px] items-start gap-6'>
        {/* ── Left column ── */}
        <div className='space-y-5'>
          {/* Inquiry Content */}
          <section className='space-y-4 rounded-md border border-gray-200 p-5'>
            <h2 className='flex items-center gap-2 text-sm font-semibold'>
              <FileText className='size-4' />
              {tInquiry('section.inquiry_content')}
            </h2>
            {inquiry.content ? (
              <div
                className='text-sm whitespace-pre-wrap text-gray-700'
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(inquiry.content) }}
              />
            ) : (
              <div className='rounded-lg bg-gray-50 p-2 text-center text-sm text-gray-500'>{tInquiry('empty.no_content')}</div>
            )}
            <div>
              <p className='mb-2 text-sm font-medium'>{tInquiry('section.attached_files')}</p>
              {!inquiry.attachments || inquiry.attachments.length === 0 ? (
                <p className='text-muted-foreground text-sm'>{tInquiry('empty.no_attachments')}</p>
              ) : (
                <ul className='space-y-2'>
                  {inquiry.attachments.map((file) => {
                    const fileName = file.file_name || file.name || 'file';
                    const fileUrl = file.file_url || file.url || '';
                    const fileSize = file.file_size || file.size;
                    const fullUrl = getFileUrl(fileUrl);
                    const isImage = isImageSource({ name: fileName, url: fileUrl });

                    return (
                      <li
                        key={file.id}
                        className='flex items-center justify-between rounded-md border border-gray-100 bg-gray-50/60 p-2.5 text-sm transition-colors hover:bg-gray-100'>
                        <div className='flex items-center gap-3 overflow-hidden'>
                          {isImage ? (
                            <ImageColumnPreview
                              src={fullUrl}
                              alt={fileName}
                              className='size-10 shrink-0'
                              previewLabel={tCommon('button.preview') || 'Preview'}
                              onClick={() => setPreviewImageUrl(fullUrl)}
                            />
                          ) : (
                            <Paperclip className='size-4 shrink-0 text-gray-500' />
                          )}
                          <div className='min-w-0 flex-1'>
                            <p
                              className={cn(
                                'truncate font-medium',
                                isImage
                                  ? 'cursor-pointer text-gray-900 hover:underline'
                                  : 'cursor-pointer text-blue-600 hover:underline',
                              )}
                              onClick={() => {
                                if (isImage) {
                                  setPreviewImageUrl(fullUrl);
                                } else {
                                  handleImageDownload(fileUrl, fileName);
                                }
                              }}>
                              {fileName}
                            </p>
                            <p className='text-muted-foreground text-xs'>
                              {fileSize ? formatFileSize(fileSize) : ''}
                              {fileSize && file.uploaded_at ? ' · ' : ''}
                              {file.uploaded_at ? formatDate(file.uploaded_at, DATE_TIME_SHORT_FORMAT) : ''}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-8 w-8 shrink-0 p-0 text-gray-500 hover:text-gray-900'
                          title={tCommon('button.download') || 'Download'}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleImageDownload(fileUrl, fileName);
                          }}>
                          <Download className='size-4' />
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>

          {/* Register Answer */}
          <section className='space-y-4 rounded-md border border-gray-200 p-5'>
            <h2 className='flex items-center gap-2 text-sm font-semibold'>
              <Send className='size-4' />
              {tInquiry('section.register_answer')}
            </h2>

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
                disabled={isSubmittingReply || isUploadingAttachments}
              />
            </div>

            <div className='space-y-1.5'>
              <Label className='text-sm font-medium'>{tInquiry('field.contact_phone')}</Label>
              <Input
                placeholder={tInquiry('placeholder.customer_contact_phone')}
                value={contactPhone}
                onChange={(e) => setContactPhone(formatPhone(e.target.value))}
              />
            </div>

            <div className='space-y-1.5'>
              <Label className='text-sm font-medium'>{tInquiry('field.attachments')}</Label>
              <AttachmentFile
                value={replyAttachments}
                onChange={(val) => setReplyAttachments(Array.isArray(val) ? val : val ? [val] : [])}
                multiple
                accept='*'
                uploading={isSubmittingReply || isUploadingAttachments}
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
                    disabled={isSubmittingReply || isUploadingAttachments}
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
                        disabled={isSubmittingReply || isUploadingAttachments}
                      />
                      <span>{tInquiry('label.email') || 'Email'}</span>
                    </label>
                    <div className='h-3.5 w-px bg-gray-200' />
                    <label className='flex cursor-pointer items-center gap-2 text-xs font-medium select-none'>
                      <Checkbox
                        checked={notificationChannels.includes('kakao')}
                        onCheckedChange={() => toggleNotificationChannel('kakao')}
                        disabled={isSubmittingReply || isUploadingAttachments}
                      />
                      <span>{tInquiry('label.kakao_talk') || 'KakaoTalk'}</span>
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <Can action='register'>
                <Button
                  onClick={handleSendResponse}
                  disabled={isSubmittingReply || isUploadingAttachments}
                  className='gap-2 bg-amber-500 text-white hover:bg-amber-600'>
                  <Send className='size-3.5' />
                  {tInquiry('button.send_response')}
                </Button>
              </Can>
            </div>
          </section>

          {/* Response History */}
          <InquiryResponseHistory
            replyList={replyList}
            onPreviewImage={(url) => setPreviewImageUrl(url)}
            onDownloadFile={handleImageDownload}
          />

          {/* Internal Memos */}
          <section className='space-y-4 rounded-md border border-gray-200 p-5'>
            <div className='flex items-center justify-between'>
              <h2 className='flex items-center gap-2 text-sm font-semibold'>
                <StickyNote className='size-4' />
                {tInquiry('section.internal_memos')}
              </h2>
              <Can action='register'>
                <Button
                  size='sm'
                  variant='outline'
                  className='h-7 gap-1.5 text-xs'
                  onClick={() => setIsAddMemoOpen((prev) => !prev)}>
                  <Plus className='size-3' />
                  {tInquiry('button.add_memo')}
                </Button>
              </Can>
            </div>

            {isAddMemoOpen && (
              <div className='space-y-2 rounded-md bg-gray-50 p-3'>
                <Textarea
                  placeholder={tInquiry('placeholder.write_memo')}
                  value={memoContent}
                  onChange={(e) => setMemoContent(e.target.value)}
                  className='min-h-20 resize-none text-sm'
                />
                <div className='flex justify-end gap-2'>
                  <Button size='sm' variant='outline' onClick={() => setIsAddMemoOpen(false)}>
                    {tCommon('button.cancel')}
                  </Button>
                  <Button size='sm' onClick={handleCreateMemo} disabled={isCreatingMemo || !memoContent.trim()}>
                    {tCommon('button.save')}
                  </Button>
                </div>
              </div>
            )}

            {!memoList || memoList.length === 0 ? (
              <p className='text-muted-foreground text-sm'>{tInquiry('empty.no_memos')}</p>
            ) : (
              <ul className='space-y-2'>
                {memoList.map((memo: InquiryMemoRESP) => (
                  <li key={memo.id} className='rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm'>
                    <p className='text-gray-800'>{memo.content}</p>
                    <p className='text-muted-foreground mt-1 text-xs'>
                      {typeof memo.created_by === 'object' ? memo.created_by.name : memo.created_by || '-'} ·{' '}
                      {formatDate(memo.created_at, DATE_TIME_SHORT_FORMAT)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Activity Log */}
          <Collapsible
            open={isAuditLogOpen}
            onOpenChange={setIsAuditLogOpen}
            className='space-y-4 rounded-md border border-gray-200 p-5'>
            <div className='flex items-center justify-between'>
              <h2 className='flex items-center gap-2 text-sm font-semibold'>
                <Clock className='size-4' />
                {tInquiry('section.activity_log')}
              </h2>
              <CollapsibleTrigger asChild>
                <Button variant='ghost' size='sm' className='h-7 w-7 p-0'>
                  {isAuditLogOpen ? <ChevronUp className='size-4' /> : <ChevronDown className='size-4' />}
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent>
              {auditLogList && auditLogList.length > 0 ? (
                <ul>
                  {auditLogList.map((log: InquiryAuditLogItemRESP, idx) => (
                    <li key={log.id} className='flex gap-3 text-sm'>
                      <div className='flex flex-col items-center pt-1.5'>
                        <div className='size-2 shrink-0 rounded-full bg-gray-400' />
                        {idx < auditLogList.length - 1 && <div className='mt-1 w-px flex-1 bg-gray-200' />}
                      </div>
                      <div className='flex-1 pb-3'>
                        <div className='flex items-center justify-between'>
                          <span className='text-xs font-medium'>{log.action}</span>
                          <span className='text-muted-foreground text-xs'>
                            {formatDate(log.changed_at, DATE_TIME_SHORT_FORMAT)}
                          </span>
                        </div>
                        <p className='text-muted-foreground text-xs'>
                          {tInquiry('label.actor')}: {log.changed_by?.name || '-'}
                        </p>
                        {log.field && (
                          <p className='text-muted-foreground text-xs'>
                            {log.field}: {log.old_value || '-'} &rarr; {log.new_value || '-'}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : !inquiry.activity_log || inquiry.activity_log.length === 0 ? (
                <p className='text-muted-foreground text-sm'>No activity logs</p>
              ) : (
                <ul>
                  {inquiry.activity_log.map((entry, idx) => (
                    <li key={entry.id} className='flex gap-3 text-sm'>
                      <div className='flex flex-col items-center pt-1.5'>
                        <div className='size-2 shrink-0 rounded-full bg-gray-400' />
                        {idx < (inquiry.activity_log?.length || 0) - 1 && <div className='mt-1 w-px flex-1 bg-gray-200' />}
                      </div>
                      <div className='flex-1 pb-3'>
                        <div className='flex items-center justify-between'>
                          <span className='text-xs font-medium'>{tEnum(`common.${entry.action}`)}</span>
                          <span className='text-muted-foreground text-xs'>{entry.created_at}</span>
                        </div>
                        <p className='text-muted-foreground text-xs'>
                          {tInquiry('label.actor')}: {entry.actor || '-'}
                        </p>
                        {entry.changes &&
                          Object.entries(entry.changes).map(([key, val]) => (
                            <p key={key} className='text-muted-foreground text-xs'>
                              {key
                                .split('_')
                                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                                .join(' ')}
                              : {typeof val === 'object' ? JSON.stringify(val) : val}
                            </p>
                          ))}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* ── Right sidebar ── */}
        <div className='space-y-4'>
          {/* Inquiry Information */}
          <SideCard title={tInquiry('section.inquiry_information')}>
            <InfoRow label={tInquiry('field.customer')} value={inquiry?.customer_name} />
            <InfoRow label={tInquiry('field.inquirer')} value={inquiry?.inquirer_name} />
            <InfoRow label={tInquiry('field.email')} value={inquiry?.inquirer_email} />
            <InfoRow label={tInquiry('field.phone')} value={inquiry?.inquirer_phone} />
            <InfoRow label={tInquiry('field.department')} value={inquiry?.inquirer_department} />
            <InfoRow
              label={tInquiry('field.registration_date')}
              value={formatDate(inquiry?.created_at, DATE_TIME_SHORT_FORMAT)}
            />
            <InfoRow
              label={tInquiry('field.person_in_charge')}
              value={<InquiryPersonInChargeCell assignedTo={inquiry?.assigned_to} className='text-xs font-medium' />}
            />
            <InfoRow label={tInquiry('field.status')} value={<InquiryStatusCell status={inquiry.status} className='text-xs' />} />
            <InfoRow label={tInquiry('field.order')} value={inquiry.related_order_number} />
            <InfoRow label={tInquiry('field.design_draft')} value={inquiry.related_design_id} />
          </SideCard>

          {/* Product Information */}
          <SideCard title={tInquiry('section.product_information')}>
            <InfoRow label={tInquiry('field.product_code')} value={inquiry.product?.id} />
            <InfoRow label={tInquiry('field.product_name')} value={inquiry.product?.name} />
            <InfoRow
              label={tInquiry('field.image')}
              value={(() => {
                const rawImage = inquiry.product?.images?.[0] || inquiry.product?.image;
                if (!rawImage) return '-';
                const fullUrl = getFileUrl(rawImage);
                return (
                  <div className='flex justify-end'>
                    <ImageColumnPreview
                      src={fullUrl}
                      alt={inquiry.product?.name || 'Product'}
                      className='size-12 rounded-md object-cover'
                      previewLabel={tCommon('button.preview') || 'Preview'}
                      onClick={() => setPreviewImageUrl(fullUrl)}
                    />
                  </div>
                );
              })()}
            />
            <InfoRow
              label={tInquiry('field.price')}
              value={inquiry.product?.price != null ? formatCurrency(Number(inquiry.product.price)) : '-'}
            />
          </SideCard>

          {/* Related Inquiries */}
          <SideCard title={tInquiry('section.related_inquiries')} description={tInquiry('label.related_inquiries_description')}>
            {(
              relatedInquiriesList
                ? relatedInquiriesList.length === 0
                : !inquiry.related_inquiries || inquiry.related_inquiries.length === 0
            ) ? (
              <p className='text-muted-foreground text-xs'>{tInquiry('empty.no_related')}</p>
            ) : (
              <ul className='space-y-2'>
                {(relatedInquiriesList || inquiry.related_inquiries || []).map((rel) => (
                  <RelatedInquiryCard key={rel.id} item={rel} statusLabel={tEnum(`inquiry.${rel.status}`)} />
                ))}
              </ul>
            )}
          </SideCard>

          {/* Timeline */}
          <SideCard title={tInquiry('section.timeline')}>
            {timelineList && timelineList.length > 0 ? (
              <ul>
                {timelineList.map((item: InquiryTimelineItemRESP, idx) => (
                  <TimelineItem
                    key={item.id}
                    color='bg-blue-400'
                    title={item.title || item.event_type_label || item.event_type}
                    description={item.description || ''}
                    meta={`${formatDate(item.created_at, DATE_TIME_SHORT_FORMAT)}${item.created_by ? ` · ${typeof item.created_by === 'object' ? item.created_by.name : item.created_by}` : ''}`}
                    last={idx === timelineList.length - 1}
                  />
                ))}
              </ul>
            ) : (
              <ul>
                <TimelineItem
                  color='bg-blue-400'
                  title={tInquiry('timeline.inquiry_created')}
                  description={inquiry.title}
                  meta={`${formatDate(inquiry.created_at, DATE_TIME_SHORT_FORMAT)} · ${inquiry.inquirer_name || '-'}`}
                  last={(!replyList || replyList.length === 0) && (!memoList || memoList.length === 0)}
                />
                {replyList?.map((reply, idx) => (
                  <TimelineItem
                    key={reply.id}
                    color='bg-green-400'
                    title={tInquiry('timeline.inquiry_answered')}
                    description={reply.content}
                    meta={`${formatDate(reply.created_at, DATE_TIME_SHORT_FORMAT)} · ${reply.created_by?.name || '-'}`}
                    last={idx === replyList.length - 1 && (!memoList || memoList.length === 0)}
                  />
                ))}
                {memoList?.map((memo, idx) => (
                  <TimelineItem
                    key={memo.id}
                    color='bg-yellow-400'
                    title={tInquiry('timeline.comment_added')}
                    description={memo.content}
                    meta={`${formatDate(memo.created_at, DATE_TIME_SHORT_FORMAT)} · ${typeof memo.created_by === 'object' ? memo.created_by.name : memo.created_by || '-'}`}
                    last={idx === memoList.length - 1}
                  />
                ))}
              </ul>
            )}
          </SideCard>
        </div>
      </div>

      <ImagePreviewDialog url={previewImageUrl} onClose={() => setPreviewImageUrl(null)} />
    </main>
  );
};

/* ── Shared sub-components ── */

function SideCard({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className='space-y-3 rounded-md border border-gray-200 p-4'>
      <h3 className='text-sm font-semibold'>{title}</h3>
      {description && <p className='text-muted-foreground -mt-2 text-xs'>{description}</p>}
      <Separator />
      {children}
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value?: ReactNode }) {
  return (
    <div className='flex justify-between gap-2 text-sm'>
      <span className='text-muted-foreground shrink-0 text-xs'>{label}</span>
      <span className='text-right text-xs font-medium break-all'>{value ?? '-'}</span>
    </div>
  );
}

function RelatedInquiryCard({ item, statusLabel }: { item: RelatedInquiryRESP; statusLabel: string }) {
  return (
    <li className='cursor-pointer space-y-1 rounded-md bg-gray-50 p-2.5 transition-colors hover:bg-gray-100'>
      <div className='flex items-center justify-between gap-1'>
        <Badge className={cn('py-0 text-xs', INQUIRY_STATUS_BADGE[item.status])}>{statusLabel}</Badge>
      </div>
      {item.inquiry_number && <p className='text-muted-foreground font-mono text-xs'>{item.inquiry_number}</p>}
      <p className='line-clamp-1 text-xs font-medium'>{item.title}</p>
      <p className='text-muted-foreground text-xs'>
        {item.relation_type_label && (
          <span className='text-muted-foreground text-xs font-normal'>{item.relation_type_label}</span>
        )}{' '}
        · {formatDate(item.created_at, DATE_TIME_SHORT_FORMAT)}
      </p>
    </li>
  );
}

function TimelineItem({
  color,
  title,
  description,
  meta,
  last,
}: {
  color: string;
  title: string;
  description: string;
  meta: string;
  last?: boolean;
}) {
  return (
    <li className='flex gap-3 text-xs'>
      <div className='flex flex-col items-center pt-1.5'>
        <div className={cn('size-2.5 shrink-0 rounded-full', color)} />
        {!last && <div className='mt-1 w-px flex-1 bg-gray-200' />}
      </div>
      <div className='flex-1 pb-3'>
        <p className='font-semibold'>{title}</p>
        <p className='line-clamp-2 text-gray-700'>{description}</p>
        <p className='text-muted-foreground'>{meta}</p>
      </div>
    </li>
  );
}

export default InquiryDetailPage;
