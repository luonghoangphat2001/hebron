import { Typography } from '@/components/typography/Typography';
import { Button } from '@/components/ui/button';
import { useNoticeDetailQuery } from '@/data/notices/notices.query';
import MyPageDetailBackLink from '@/pages/ecommerce/my-page/components/MyPageDetailBackLink';
import NoticeDetailAttachments from '@/pages/ecommerce/my-page/notice/components/NoticeDetailAttachments';
import { formatNoticeDetailTitle, NOTICE_TABLE_LABELS } from '@/utils/constants/notice.constant';
import { getMyPageNoticePath } from '@/utils/constants/route.constant';
import { formatDate } from '@/utils/helper/common.helper';
import { ShareNetworkIcon } from '@phosphor-icons/react';
import { Navigate, useParams } from 'react-router-dom';

const MyPageNoticeDetail = () => {
  const { noticeId = '' } = useParams();
  const { data, isLoading, isError } = useNoticeDetailQuery(noticeId, {
    enabled: Boolean(noticeId),
  });

  const notice = data?.data.notice;

  if (!noticeId || isError || (!isLoading && !notice)) {
    return <Navigate to={getMyPageNoticePath()} replace />;
  }

  if (isLoading || !notice) {
    return (
      <div className='flex w-full min-w-0 flex-col gap-6'>
        <MyPageDetailBackLink to={getMyPageNoticePath()} label={NOTICE_TABLE_LABELS.backToList} />
        <Typography className='text-md text-neutral-500'>{NOTICE_TABLE_LABELS.loading}</Typography>
      </div>
    );
  }

  return (
    <div className='flex w-full min-w-0 flex-col gap-6'>
      <MyPageDetailBackLink to={getMyPageNoticePath()} label={NOTICE_TABLE_LABELS.backToList} />

      <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
        <div className='flex min-w-0 flex-col gap-2'>
          <Typography weight='bold' className='text-xl lg:text-2xl'>
            {formatNoticeDetailTitle(notice.type, notice.title)}
          </Typography>
          <Typography className='text-sm text-neutral-500'>{formatDate(notice.published_at)}</Typography>
        </div>
        <Button variant='outline' size='xs' className='h-10 shrink-0 gap-2 self-start'>
          <ShareNetworkIcon className='size-4' aria-hidden />
          {NOTICE_TABLE_LABELS.share}
        </Button>
      </div>

      <article className='border-y border-neutral-200 py-6'>
        <div
          className='text-md leading-relaxed text-neutral-950 [&_p]:mb-2 [&_p:last-child]:mb-0'
          dangerouslySetInnerHTML={{ __html: notice.content }}
        />
      </article>

      <NoticeDetailAttachments attachments={notice.attachments} />
    </div>
  );
};

export default MyPageNoticeDetail;
