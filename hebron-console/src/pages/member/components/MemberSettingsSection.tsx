import Can from '@/components/Can';
import { Button } from '@/components/ui/button';
import { KeyRound, ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type MaliciousDraft = {
  block_purchase: boolean;
  block_login: boolean;
};

type MemberSettingsSectionProps = {
  maliciousDraft: MaliciousDraft;
  onMaliciousDraftChange: (patch: Partial<MaliciousDraft>) => void;
  maliciousWords: string[];
  onSaveMalicious: () => void;
  onOpenPasswordModal: () => void;
  onOpenSpamReportModal: () => void;
};

const MemberSettingsSection = ({
  maliciousDraft,
  onMaliciousDraftChange,
  maliciousWords,
  onSaveMalicious,
  onOpenPasswordModal,
  onOpenSpamReportModal,
}: MemberSettingsSectionProps) => {
  const { t: tMember } = useTranslation('member');
  const { t: tCommon } = useTranslation('common');

  return (
    <section className='space-y-4 rounded-md border border-gray-200 p-5'>
      <h2 className='flex items-center gap-2 text-sm font-semibold'>
        <ShieldAlert className='size-4' />
        {tMember('section.member_settings')}
      </h2>

      <div className='flex flex-wrap items-center gap-2'>
        <Can action='edit'>
          <Button variant='outline' size='sm' className='gap-1.5' onClick={onOpenPasswordModal}>
            <KeyRound className='size-3.5' />
            {tMember('button.change_password')}
          </Button>
        </Can>
        {/* <Can action='register'>
          <Button variant='outline' size='sm' className='gap-1.5' onClick={onOpenSpamReportModal}>
            <AlertTriangle className='size-3.5' />
            {tMember('button.report_spam_post')}
          </Button>
        </Can> */}
      </div>

      {/* <div className='space-y-3'>
        <p className='text-sm font-medium'>{tMember('label.malicious_member')}</p>
        <div className='flex items-center gap-6'>
          <AppCheckBox
            label={tMember('label.block_purchase')}
            checked={maliciousDraft.block_purchase}
            onCheckedChange={(v) => onMaliciousDraftChange({ block_purchase: v })}
          />
          <AppCheckBox
            label={tMember('label.block_login')}
            checked={maliciousDraft.block_login}
            onCheckedChange={(v) => onMaliciousDraftChange({ block_login: v })}
          />
        </div>
        {maliciousWords.length > 0 && (
          <p className='text-muted-foreground text-xs'>
            {tMember('label.registered_malicious_words')}: {maliciousWords.join(', ')}
          </p>
        )}
        <div className='flex justify-end'>
          <Can action='edit'>
            <Button size='sm' onClick={onSaveMalicious}>
              {tCommon('button.save')}
            </Button>
          </Can>
        </div>
      </div> */}
    </section>
  );
};

export default MemberSettingsSection;
