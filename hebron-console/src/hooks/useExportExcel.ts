import { ExportFileName, ExportStatus } from '@/utils/enums/common.enum';
import { downloadBlob, downloadExportFileWithKoreanName } from '@/utils/helper/common.helper';
import type { ExportExcelRESP } from '@/utils/types/export.type';
import type { BaseRESP, ErrorRESP } from '@/utils/types/response.type';
import { useMutation, useQuery, type UseMutationOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { useEffect, useState } from 'react';

type UseExportExcelParams<TReq> = {
  /** Unique react-query key for the progress-polling query of this module, e.g. `SHIPMENT_EXPORT_PROGRESS`. */
  queryKey: string;
  exportFn: (body: TReq) => Promise<BaseRESP<ExportExcelRESP>>;
  progressFn: (historyId: number) => Promise<BaseRESP<ExportExcelRESP>>;
  downloadFn?: (historyId: number) => Promise<Blob>;
  exportFileName?: ExportFileName | string;
  onProcessing?: () => void;
  onSuccess?: (filePath: string) => void;
  onError?: () => void;
  mutationOptions?: UseMutationOptions<BaseRESP<ExportExcelRESP>, AxiosError<ErrorRESP>, TReq>;
};

const isFinished = (status?: ExportStatus) => status === ExportStatus.COMPLETED || status === ExportStatus.FAILED;

/**
 * Shared "export to Excel" flow used across list pages: kicks off an export job, polls its
 * progress every 2s, then surfaces a terminal success (with the resulting file path) or failure.
 */
export function useExportExcel<TReq>({
  queryKey,
  exportFn,
  progressFn,
  downloadFn,
  exportFileName = 'export_file',
  onProcessing,
  onSuccess,
  onError,
  mutationOptions,
}: UseExportExcelParams<TReq>) {
  const [historyId, setHistoryId] = useState<number>();

  const handleCompleted = async (history: ExportExcelRESP['history']) => {
    if (downloadFn) {
      const blob = await downloadFn(history.id);
      downloadBlob(blob, history.file_name || `${exportFileName}.xlsx`);
      onSuccess?.(history.file_path);
      return;
    }

    downloadExportFileWithKoreanName(history.file_path, exportFileName);
    onSuccess?.(history.file_path);
  };

  const exportMutation = useMutation<BaseRESP<ExportExcelRESP>, AxiosError<ErrorRESP>, TReq>({
    ...mutationOptions,
    mutationFn: exportFn,
    onSuccess: (resp, ...rest) => {
      const history = resp.data.history;

      // Small exports may already come back completed on the very first call — no need to poll.
      if (isFinished(history.status)) {
        if (history.status === ExportStatus.COMPLETED) void handleCompleted(history).catch(() => onError?.());
        else onError?.();
      } else {
        setHistoryId(history.id);
        onProcessing?.();
      }

      mutationOptions?.onSuccess?.(resp, ...rest);
    },
    onError: (...args) => {
      onError?.();
      mutationOptions?.onError?.(...args);
    },
  });

  const { data: progressResp } = useQuery({
    queryKey: [queryKey, historyId],
    queryFn: () => progressFn(historyId as number),
    enabled: !!historyId,
    refetchInterval: (query) => (isFinished(query.state.data?.data.history.status) ? false : 2000),
  });

  useEffect(() => {
    const history = progressResp?.data.history;
    if (!history || !isFinished(history.status)) return;

    if (history.status === ExportStatus.COMPLETED) {
      void handleCompleted(history).catch(() => onError?.());
    } else {
      onError?.();
    }
    setHistoryId(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progressResp]);

  return {
    handleExport: exportMutation.mutate,
    isExporting: exportMutation.isPending || !!historyId,
  };
}
