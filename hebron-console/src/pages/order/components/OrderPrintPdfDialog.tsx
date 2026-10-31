import { appToast } from '@/components/toast/AppToast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { downloadOrderItemPrintPdfAPI, getOrderItemPrintPdfUrl, getOrderPrintPdfManifestAPI } from '@/data/order/order.api';
import type { OrderPrintPdfFileRESP } from '@/data/order/order.response';
import { downloadBlob } from '@/utils/helper/common.helper';
import { isAxiosError } from 'axios';
import { Download } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  orderNumber: string;
  items: { orderItemId: number; designGroupId: number; productName: string }[];
  onClose: () => void;
  onArtifactsChanged: () => void;
};

const getDownloadErrorMessage = async (error: unknown, fallback: string) => {
  if (isAxiosError(error)) {
    const data = error.response?.data;
    if (data instanceof Blob) {
      try {
        const detail = JSON.parse(await data.text()) as { message?: unknown };
        if (typeof detail.message === 'string' && detail.message) return detail.message;
      } catch {
        // Keep the localized fallback for non-JSON error bodies.
      }
    } else if (typeof data?.message === 'string' && data.message) {
      return data.message;
    }
    return fallback;
  }
  return error instanceof Error ? error.message : fallback;
};

const OrderPrintPdfDialog = ({ orderNumber, items, onClose, onArtifactsChanged }: Props) => {
  const { t: tOrder } = useTranslation('order');
  const { t: tCommon } = useTranslation('common');
  // Direct item downloads remain available even when another item blocks the manifest.
  const [files, setFiles] = useState<OrderPrintPdfFileRESP[]>(() =>
    items.map(({ orderItemId, designGroupId }) => ({
      order_item_id: orderItemId,
      design_group_id: designGroupId,
      filename: `order-${orderNumber}-item-${orderItemId}-design-${designGroupId}-print.pdf`,
      download_url: getOrderItemPrintPdfUrl(orderNumber, orderItemId),
    })),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [manifestReady, setManifestReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeItemId, setActiveItemId] = useState<number | null>(null);
  const [sentItemIds, setSentItemIds] = useState<number[]>([]);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const busyRef = useRef(false);
  const isDownloading = activeItemId !== null;
  const downloadFilenames = useMemo(() => {
    const productNames = new Map(items.map((item) => [item.orderItemId, item.productName]));
    const entries = [...files]
      .sort((a, b) => a.order_item_id - b.order_item_id)
      .map((file) => {
        const name =
          Array.from((productNames.get(file.order_item_id) || '').normalize('NFC'))
            .filter((character) => character.charCodeAt(0) >= 32)
            .join('')
            .replace(/[<>:"/\\|?*]/g, '-')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 120)
            .replace(/[. ]+$/, '') || `item-${file.order_item_id}`;
        return { id: file.order_item_id, name, key: name.toLowerCase() };
      });
    const totals = new Map<string, number>();
    for (const { key } of entries) totals.set(key, (totals.get(key) || 0) + 1);
    const counters = new Map<string, number>();
    const usedNames = new Set<string>();
    return new Map(
      entries.map(({ id, name, key }) => {
        let index = (counters.get(key) || 0) + 1;
        let filename = `${orderNumber}-${name}${totals.get(key)! > 1 ? `-${index}` : ''}.pdf`;
        while (usedNames.has(filename.toLowerCase())) {
          filename = `${orderNumber}-${name}-${++index}.pdf`;
        }
        counters.set(key, index);
        usedNames.add(filename.toLowerCase());
        return [id, filename];
      }),
    );
  }, [files, items, orderNumber]);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setManifestReady(false);
    setErrorMessage('');
    getOrderPrintPdfManifestAPI(orderNumber)
      .then((manifest) => {
        if (!active) return;
        if (!manifest.success || !Array.isArray(manifest.data?.files) || !manifest.data.files.length) {
          throw new Error(tOrder('notify.print_pdf_unavailable'));
        }
        setFiles(manifest.data.files);
        setManifestReady(true);
      })
      .catch(async (error: unknown) => {
        const fallback = tOrder(
          isAxiosError(error) && error.response?.status === 409
            ? 'notify.print_pdf_unavailable'
            : 'notify.print_pdf_download_failed',
        );
        const message = await getDownloadErrorMessage(error, fallback);
        if (active) setErrorMessage(message);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [orderNumber, tOrder]);

  const handleDownload = async (selectedFiles: OrderPrintPdfFileRESP[]) => {
    if (busyRef.current || isLoading || !selectedFiles.length) return;
    busyRef.current = true;
    setErrorMessage('');
    let sentCount = 0;
    let currentFile = selectedFiles[0];
    try {
      for (const [index, file] of selectedFiles.entries()) {
        currentFile = file;
        setActiveItemId(file.order_item_id);
        setProgress({ current: index + 1, total: selectedFiles.length });
        const blob = await downloadOrderItemPrintPdfAPI(file.download_url);
        if (!(blob instanceof Blob) || !(await blob.slice(0, 5).text()).startsWith('%PDF-')) {
          throw new Error(tOrder('notify.invalid_print_pdf'));
        }
        downloadBlob(blob, downloadFilenames.get(file.order_item_id) || file.filename, 60_000);
        sentCount += 1;
        setSentItemIds((previous) => [...new Set([...previous, file.order_item_id])]);
      }
      appToast.success(tOrder('notify.print_pdf_downloads_sent', { count: sentCount }));
    } catch (error) {
      const fallback = tOrder(
        isAxiosError(error) && error.response?.status === 409
          ? 'notify.print_pdf_unavailable'
          : 'notify.print_pdf_download_failed',
      );
      const detail = await getDownloadErrorMessage(error, fallback);
      const message = tOrder('notify.print_pdf_download_stopped', {
        sent: sentCount,
        total: selectedFiles.length,
        itemId: currentFile.order_item_id,
        message: detail,
      });
      setErrorMessage(message);
      appToast.error(message);
      if (isAxiosError(error) && error.response?.status === 409) {
        setManifestReady(false);
        onArtifactsChanged();
      }
    } finally {
      busyRef.current = false;
      setActiveItemId(null);
      setProgress(null);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && !busyRef.current && onClose()}>
      <DialogContent className='max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>{tOrder('button.download_print_pdf')}</DialogTitle>
          <DialogDescription>{tOrder('label.print_pdf_download_help')}</DialogDescription>
        </DialogHeader>
        <p className='text-sm font-medium'>{orderNumber}</p>
        {isLoading && (
          <p role='status' className='flex items-center gap-2 text-sm'>
            <Spinner className='size-4' />
            {tOrder('label.print_pdf_preparing')}
          </p>
        )}
        {errorMessage && (
          <p role='alert' className='text-sm text-red-600'>
            {errorMessage}
          </p>
        )}
        {!isLoading && !manifestReady && <p className='text-muted-foreground text-sm'>{tOrder('label.print_pdf_direct_help')}</p>}
        <ul className='space-y-2'>
          {files.map((file) => (
            <li key={file.order_item_id} className='flex items-center justify-between gap-3 rounded-md border p-3'>
              <div className='min-w-0 space-y-1'>
                <p className='text-muted-foreground text-xs'>{tOrder('label.print_pdf_item', { id: file.order_item_id })}</p>
                <p className='text-sm break-all'>{downloadFilenames.get(file.order_item_id) || file.filename}</p>
                {sentItemIds.includes(file.order_item_id) && (
                  <p className='text-muted-foreground text-xs'>{tOrder('label.print_pdf_download_sent')}</p>
                )}
              </div>
              <Button variant='outline' size='sm' disabled={isLoading || isDownloading} onClick={() => handleDownload([file])}>
                {activeItemId === file.order_item_id ? <Spinner className='size-4' /> : <Download className='size-4' />}
                {tCommon('button.download')}
              </Button>
            </li>
          ))}
        </ul>
        {progress && (
          <p role='status' aria-live='polite' className='text-sm'>
            {tOrder('label.print_pdf_progress', progress)}
          </p>
        )}
        <DialogFooter>
          <Button variant='outline' disabled={isDownloading} onClick={onClose}>
            {tCommon('button.close')}
          </Button>
          <Button disabled={isLoading || isDownloading || !manifestReady} onClick={() => handleDownload(files)}>
            {isDownloading && <Spinner className='size-4' />}
            {tOrder('button.download_all_print_pdfs')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrderPrintPdfDialog;
