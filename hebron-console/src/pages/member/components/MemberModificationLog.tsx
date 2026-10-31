import type { MemberActivityLogEntryRESP } from '@/data/member/member.respsonse';
import { DATE_HOUR_MINUTE } from '@/utils/constants/date.constant';
import dayjs from 'dayjs';
import { Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type MemberModificationLogProps = {
  activityLog: MemberActivityLogEntryRESP[];
};

const MemberModificationLog = ({ activityLog }: MemberModificationLogProps) => {
  const { t: tEnum } = useTranslation('enum');
  const { t: tMember } = useTranslation('member');

  return (
    <section className='space-y-4 rounded-md border border-gray-200 p-5'>
      <h2 className='flex items-center gap-2 text-sm font-semibold'>
        <Clock className='size-4' />
        {tMember('section.modification_log')}
      </h2>
      {activityLog.length === 0 ? (
        <p className='text-muted-foreground text-sm'>{tMember('empty.no_activity_log')}</p>
      ) : (
        <ul>
          {activityLog.map((entry, idx) => (
            <li key={entry.id} className='flex gap-3 text-sm'>
              <div className='flex flex-col items-center pt-1.5'>
                <div className='size-2 shrink-0 rounded-full bg-gray-400' />
                {idx < activityLog.length - 1 && <div className='mt-1 w-px flex-1 bg-gray-200' />}
              </div>
              <div className='flex-1 pb-3'>
                <div className='flex items-center justify-between'>
                  <span className='text-xs font-medium'>{tEnum(`common.${entry.action}`)}</span>
                  <span className='text-muted-foreground text-xs'>{dayjs(entry.created_at).format(DATE_HOUR_MINUTE)}</span>
                </div>
                <p className='text-muted-foreground text-xs'>
                  {tMember('label.actor')}: {entry.actor}
                </p>
                {Object.entries(entry.changes).map(([key, val]) => (
                  <p key={key} className='text-muted-foreground text-xs'>
                    {key
                      .split('_')
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(' ')}
                    : {val}
                  </p>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default MemberModificationLog;
