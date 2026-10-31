import { Typography } from '@/components/typography/Typography';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useExampleSentenceSampleDetailQuery } from '@/data/example-sentence-samples/example-sentence-samples.query';
import NoticeDetailAttachments from '@/pages/ecommerce/my-page/notice/components/NoticeDetailAttachments';
import { ROUTE_NAME } from '@/utils/constants/route.constant';
import { formatDateTime } from '@/utils/helper/date.helper';
import { CaretLeftIcon } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { Link, Navigate, useParams } from 'react-router-dom';
import ExampleSampleHtmlContent from './components/ExampleSampleHtmlContent';

const ExampleSampleDetailPage = () => {
  const { t } = useTranslation('common');
  const { id = '' } = useParams();
  const { data, isLoading, isError } = useExampleSentenceSampleDetailQuery(id, {
    enabled: Boolean(id),
  });

  const sample = data?.data.example_sentence_sample;

  if (!id || isError || (!isLoading && !sample)) {
    return <Navigate to={ROUTE_NAME.EXAMPLE_SAMPLES} replace />;
  }

  if (isLoading || !sample) {
    return (
      <section className='flex min-h-64 flex-col items-center justify-center py-6 md:py-10'>
        <Spinner className='size-8 text-neutral-500' />
      </section>
    );
  }

  return (
    <section className='mx-auto flex w-full max-w-3xl flex-col gap-4 py-6 md:py-10'>
      <p className='flex flex-wrap items-center gap-2 text-sm text-neutral-500'>
        {sample.created_at ? <time dateTime={sample.created_at}>{formatDateTime(sample.created_at)}</time> : null}
        <span>{t('example_samples.views', { count: sample.view_count })}</span>
      </p>

      <div className='flex flex-col gap-2'>
        <Typography as='h1' weight='bold' className='text-xl text-neutral-950'>
          {sample.title}
        </Typography>
        <ExampleSampleHtmlContent html={sample.content} />
        <NoticeDetailAttachments attachments={sample.attachments ?? []} />
      </div>

      <div className='flex justify-center'>
        <Button variant='outline' size='xs' asChild className='w-full md:w-auto'>
          <Link to={ROUTE_NAME.EXAMPLE_SAMPLES}>
            <CaretLeftIcon className='size-4' weight='bold' aria-hidden />
            {t('example_samples.back_to_list')}
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default ExampleSampleDetailPage;
