import { appToast } from '@/components/toast/AppToast';
import AppCheckBox from '@/components/checkbox/AppCheckBox';
import AppDialog from '@/components/dialog/AppDialog';
import FormItem from '@/components/form/FormItem';
import { Textarea } from '@/components/ui/textarea';
import { useMemberSpamReportMutation } from '@/data/member/member.query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type MemberSpamReportModalProps = {
  open: boolean;
  setOpen: (value: boolean) => void;
  memberId: number;
  onReported: (note: string, maliciousWords: string[]) => void;
};

const MemberSpamReportModal = ({ open, setOpen, memberId, onReported }: MemberSpamReportModalProps) => {
  const { t: tMember } = useTranslation('member');
  const { t: tCommon } = useTranslation('common');
  const [blockAuthorIp, setBlockAuthorIp] = useState(false);
  const [deletePost, setDeletePost] = useState(false);
  const [maliciousWords, setMaliciousWords] = useState('');

  const reportMutation = useMemberSpamReportMutation({
    onSuccess: () => {
      appToast.success(tCommon('notify.success_update'));
      const words = maliciousWords
        .split(',')
        .map((w) => w.trim())
        .filter(Boolean);
      const actions = [
        blockAuthorIp && tMember('log.block_author_ip'),
        deletePost && tMember('log.delete_post'),
        words.length > 0 && tMember('log.register_malicious_words'),
      ].filter(Boolean);
      onReported(actions.join(', '), words);
      setBlockAuthorIp(false);
      setDeletePost(false);
      setMaliciousWords('');
      setOpen(false);
    },
    onError: () => appToast.error(tCommon('notify.something_went_wrong')),
  });

  return (
    <AppDialog
      open={open}
      onOpenChange={setOpen}
      title={tMember('title.report_spam_post')}
      onOk={() =>
        reportMutation.mutate({
          member_id: memberId,
          block_author_ip: blockAuthorIp,
          delete_post: deletePost,
          malicious_words: maliciousWords,
        })
      }
      loading={reportMutation.isPending}
      className='sm:max-w-140'>
      <div className='space-y-4'>
        <AppCheckBox label={tMember('label.block_post_author_ip')} checked={blockAuthorIp} onCheckedChange={setBlockAuthorIp} />
        <AppCheckBox label={tMember('label.delete_post')} checked={deletePost} onCheckedChange={setDeletePost} />
        <FormItem
          label={tMember('field.malicious_words')}
          icon={<span className='text-muted-foreground text-xs'>{tMember('label.comma_separated')}</span>}>
          <Textarea
            rows={3}
            value={maliciousWords}
            onChange={(e) => setMaliciousWords(e.target.value)}
            placeholder={tMember('placeholder.enter_malicious_words')}
          />
        </FormItem>
      </div>
    </AppDialog>
  );
};

export default MemberSpamReportModal;
