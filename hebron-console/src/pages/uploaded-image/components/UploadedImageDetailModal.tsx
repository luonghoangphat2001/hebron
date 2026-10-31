import AppDialog from '@/components/dialog/AppDialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useUploadedImageDetailQuery } from '@/data/file/file.query';
import type { FileRESP } from '@/data/file/file.response';
import { cn } from '@/lib/utils';
import { DATE_FORMAT } from '@/utils/constants/date.constant';
import { formatDate, formatFileSize } from '@/utils/helper/common.helper';
import { ExternalLink, FileText } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type UploadedImageDetailModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  imageId: number | null;
  initialData?: FileRESP | null;
};

const UploadedImageDetailModal = ({ open, setOpen, imageId, initialData }: UploadedImageDetailModalProps) => {
  const { t: tContent } = useTranslation('content');
  const { t: tCommon } = useTranslation('common');
  const { t: tEnum } = useTranslation('enum');

  const { data: detailData, isLoading } = useUploadedImageDetailQuery(open && imageId ? imageId : undefined);

  const rawObj = detailData || initialData;
  const fileObj: FileRESP | undefined = (rawObj as any)?.file || (rawObj?.id ? (rawObj as FileRESP) : undefined);

  const isImage = fileObj?.mime_type?.startsWith('image/') || /\.(jpe?g|png|gif|webp|svg)$/i.test(fileObj?.url || '');

  const detailFields = useMemo(() => {
    if (!fileObj) return [];

    return [
      {
        key: 'name',
        label: tContent('column.name'),
        value: <span className='text-foreground text-right font-semibold break-all'>{fileObj.name || '-'}</span>,
      },
      {
        key: 'category',
        label: tContent('column.category'),
        value: fileObj.type ? (
          <Badge variant='secondary' className='rounded-sm font-mono text-xs'>
            {tEnum(`content.${fileObj.type}` as any) || fileObj.type}
          </Badge>
        ) : (
          <span className='text-foreground'>-</span>
        ),
      },
      {
        key: 'type',
        label: tContent('column.type'),
        value: <span className='text-foreground font-mono text-xs'>{fileObj.mime_type || '-'}</span>,
      },
      {
        key: 'size',
        label: tContent('column.size'),
        value: <span className='text-foreground'>{formatFileSize(fileObj.size)}</span>,
      },
      {
        key: 'registrant',
        label: tContent('filter.registrant'),
        value: (
          <span className='text-foreground'>
            {typeof fileObj.created_by === 'object' ? fileObj.created_by?.name : fileObj.created_by || '-'}
          </span>
        ),
      },
      {
        key: 'upload_date',
        label: tContent('column.upload_date'),
        value: <span className='text-foreground'>{fileObj.created_at ? formatDate(fileObj.created_at, DATE_FORMAT) : '-'}</span>,
      },
      ...(fileObj.url
        ? [
            {
              key: 'url',
              label: 'URL',
              isBorderTop: true,
              value: (
                <a
                  href={fileObj.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex max-w-[280px] items-center gap-1 truncate text-right font-mono text-xs break-all text-blue-600 hover:underline'>
                  {fileObj.url} <ExternalLink className='size-3 shrink-0' />
                </a>
              ),
            },
          ]
        : []),
    ];
  }, [fileObj, tContent, tEnum]);

  return (
    <AppDialog
      open={open}
      onOpenChange={setOpen}
      title={tContent('image.modal_detail')}
      textCancel={tCommon('button.close')}
      onOk={undefined}
      contentLoading={isLoading && !fileObj}
      className='sm:max-w-lg'>
      {fileObj ? (
        <div className='space-y-4 text-sm'>
          <div className='relative flex h-52 w-full items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100 p-2'>
            {fileObj.url && isImage ? (
              <img src={fileObj.url} alt={fileObj.name || 'Preview'} className='max-h-full max-w-full rounded object-contain' />
            ) : (
              <div className='text-muted-foreground flex flex-col items-center justify-center gap-1.5 py-6'>
                <FileText className='size-10 stroke-1' />
                <p className='max-w-[200px] truncate text-xs font-medium'>{fileObj.name || 'File Preview'}</p>
                {fileObj.mime_type && <p className='font-mono text-[11px]'>{fileObj.mime_type}</p>}
              </div>
            )}
          </div>

          <div className='bg-card space-y-3 rounded-lg border border-neutral-200 p-4'>
            {detailFields.map(({ key, label, value, isBorderTop }) => (
              <div
                key={key}
                className={cn('flex items-center justify-between gap-4', isBorderTop && 'border-t border-neutral-100 pt-2')}>
                <span className='text-muted-foreground w-24 shrink-0 font-medium'>{label}:</span>
                {value}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className='space-y-4 py-2'>
          <Skeleton className='h-48 w-full rounded-md' />
          <Skeleton className='h-4 w-3/4' />
          <Skeleton className='h-4 w-1/2' />
          <Skeleton className='h-4 w-2/3' />
        </div>
      )}
    </AppDialog>
  );
};

export default UploadedImageDetailModal;
