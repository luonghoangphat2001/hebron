import { cn } from '@/lib/utils';
import { MemberType } from '@/utils/enums/common.enum';
import { UserIcon, UsersFourIcon } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';

type RoleModeCardProps = {
  role: MemberType;
  isActive?: boolean;
  onClick: () => void;
};

const RoleModeCard = ({ role, isActive, onClick }: RoleModeCardProps) => {
  const { t: tCommon } = useTranslation('common');

  return (
    <div
      className={cn(
        'flex cursor-pointer flex-col items-center space-y-3 rounded-lg border border-neutral-200 py-6',
        isActive && 'border-blue-brand border-2',
      )}
      onClick={onClick}>
      {role === MemberType.INDIVIDUAL && (
        <>
          <UserIcon size={24} className={isActive ? 'text-blue-brand' : 'text-neutral-500'} weight='duotone' />
          <div className='space-y-0.5 text-center text-sm'>
            <p className='font-bold'>{tCommon('title.individual_member')}</p>
            <p className='text-neutral-500'>{tCommon('title.general_individual_member')}</p>
          </div>
        </>
      )}
      {role === MemberType.BUSINESS && (
        <>
          <UsersFourIcon size={24} className={isActive ? 'text-blue-brand' : 'text-neutral-500'} weight='duotone' />
          <div className='space-y-0.5 text-center text-sm'>
            <p className='font-bold'>{tCommon('title.business_member')}</p>
            <p className='text-neutral-500'>{tCommon('title.business_registration_member')}</p>
          </div>
        </>
      )}
    </div>
  );
};

export default RoleModeCard;
