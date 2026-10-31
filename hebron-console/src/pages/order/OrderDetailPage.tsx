import Can from '@/components/Can';
import PageTitle from '@/components/PageTitle';
import { appToast } from '@/components/toast/AppToast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { uploadFileAPI } from '@/data/file/file.api';
import { updateOrderDraftStatusAPI } from '@/data/order/order.api';
import { ORDER_QUERY_KEYS, useOrderDetailQuery, useUploadDesignRevisionMutation } from '@/data/order/order.query';
import type { OrderItemRESP } from '@/data/order/order.response';
import { usePaymentListQuery } from '@/data/payment/payment.query';
import { normalizeOrderDetail, validateOrderDraftUpload } from '@/data/order/order.service';
import { cn } from '@/lib/utils';
import { DATE_HOUR_MINUTE, DATE_TIME_SHORT_FORMAT } from '@/utils/constants/date.constant';
import { ORDER_STATUS_BADGE } from '@/utils/constants/order.constant';
import { MY_ROUTE } from '@/utils/constants/route.constant';
import { FileType } from '@/utils/enums/file.enum';
import { DraftStatus, OrderStatus } from '@/utils/enums/order.enum';
import { PaymentSortby } from '@/utils/enums/payment.enum';
import { downloadBlob, formatCurrency, formatDate, formatFileSize, getFileUrl } from '@/utils/helper/common.helper';
import { useQueryClient } from '@tanstack/react-query';
import { Download, Image, Package, Upload } from 'lucide-react';

import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import DesignGroupPreviewModal from './components/DesignGroupPreviewModal';
import OrderBasicInfoSection from './components/OrderBasicInfoSection';
import OrderPrintPdfDialog from './components/OrderPrintPdfDialog';
import OrderStatusHistorySection from './components/OrderStatusHistorySection';

const OrderDetailPage = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const { t: tEnum } = useTranslation('enum');
  const { t: tOrder } = useTranslation('order');
  const { t: tSidebar } = useTranslation('sidebar');
  const { t: tCommon } = useTranslation('common');

  const { data: order, isLoading, refetch } = useOrderDetailQuery(id);
  const { data: paymentListResponse, isLoading: isPaymentLoading } = usePaymentListQuery({
    order_number: id,
    page: 1,
    per_page: 1,
    sort_by: PaymentSortby.CREATED_AT,
    sort_order: 'desc',
  });
  const { mutateAsync: uploadDesignRevision } = useUploadDesignRevisionMutation();

  const handleRefetchOrderData = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: [ORDER_QUERY_KEYS.STATUS_HISTORY] });
  };

  const [showReworkForm, setShowReworkForm] = useState(false);
  const [reworkReasonDraft, setReworkReasonDraft] = useState('');
  const [isUploadingDraft, setIsUploadingDraft] = useState(false);
  const [showPrintPdfDialog, setShowPrintPdfDialog] = useState(false);
  const [designPreview, setDesignPreview] = useState<{
    title: string;
    previewFront: string;
    previewBack?: string;
  } | null>(null);
  const draftInputRef = useRef<HTMLInputElement>(null);

  const {
    memberName,
    recipientName,
    recipientPhone,
    shippingAddress,
    paymentAmount,
    statusKey,
    statusLabel,
    items,
    draftStatus,
  } = useMemo(() => normalizeOrderDetail(order, tEnum as any), [order, tEnum]);
  const lastDesignRevision = order?.last_design_revision;
  const productInformationItems = order?.product_information?.items || [];
  const designEditorItems = productInformationItems.filter((item) => Boolean(item.design_group));
  const hasDesignEditorItems = designEditorItems.length > 0;
  const designConfirmationUrl = lastDesignRevision
    ? `https://hebron-mall.axndx.org/confirm-design/${lastDesignRevision.slug}`
    : undefined;

  if (isLoading) {
    return (
      <main className='flex min-h-[400px] items-center justify-center space-y-5'>
        <Spinner className='size-8' />
      </main>
    );
  }

  if (!order) {
    return (
      <main className='space-y-5'>
        <PageTitle title={tSidebar('order_management')} returnLink={MY_ROUTE.ORDER.LIST} />
        <p className='text-muted-foreground text-sm'>{tOrder('empty.no_orders')}</p>
      </main>
    );
  }

  const isOrderActionLocked = order.status === OrderStatus.AWAITING_PAYMENT;
  const payment = paymentListResponse?.data?.payments?.[0];

  const handleDraftFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (isOrderActionLocked) return;
    if (!files.length) return;

    if (!items.length || files.length !== items.length) {
      appToast.error(tOrder('notify.draft_file_count_mismatch', { count: items.length }));
      return;
    }

    const invalidFile = files
      .map((file) => validateOrderDraftUpload(order.order_number, file))
      .find((validation) => !validation.valid);
    if (invalidFile) {
      appToast.error(invalidFile.errorMessage || tCommon('notify.something_went_wrong'));
      return;
    }

    setIsUploadingDraft(true);
    try {
      const uploadedFiles = await Promise.all(files.map((file) => uploadFileAPI(file, FileType.DESIGN_REVISIONS)));

      await uploadDesignRevision({
        orderNumber: order.order_number,
        files: uploadedFiles.map((response) => ({
          url: response.data.file.url,
          name: response.data.file.name,
          size: response.data.file.size,
        })),
      });

      appToast.success(tOrder('notify.draft_upload_notification_sent'));
      handleRefetchOrderData();
    } catch (err: any) {
      appToast.error(err?.response?.data?.message || tCommon('notify.something_went_wrong'));
    } finally {
      setIsUploadingDraft(false);
    }
  };

  const handleDownloadFile = async (fileURL?: string, fileName?: string) => {
    if (!fileURL) return;
    try {
      const fullUrl = getFileUrl(fileURL);
      const response = await fetch(fullUrl);
      const blob = await response.blob();
      downloadBlob(blob, fileName || 'download');
    } catch (error) {
      console.error('Failed to download file:', error);
      window.open(getFileUrl(fileURL), '_blank');
    }
  };

  const handleMarkReadyForPrint = async () => {
    if (isOrderActionLocked) return;

    try {
      await updateOrderDraftStatusAPI({
        order_id: order.id,
        draft_status: DraftStatus.READY_FOR_PRINT,
      });
      appToast.success(tCommon('notify.success_update'));
      handleRefetchOrderData();
    } catch {
      appToast.error(tCommon('notify.something_went_wrong'));
    }
  };

  const handleSubmitRework = async () => {
    if (isOrderActionLocked || !reworkReasonDraft.trim()) return;

    try {
      await updateOrderDraftStatusAPI({
        order_id: order.id,
        draft_status: DraftStatus.REQUEST_REWORK,
        rework_reason: reworkReasonDraft.trim(),
      });
      setShowReworkForm(false);
      setReworkReasonDraft('');
      appToast.success(tCommon('notify.success_update'));
      handleRefetchOrderData();
    } catch {
      appToast.error(tCommon('notify.something_went_wrong'));
    }
  };

  return (
    <main className='space-y-5'>
      <PageTitle title={tSidebar('order_management')} returnLink={MY_ROUTE.ORDER.LIST} />

      {/* Header */}
      <div className='space-y-1.5'>
        <p className='text-muted-foreground text-xs'>{order.order_number}</p>
        <h1 className='text-xl font-semibold'>{memberName}</h1>
        <Badge className={cn(ORDER_STATUS_BADGE[statusKey] || 'bg-gray-100 text-gray-700')}>{statusLabel}</Badge>
        <p className='text-muted-foreground text-xs'>
          {formatDate(order.created_at, DATE_TIME_SHORT_FORMAT)} · {tOrder('label.updated_at')}:{' '}
          {formatDate(order.updated_at, DATE_TIME_SHORT_FORMAT)}
        </p>
      </div>

      <div className='space-y-5'>
        {/* Basic Information */}
        <OrderBasicInfoSection
          order={order}
          memberName={memberName}
          recipientName={recipientName}
          recipientPhone={recipientPhone}
          shippingAddress={shippingAddress}
          paymentAmount={paymentAmount}
          payment={payment}
          isPaymentLoading={isPaymentLoading}
          isOrderActionLocked={isOrderActionLocked}
          onRefetchOrder={handleRefetchOrderData}
        />

        {/* Product Information */}
        <section className='space-y-4 rounded-md border border-gray-200 p-5'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <h2 className='flex items-center gap-2 text-sm font-semibold'>
              <Package className='size-4' />
              {tOrder('section.product_information')}
            </h2>
            {hasDesignEditorItems && (
              <Button variant='outline' size='sm' className='gap-1.5' onClick={() => setShowPrintPdfDialog(true)}>
                <Download className='size-3.5' />
                {tOrder('button.download_print_pdf')}
              </Button>
            )}
          </div>
          {items.length === 0 ? (
            <p className='text-muted-foreground py-4 text-center text-sm'>{tOrder('empty.no_orders')}</p>
          ) : (
            <div className='space-y-3'>
              {items.map((item: OrderItemRESP, idx: number) => {
                const snapshot = item.configuration?.product_snapshot;
                const specification = snapshot?.specification;
                const designContent = item.order_design_content;
                const designGroup = item.design_group;
                const previewFront = designGroup?.metadata?.preview_front;
                const previewBack = designGroup?.metadata?.preview_back;
                const title = item.title || snapshot?.name || '-';
                const productImage = snapshot?.images?.[0];
                const selectedOptions = Array.isArray(item.configuration?.selected_option_values)
                  ? item.configuration.selected_option_values
                  : [];
                const quantity = item.quantity ?? 1;
                const sellingPrice = Number(item.selling_price ?? 0);
                const optionPrice = Number(item.option_price ?? 0);
                const subtotalAmount = Number(item.sub_total_amount ?? sellingPrice + optionPrice);
                const taxAmount = Number(item.tax_amount ?? subtotalAmount * 0.1);
                const totalAmount = Number(item.total_amount ?? subtotalAmount + taxAmount);

                return (
                  <article key={item.id || idx} className='rounded-md border border-gray-200 bg-gray-50/50 p-4'>
                    <div className='flex flex-col gap-4 sm:flex-row'>
                      <div className='flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white text-gray-400'>
                        {productImage ? (
                          <img src={getFileUrl(productImage)} alt={title} className='size-full object-cover' loading='lazy' />
                        ) : (
                          <Package className='size-8' aria-hidden='true' />
                        )}
                      </div>

                      <div className='min-w-0 flex-1 space-y-3'>
                        <h3 className='font-medium text-gray-900'>{title}</h3>
                        {specification && (
                          <dl className='space-y-1.5 text-sm'>
                            <div className='grid grid-cols-[5rem_1fr] gap-3'>
                              <dt className='text-muted-foreground'>{tOrder('field.size')}</dt>
                              <dd className='font-medium'>{specification.size || '-'}</dd>
                            </div>
                            <div className='grid grid-cols-[5rem_1fr] gap-3'>
                              <dt className='text-muted-foreground'>{tOrder('field.material')}</dt>
                              <dd className='font-medium'>{specification.materials || '-'}</dd>
                            </div>
                            <div className='grid grid-cols-[5rem_1fr] gap-3'>
                              <dt className='text-muted-foreground'>{tOrder('field.case')}</dt>
                              <dd className='font-medium'>{specification.case || '-'}</dd>
                            </div>
                          </dl>
                        )}
                        <dl className='grid grid-cols-2 gap-x-5 gap-y-3 border-y border-gray-200 py-3 text-sm sm:grid-cols-3'>
                          <div>
                            <dt className='text-muted-foreground text-xs'>{tOrder('field.quantity')}</dt>
                            <dd className='font-medium'>{quantity}</dd>
                          </div>
                          <div>
                            <dt className='text-muted-foreground text-xs'>{tOrder('field.unit_price')}</dt>
                            <dd className='font-medium'>{formatCurrency(sellingPrice)}</dd>
                          </div>
                          <div>
                            <dt className='text-muted-foreground text-xs'>{tOrder('field.option_price')}</dt>
                            <dd className='font-medium'>{formatCurrency(optionPrice)}</dd>
                          </div>
                          <div>
                            <dt className='text-muted-foreground text-xs'>{tOrder('field.subtotal_amount')}</dt>
                            <dd className='font-medium'>{formatCurrency(subtotalAmount)}</dd>
                          </div>
                          <div>
                            <dt className='text-muted-foreground text-xs'>{tOrder('field.tax_amount')}</dt>
                            <dd className='font-medium'>{formatCurrency(taxAmount)}</dd>
                          </div>
                          <div>
                            <dt className='text-muted-foreground text-xs'>{tOrder('field.total_amount')}</dt>
                            <dd className='font-semibold text-gray-900'>{formatCurrency(totalAmount)}</dd>
                          </div>
                        </dl>

                        <div className='space-y-1.5 text-sm'>
                          <p className='text-muted-foreground text-xs'>{tOrder('field.option')}</p>
                          {selectedOptions.length === 0 ? (
                            <p className='text-muted-foreground'>-</p>
                          ) : (
                            <ul className='space-y-1'>
                              {selectedOptions.map((selectedOption, optionIndex) => (
                                <li key={selectedOption.option?.id || optionIndex} className='text-gray-700'>
                                  <span className='font-medium'>{selectedOption.group?.name || '-'}:</span>{' '}
                                  {selectedOption.option?.name || '-'} +{' '}
                                  {formatCurrency(Number(selectedOption.option?.additional_price || 0))}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        {designContent && (
                          <div className='space-y-3 rounded-md border border-gray-200 bg-white p-3 text-sm'>
                            <dl className='space-y-1.5'>
                              <div className='grid grid-cols-[8rem_1fr] gap-3'>
                                <dt className='text-muted-foreground'>{tOrder('field.design_content_title')}</dt>
                                <dd className='font-medium'>{designContent.title || '-'}</dd>
                              </div>
                              <div className='grid grid-cols-[8rem_1fr] gap-3'>
                                <dt className='text-muted-foreground'>{tOrder('field.design_recipient')}</dt>
                                <dd className='font-medium'>{designContent.recipient_name || '-'}</dd>
                              </div>
                              <div className='grid grid-cols-[8rem_1fr] gap-3'>
                                <dt className='text-muted-foreground'>{tOrder('field.design_event_date')}</dt>
                                <dd className='font-medium'>{designContent.event_date || '-'}</dd>
                              </div>
                              <div className='grid grid-cols-[8rem_1fr] gap-3'>
                                <dt className='text-muted-foreground'>{tOrder('field.design_main_text')}</dt>
                                <dd className='font-medium whitespace-pre-wrap'>{designContent.main_text || '-'}</dd>
                              </div>
                              <div className='grid grid-cols-[8rem_1fr] gap-3'>
                                <dt className='text-muted-foreground'>{tOrder('field.design_sender')}</dt>
                                <dd className='font-medium'>{designContent.sender_name || '-'}</dd>
                              </div>
                            </dl>

                            <div className='space-y-1.5'>
                              <p className='text-muted-foreground text-xs'>{tOrder('field.design_attachments')}</p>
                              {designContent.attachment_file_urls.length === 0 ? (
                                <p className='text-muted-foreground'>-</p>
                              ) : (
                                <ul className='space-y-1'>
                                  {designContent.attachment_file_urls.map((file, fileIndex) => (
                                    <li
                                      key={`${file.file_path}-${fileIndex}`}
                                      className='flex items-center justify-between gap-3 rounded bg-gray-50 px-2.5 py-2'>
                                      <span className='min-w-0 truncate font-medium'>
                                        {file.file_name}{' '}
                                        <span className='text-muted-foreground'>({formatFileSize(file.file_size)})</span>
                                      </span>
                                      <button
                                        type='button'
                                        onClick={() => handleDownloadFile(file.file_path, file.file_name)}
                                        className='flex shrink-0 cursor-pointer items-center gap-1 text-xs font-medium text-blue-600 hover:underline'>
                                        <Download className='size-3.5' />
                                        {tCommon('button.download')}
                                      </button>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>
                        )}

                        {designGroup && previewFront && (
                          <div className='space-y-2 rounded-md border border-gray-200 bg-white p-3 text-sm'>
                            <p className='font-medium text-gray-900'>
                              {designGroup.title || tOrder('label.design_group_preview')}
                            </p>
                            <div className='flex flex-wrap gap-3'>
                              {[
                                { label: tOrder('label.design_preview_front'), url: previewFront },
                                ...(previewBack ? [{ label: tOrder('label.design_preview_back'), url: previewBack }] : []),
                              ].map((preview) => (
                                <button
                                  key={preview.label}
                                  type='button'
                                  onClick={() =>
                                    setDesignPreview({
                                      title: designGroup.title || tOrder('label.design_group_preview'),
                                      previewFront,
                                      previewBack,
                                    })
                                  }
                                  className='group flex w-32 flex-col overflow-hidden rounded-md border border-gray-200 text-left transition-colors hover:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none'>
                                  <img
                                    src={getFileUrl(preview.url)}
                                    alt={`${designGroup.title || tOrder('label.design_group_preview')} - ${preview.label}`}
                                    className='h-24 w-full object-cover'
                                    loading='lazy'
                                  />
                                  <span className='flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-blue-600 group-hover:underline'>
                                    <Image className='size-3.5' />
                                    {preview.label}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Draft File Management */}
        <section className='space-y-4 rounded-md border border-gray-200 p-5'>
          <div className='flex items-center justify-between'>
            <h2 className='flex items-center gap-2 text-sm font-semibold'>
              <Upload className='size-4' />
              {tOrder('section.draft_file_management')}
            </h2>
            {lastDesignRevision && (
              <div className='flex items-center gap-3'>
                <Badge
                  className={cn(
                    lastDesignRevision.status === 'approve'
                      ? 'bg-green-100 text-green-700'
                      : lastDesignRevision.status === 'modify'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-gray-100 text-gray-700',
                  )}>
                  {(tEnum as any)(`design_revision.${lastDesignRevision.status}`, lastDesignRevision.status)}
                </Badge>
                <span className='text-muted-foreground text-xs'>
                  {formatDate(lastDesignRevision.created_at, DATE_HOUR_MINUTE)}
                </span>
              </div>
            )}
          </div>

          {designConfirmationUrl && (
            <a
              href={designConfirmationUrl}
              target='_blank'
              rel='noreferrer'
              className='block w-fit text-xs text-blue-600 hover:underline'>
              {designConfirmationUrl}
            </a>
          )}

          {!lastDesignRevision?.files.length ? (
            <p className='text-muted-foreground text-sm'>{tOrder('empty.no_draft_files')}</p>
          ) : (
            <ul className='space-y-1.5'>
              {lastDesignRevision.files.map((file, idx) => {
                const title = file.name || `file_${idx + 1}`;
                return (
                  <li
                    key={`${file.url}-${idx}`}
                    className='flex items-center justify-between rounded-md bg-gray-50 p-2.5 text-sm'>
                    <div className='flex items-center gap-2'>
                      <span className='font-medium'>{title}</span>
                      <span className='text-muted-foreground text-xs'>({formatFileSize(file.size)})</span>
                    </div>
                    <button
                      type='button'
                      onClick={() => handleDownloadFile(file.url, title)}
                      className='flex cursor-pointer items-center gap-1 text-xs font-medium text-blue-600 hover:underline'>
                      <Download className='size-3.5' />
                      {tCommon('button.download')}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {lastDesignRevision && (
            <div className='rounded-md bg-gray-50 p-3 text-sm'>
              <p className='text-muted-foreground mb-1 text-xs'>{tOrder('field.comment')}</p>
              <p className='whitespace-pre-wrap'>{lastDesignRevision.comments.join('\n') || '-'}</p>
            </div>
          )}

          <div>
            <input
              ref={draftInputRef}
              type='file'
              accept='.pdf,.ai,.jpg,.jpeg,.png'
              multiple
              className='hidden'
              onChange={handleDraftFileSelected}
            />
            <Can action='edit'>
              <Button
                variant='outline'
                size='sm'
                className='gap-1.5'
                disabled={isOrderActionLocked || isUploadingDraft || lastDesignRevision?.status === 'approve'}
                onClick={() => draftInputRef.current?.click()}>
                {isUploadingDraft ? <Spinner className='size-3.5' /> : <Upload className='size-3.5' />}
                {tOrder('button.upload_draft')}
              </Button>
            </Can>
            <p className='text-muted-foreground mt-3 text-xs'>{tOrder('label.draft_file_count_help', { count: items.length })}</p>
          </div>

          {draftStatus === DraftStatus.DRAFT_CONFIRMATION_REQUEST && (
            <div className='space-y-2 rounded-md border border-dashed border-gray-300 p-3'>
              {!showReworkForm ? (
                <Can action='edit'>
                  <div className='flex gap-2'>
                    <Button size='sm' onClick={handleMarkReadyForPrint} disabled={isOrderActionLocked}>
                      {tOrder('button.mark_ready_for_print')}
                    </Button>
                    <Button variant='outline' size='sm' onClick={() => setShowReworkForm(true)} disabled={isOrderActionLocked}>
                      {tOrder('button.request_rework')}
                    </Button>
                  </div>
                </Can>
              ) : (
                <div className='space-y-2'>
                  <Textarea
                    placeholder={tOrder('placeholder.enter_rework_reason')}
                    value={reworkReasonDraft}
                    onChange={(e) => setReworkReasonDraft(e.target.value)}
                    rows={2}
                    disabled={isOrderActionLocked}
                  />
                  <Can action='edit'>
                    <Button size='sm' onClick={handleSubmitRework} disabled={isOrderActionLocked || !reworkReasonDraft.trim()}>
                      {tOrder('button.confirm_rework')}
                    </Button>
                  </Can>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Status Change History */}
        <OrderStatusHistorySection orderId={id} />
      </div>

      {showPrintPdfDialog && (
        <OrderPrintPdfDialog
          key={order.order_number}
          orderNumber={order.order_number}
          items={designEditorItems.flatMap((item) =>
            item.design_group
              ? [
                  {
                    orderItemId: item.id,
                    designGroupId: item.design_group.id,
                    productName: item.title || item.configuration?.product_snapshot?.name || '',
                  },
                ]
              : [],
          )}
          onClose={() => setShowPrintPdfDialog(false)}
          onArtifactsChanged={handleRefetchOrderData}
        />
      )}

      {designPreview && (
        <DesignGroupPreviewModal
          open
          setOpen={(open) => !open && setDesignPreview(null)}
          title={designPreview.title}
          previewFront={designPreview.previewFront}
          previewBack={designPreview.previewBack}
        />
      )}
    </main>
  );
};

export default OrderDetailPage;
