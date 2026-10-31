import { appToast } from '@/components/toast/AppToast';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { useConfirmDesignDetailQuery, useSendConfirmMutation } from '@/data/confirm-design/confirm-design.query';
import { ConfirmDesignStatus } from '@/utils/enums/common.enum';
import type { ErrorRESP } from '@/utils/types/response.type';
import type { AxiosError } from 'axios';
import dayjs from 'dayjs';
import { Download, FileText } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

const STATUS_LABEL_KEYS = {
  [ConfirmDesignStatus.PENDING]: 'confirm_design.status.pending',
  [ConfirmDesignStatus.MODIFY]: 'confirm_design.status.modify',
  [ConfirmDesignStatus.APPROVE]: 'confirm_design.status.approve',
} as const;

const STATUS_STYLES: Record<ConfirmDesignStatus, string> = {
  [ConfirmDesignStatus.PENDING]: 'bg-amber-50 text-amber-700 ring-amber-200',
  [ConfirmDesignStatus.MODIFY]: 'bg-red-50 text-red-700 ring-red-200',
  [ConfirmDesignStatus.APPROVE]: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
};

const formatFileSize = (size: number) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const ConfirmDesignPage = () => {
  const { t: tCommon } = useTranslation('common');
  const { slug = '' } = useParams<{ slug: string }>();
  const [comment, setComment] = useState('');
  const [submittingStatus, setSubmittingStatus] = useState<ConfirmDesignStatus.MODIFY | ConfirmDesignStatus.APPROVE | null>(null);
  const { data, isLoading, isError } = useConfirmDesignDetailQuery(slug);
  const { mutate: sendConfirm, isPending: isSubmitting } = useSendConfirmMutation();
  const designRevision = data?.data.design_revision;

  const handleSubmit = (status: ConfirmDesignStatus.MODIFY | ConfirmDesignStatus.APPROVE) => {
    if (designRevision?.status !== ConfirmDesignStatus.PENDING) return;

    const trimmedComment = comment.trim();

    if (status === ConfirmDesignStatus.MODIFY && !trimmedComment) {
      appToast.error(tCommon('confirm_design.revision_comment_required'));
      return;
    }

    setSubmittingStatus(status);
    sendConfirm(
      {
        slug,
        status,
        ...(trimmedComment ? { comment: trimmedComment } : {}),
      },
      {
        onSuccess: () => {
          appToast.success(tCommon('confirm_design.submit_success'));
          setComment('');
          setSubmittingStatus(null);
        },
        onError: (error) => {
          const axiosError = error as AxiosError<ErrorRESP>;
          appToast.error(axiosError.response?.data?.message || tCommon('confirm_design.submit_failed'));
          setSubmittingStatus(null);
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className='flex min-h-80 items-center justify-center' aria-busy='true'>
        <Spinner className='size-8 text-neutral-500' />
      </div>
    );
  }

  if (!slug || isError || !designRevision) {
    return <p className='py-16 text-center text-sm text-neutral-500'>{tCommon('confirm_design.load_failed')}</p>;
  }

  const formattedDate = dayjs(designRevision.created_at).isValid()
    ? dayjs(designRevision.created_at).format('YYYY.MM.DD HH:mm')
    : '-';

  return (
    <main className='mx-auto w-full max-w-2xl px-0 py-5 min-[400px]:px-2 sm:px-4 sm:py-12'>
      <section className='overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm sm:rounded-2xl'>
        <header className='border-b border-neutral-100 px-4 py-4 sm:px-7 sm:py-5'>
          <div className='flex flex-wrap items-start justify-between gap-3'>
            <div>
              <p className='text-sm font-medium text-neutral-500'>{tCommon('confirm_design.title')}</p>
              <h1 className='mt-1 text-lg font-bold text-neutral-900 sm:text-xl'>{tCommon('confirm_design.heading')}</h1>
            </div>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${STATUS_STYLES[designRevision.status]}`}>
              {tCommon(STATUS_LABEL_KEYS[designRevision.status])}
            </span>
          </div>
        </header>

        <div className='space-y-6 px-4 py-5 sm:space-y-7 sm:px-7 sm:py-6'>
          <dl className='grid gap-3 text-sm sm:grid-cols-2 sm:gap-4'>
            <div className='rounded-xl bg-neutral-50 px-4 py-3'>
              <dt className='text-xs font-medium text-neutral-500'>{tCommon('confirm_design.revision_number')}</dt>
              <dd className='mt-1 font-semibold break-all text-neutral-900'>{designRevision.slug}</dd>
            </div>
            <div className='rounded-xl bg-neutral-50 px-4 py-3'>
              <dt className='text-xs font-medium text-neutral-500'>{tCommon('confirm_design.created_date')}</dt>
              <dd className='mt-1 font-semibold text-neutral-900'>{formattedDate}</dd>
            </div>
          </dl>

          <section aria-labelledby='design-files-heading'>
            <h2 id='design-files-heading' className='text-sm font-bold text-neutral-900'>
              {tCommon('confirm_design.files')}
            </h2>
            <div className='mt-3 space-y-2'>
              {designRevision.files.length ? (
                designRevision.files.map((file) => (
                  <a
                    key={file.url}
                    href={file.url}
                    download={file.name}
                    target='_blank'
                    rel='noreferrer'
                    className='flex items-center gap-3 rounded-xl border border-neutral-200 px-3 py-3 transition-colors hover:border-neutral-300 hover:bg-neutral-50 sm:px-4'>
                    <FileText className='size-5 shrink-0 text-neutral-500' aria-hidden />
                    <span className='min-w-0 flex-1'>
                      <span className='block truncate text-sm font-medium text-neutral-900'>{file.name}</span>
                      <span className='text-xs text-neutral-500'>{formatFileSize(file.size)}</span>
                    </span>
                    <Download className='size-5 shrink-0 text-neutral-500' aria-hidden />
                    <span className='sr-only'>{tCommon('confirm_design.download_file', { name: file.name })}</span>
                  </a>
                ))
              ) : (
                <p className='rounded-xl bg-neutral-50 px-4 py-3 text-sm text-neutral-500'>
                  {tCommon('confirm_design.no_files')}
                </p>
              )}
            </div>
          </section>

          {designRevision.comments.length > 0 && (
            <section aria-labelledby='previous-comments-heading'>
              <h2 id='previous-comments-heading' className='text-sm font-bold text-neutral-900'>
                {tCommon('confirm_design.previous_comments')}
              </h2>
              <ul className='mt-3 space-y-2'>
                {designRevision.comments.map((previousComment, index) => (
                  <li
                    key={`${previousComment}-${index}`}
                    className='rounded-xl bg-neutral-50 px-4 py-3 text-sm break-words text-neutral-700'>
                    {previousComment}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {designRevision.status === ConfirmDesignStatus.PENDING && (
            <>
              <section aria-labelledby='comment-heading'>
                <label id='comment-heading' htmlFor='design-comment' className='text-sm font-bold text-neutral-900'>
                  {tCommon('confirm_design.comment')}
                </label>
                <Textarea
                  id='design-comment'
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder={tCommon('confirm_design.comment_placeholder')}
                  className='mt-3 min-h-32 resize-y bg-neutral-50'
                />
                <p className='mt-2 text-xs text-neutral-500'>{tCommon('confirm_design.comment_required_note')}</p>
              </section>

              <div className='grid grid-cols-2 gap-2 border-t border-neutral-100 pt-5 sm:flex sm:justify-end sm:gap-3'>
                <Button
                  type='button'
                  variant='outline'
                  size='md'
                  className='h-11 px-2 text-sm sm:w-auto sm:px-4'
                  loading={isSubmitting && submittingStatus === ConfirmDesignStatus.MODIFY}
                  disabled={isSubmitting}
                  onClick={() => handleSubmit(ConfirmDesignStatus.MODIFY)}>
                  {tCommon('confirm_design.request_revision')}
                </Button>
                <Button
                  type='button'
                  size='md'
                  className='h-11 px-2 text-sm sm:w-auto sm:px-4'
                  loading={isSubmitting && submittingStatus === ConfirmDesignStatus.APPROVE}
                  disabled={isSubmitting}
                  onClick={() => handleSubmit(ConfirmDesignStatus.APPROVE)}>
                  {tCommon('confirm_design.approve_design')}
                </Button>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
};

export default ConfirmDesignPage;
