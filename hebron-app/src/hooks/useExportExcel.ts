import { downloadByUrl } from '@/utils/helper/file.helper';
import type { ExportExcelRESP, ExportHistoryRESP } from '@/utils/types/export.type';
import type { BaseRESP, ErrorRESP } from '@/utils/types/response.type';
import { useMutation, useQuery, type QueryKey } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ExportStatus } from '@/utils/enums/common.enum';

const DEFAULT_POLLING_INTERVAL_MS = 2_000;

export type ExportExcelErrorType = 'request' | 'validation' | 'progress' | 'not-found' | 'failed' | 'download';

export type ExportExcelError = {
  type: ExportExcelErrorType;
  error?: AxiosError<ErrorRESP>;
};

type UseExportExcelParams<TReq> = {
  /** A module-specific base key; the export history ID is appended automatically. */
  queryKey: QueryKey;
  exportFn: (body: TReq) => Promise<BaseRESP<ExportExcelRESP>>;
  progressFn: (historyId: number) => Promise<BaseRESP<ExportExcelRESP>>;
  /** Override the saved filename with a fixed name or one derived from the completed export history. */
  downloadFileName?: string | ((history: ExportHistoryRESP) => string);
  pollingInterval?: number;
  onProcessing?: (history: ExportHistoryRESP) => void;
  onSuccess?: (history: ExportHistoryRESP) => void;
  onError?: (error: ExportExcelError, retry?: () => void) => void;
};

const isFinished = (status?: ExportStatus) => status === ExportStatus.COMPLETED || status === ExportStatus.FAILED;

/**
 * Shared async Excel-export flow. It creates the job, polls its history, and downloads the
 * completed file. Consumers provide their module's export and progress APIs plus UI callbacks.
 */
export function useExportExcel<TReq>({
  queryKey,
  exportFn,
  progressFn,
  downloadFileName,
  pollingInterval = DEFAULT_POLLING_INTERVAL_MS,
  onProcessing,
  onSuccess,
  onError,
}: UseExportExcelParams<TReq>) {
  const [historyId, setHistoryId] = useState<number>();
  const [isDownloading, setIsDownloading] = useState(false);
  const lastRequestRef = useRef<TReq | undefined>(undefined);
  const handledHistoryIdRef = useRef<number | undefined>(undefined);
  const retryRef = useRef<() => void>(() => undefined);

  const exportMutation = useMutation<BaseRESP<ExportExcelRESP>, AxiosError<ErrorRESP>, TReq>({
    mutationFn: exportFn,
  });
  const {
    data: progressResponse,
    error: progressError,
    isError: isProgressError,
  } = useQuery<BaseRESP<ExportExcelRESP>, AxiosError<ErrorRESP>>({
    queryKey: [...queryKey, historyId],
    queryFn: () => progressFn(historyId as number),
    enabled: Boolean(historyId),
    retry: false,
    refetchInterval: (query) => (isFinished(query.state.data?.data.history.status) ? false : pollingInterval),
  });

  const isExporting = exportMutation.isPending || Boolean(historyId) || isDownloading;

  const reportError = useCallback(
    (type: ExportExcelErrorType, error?: AxiosError<ErrorRESP>, canRetry = false) => {
      onError?.({ type, error }, canRetry ? () => retryRef.current() : undefined);
    },
    [onError],
  );

  const finishExport = useCallback(
    async (history: ExportHistoryRESP) => {
      if (history.status === ExportStatus.FAILED) {
        setHistoryId(undefined);
        reportError('failed', undefined, true);
        return;
      }

      setIsDownloading(true);
      try {
        const name = typeof downloadFileName === 'function' ? downloadFileName(history) : downloadFileName;
        await downloadByUrl({
          name: name || history.file_name || 'export.xlsx',
          url: history.download_url || history.file_path,
        });
        onSuccess?.(history);
      } catch {
        reportError('download', undefined, true);
      } finally {
        setIsDownloading(false);
        setHistoryId(undefined);
      }
    },
    [downloadFileName, onSuccess, reportError],
  );

  const handleCreatedExport = useCallback(
    (history: ExportHistoryRESP) => {
      if (isFinished(history.status)) {
        handledHistoryIdRef.current = history.id;
        void finishExport(history);
        return;
      }

      setHistoryId(history.id);
      onProcessing?.(history);
    },
    [finishExport, onProcessing],
  );

  const handleExport = useCallback(
    (request: TReq) => {
      if (isExporting) return;

      lastRequestRef.current = request;
      handledHistoryIdRef.current = undefined;
      exportMutation.mutate(request, {
        onSuccess: (response) => handleCreatedExport(response.data.history),
        onError: (error) =>
          reportError(error.response?.status === 422 ? 'validation' : 'request', error, error.response?.status !== 422),
      });
    },
    [exportMutation, handleCreatedExport, isExporting, reportError],
  );

  retryRef.current = () => {
    if (lastRequestRef.current) handleExport(lastRequestRef.current);
  };

  useEffect(() => {
    const history = progressResponse?.data.history;
    if (!history || !isFinished(history.status) || handledHistoryIdRef.current === history.id) return;

    handledHistoryIdRef.current = history.id;
    void finishExport(history);
  }, [finishExport, progressResponse]);

  useEffect(() => {
    if (!isProgressError || !progressError) return;

    setHistoryId(undefined);
    reportError(
      progressError.response?.status === 404 ? 'not-found' : 'progress',
      progressError,
      progressError.response?.status !== 404,
    );
  }, [isProgressError, progressError, reportError]);

  return { handleExport, isExporting };
}
