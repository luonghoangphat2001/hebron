import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useMesLogDetailQuery } from '@/data/mes/mes.query';
import { cn } from '@/lib/utils';
import { MES_METHOD_BADGE, MES_RESULT_BADGE } from '@/utils/constants/mes.constant';
import { MesLogResult } from '@/utils/enums/mes.enum';
import { formatDate } from '@/utils/helper/common.helper';
import { AlertCircle, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  id?: number | string;
};

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className='flex items-start justify-between gap-4 text-sm'>
    <span className='shrink-0 text-gray-500'>{label}</span>
    <span className='min-w-0 text-right font-medium break-all'>{children}</span>
  </div>
);

const CodeBlock = ({ value }: { value: unknown }) => (
  <pre className='scrollbar-thin max-h-56 overflow-auto rounded-lg bg-gray-950 p-3 text-xs text-gray-100'>
    {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
  </pre>
);

const DetailSkeleton = () => (
  <div className='space-y-4 p-4'>
    <div className='grid grid-cols-2 gap-y-3 rounded-xl border border-gray-200 p-4'>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className='flex items-center justify-between gap-4'>
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-4 w-20' />
        </div>
      ))}
    </div>
    {Array.from({ length: 2 }).map((_, i) => (
      <div key={i} className='rounded-xl border border-gray-200 p-4'>
        <Skeleton className='mb-3 h-5 w-24' />
        <div className='space-y-2'>
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-24 w-full' />
        </div>
      </div>
    ))}
  </div>
);

const MesLogDetailModal = ({ open, onOpenChange, id }: Props) => {
  const { data, isLoading } = useMesLogDetailQuery(id);
  const { t: tMes } = useTranslation('mes');
  const { t: tEnum } = useTranslation('enum');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className='flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl'>
        <DialogHeader className='border-b border-gray-200 p-4'>
          <DialogTitle className='flex items-center gap-2 text-base'>
            {tMes('detail_modal.title')}
            {data && <Badge className={cn(MES_RESULT_BADGE[data.status])}>{tEnum(`mes.${data.status}`)}</Badge>}
            {isLoading && <span className='bg-muted inline-block h-5 w-16 animate-pulse rounded-sm align-middle' />}
          </DialogTitle>
          <DialogDescription className='font-mono'>
            {data
              ? `${data.reference_type_label} #${data.reference_id}`
              : isLoading && <span className='bg-muted inline-block h-4 w-32 animate-pulse rounded-md align-middle' />}
          </DialogDescription>
        </DialogHeader>

        {isLoading && <DetailSkeleton />}

        {!isLoading && data && (
          <div className='scrollbar-thin flex-1 space-y-4 overflow-y-auto p-4'>
            {/* Summary */}
            <div className='grid grid-cols-2 gap-2 rounded-xl border border-gray-200 p-4'>
              <Row label={tMes('detail_modal.requested_at')}>{formatDate(data.requested_at, 'YYYY-MM-DD HH:mm:ss')}</Row>
              <Row label={tMes('detail_modal.responded_at')}>
                {data.responded_at ? formatDate(data.responded_at, 'YYYY-MM-DD HH:mm:ss') : '-'}
              </Row>
              <Row label={tMes('detail_modal.direction')}>{tEnum(`mes.${data.direction}`)}</Row>
              <Row label={tMes('detail_modal.trigger_type')}>{tEnum(`mes.${data.trigger_type}`)}</Row>
              <Row label={tMes('detail_modal.response_status')}>{data.response_status}</Row>
              <Row label={tMes('detail_modal.duration')}>
                {data.duration_ms != null ? `${data.duration_ms.toLocaleString()} ms` : '-'}
              </Row>
              <Row label={tMes('detail_modal.method')}>
                <Badge className={cn(MES_METHOD_BADGE[data.http_method])}>{data.http_method}</Badge>
              </Row>
            </div>

            {/* Request */}
            <section className='rounded-xl border border-gray-200 p-4'>
              <div className='mb-3 flex items-center gap-2 font-semibold'>
                <ArrowUpRight className='h-4 w-4 text-blue-500' /> {tMes('detail_modal.request')}
              </div>
              <div className='space-y-2'>
                <Row label={tMes('detail_modal.endpoint')}>{data.endpoint}</Row>
                <div className='pt-1'>
                  <p className='mb-1 text-sm text-gray-500'>{tMes('detail_modal.headers')}</p>
                  <CodeBlock value={data.request_headers} />
                </div>
                <div className='pt-1'>
                  <p className='mb-1 text-sm text-gray-500'>{tMes('detail_modal.body')}</p>
                  <CodeBlock value={data.request_body} />
                </div>
              </div>
            </section>

            {/* Response */}
            <section className='rounded-xl border border-gray-200 p-4'>
              <div className='mb-3 flex items-center gap-2 font-semibold'>
                <ArrowDownLeft className='h-4 w-4 text-emerald-500' /> {tMes('detail_modal.response')}
              </div>
              <div className='space-y-2'>
                <Row label={tMes('detail_modal.status')}>{data.response_status}</Row>
                <div className='pt-1'>
                  <p className='mb-1 text-sm text-gray-500'>{tMes('detail_modal.headers')}</p>
                  <CodeBlock value={data.response_headers} />
                </div>
                <div className='pt-1'>
                  <p className='mb-1 text-sm text-gray-500'>{tMes('detail_modal.body')}</p>
                  <CodeBlock value={data.response_body} />
                </div>
              </div>
            </section>

            {/* Failure details */}
            {data.status === MesLogResult.FAILED && data.error_message && (
              <section className='rounded-xl border border-red-100 bg-red-50/50 p-4'>
                <div className='mb-3 flex items-center gap-2 font-semibold text-red-600'>
                  <AlertCircle className='h-4 w-4' /> {tMes('detail_modal.error')}
                </div>
                <p className='text-sm text-red-600'>{data.error_message}</p>
              </section>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MesLogDetailModal;
