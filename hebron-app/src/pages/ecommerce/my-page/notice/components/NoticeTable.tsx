import AppTable from '@/components/table/AppTable';
import { Typography } from '@/components/typography/Typography';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { NoticeItemRESP } from '@/data/notices/notices.response';
import { cn } from '@/lib/utils';
import MyPageMobileCard from '@/pages/ecommerce/my-page/components/MyPageMobileCard';
import { getNoticeTypeLabel, NOTICE_TABLE_LABELS } from '@/utils/constants/notice.constant';
import { getMyPageNoticeDetailPath } from '@/utils/constants/route.constant';
import { formatDate } from '@/utils/helper/common.helper';
import { EyeIcon } from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type NoticeTableProps = {
  notices: NoticeItemRESP[];
  emptyMessage?: string;
  className?: string;
  footer?: ReactNode;
  pageIndex?: number;
  pageSize?: number;
};

type NoticeRowProps = {
  notice: NoticeItemRESP;
  index: number;
};

const NoticeTableRow = ({ notice, index }: NoticeRowProps) => (
  <TableRow className='border-neutral-100 hover:bg-transparent'>
    <TableCell className='typo-table-cell text-center whitespace-normal'>{index}</TableCell>
    <TableCell className='typo-table-cell text-center whitespace-normal'>{getNoticeTypeLabel(notice.type)}</TableCell>
    <TableCell className='whitespace-normal'>
      <div className='flex min-w-0 items-start gap-2'>
        {notice.is_pinned && <span className='bg-brand mt-2 size-1.5 shrink-0 rounded-full' aria-hidden />}
        <Typography className='typo-body min-w-0'>
          <Link to={getMyPageNoticeDetailPath(String(notice.id))} className='hover:underline'>
            {notice.title}
          </Link>
        </Typography>
      </div>
    </TableCell>
    <TableCell className='typo-table-cell text-center whitespace-normal'>{notice.view_count.toLocaleString('ko-KR')}</TableCell>
    <TableCell className='typo-table-cell text-center whitespace-normal'>{formatDate(notice.published_at)}</TableCell>
  </TableRow>
);

const NoticeMobileCard = ({ notice }: { notice: NoticeItemRESP }) => (
  <MyPageMobileCard header={<Typography className='text-sm text-neutral-500'>{formatDate(notice.published_at)}</Typography>}>
    <div className='flex flex-col gap-2'>
      <Typography weight='bold' className='text-md text-neutral-950'>
        <Link to={getMyPageNoticeDetailPath(String(notice.id))} className='hover:underline'>
          [{getNoticeTypeLabel(notice.type)}] {notice.title}
        </Link>
      </Typography>
      <div className='flex items-center gap-1'>
        <EyeIcon className='size-4 text-neutral-400' aria-hidden />
        <Typography className='text-sm text-neutral-500'>{notice.view_count.toLocaleString('ko-KR')}</Typography>
      </div>
    </div>
  </MyPageMobileCard>
);

const NoticeTable = ({
  notices,
  emptyMessage = NOTICE_TABLE_LABELS.empty,
  className,
  footer,
  pageIndex,
  pageSize,
}: NoticeTableProps) => {
  const getRowIndex = (idx: number) => {
    if (typeof pageIndex === 'number' && typeof pageSize === 'number') {
      return pageIndex * pageSize + idx + 1;
    }
    return idx + 1;
  };

  return (
    <div className={cn('flex flex-col', className)}>
      <div className='hidden md:block'>
        <AppTable footer={footer}>
          <TableHeader>
            <TableRow className='border-neutral-200 bg-neutral-100 hover:bg-neutral-100'>
              <TableHead className='typo-table-head w-24 text-center'>{NOTICE_TABLE_LABELS.number}</TableHead>
              <TableHead className='typo-table-head w-24 text-center'>{NOTICE_TABLE_LABELS.category}</TableHead>
              <TableHead className='typo-table-head'>{NOTICE_TABLE_LABELS.title}</TableHead>
              <TableHead className='typo-table-head w-24 text-center'>{NOTICE_TABLE_LABELS.views}</TableHead>
              <TableHead className='typo-table-head w-32 text-center'>{NOTICE_TABLE_LABELS.createdAt}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notices.length === 0 ? (
              <TableRow className='hover:bg-transparent'>
                <TableCell colSpan={5} className='typo-body-secondary py-10 text-center'>
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              notices.map((notice, index) => <NoticeTableRow key={notice.id} notice={notice} index={getRowIndex(index)} />)
            )}
          </TableBody>
        </AppTable>
      </div>

      <div className='flex flex-col gap-3 md:hidden'>
        {notices.length === 0 ? (
          <Typography variant='body-sm' className='py-8 text-center text-neutral-500'>
            {emptyMessage}
          </Typography>
        ) : (
          notices.map((notice) => <NoticeMobileCard key={notice.id} notice={notice} />)
        )}
      </div>
    </div>
  );
};

export default NoticeTable;
