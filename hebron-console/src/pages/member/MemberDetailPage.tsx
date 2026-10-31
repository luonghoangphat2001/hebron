import PageTitle from '@/components/PageTitle';
import { appToast } from '@/components/toast/AppToast';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMemberBasicInfoUpdateMutation, useMemberDetailQuery } from '@/data/member/member.query';
import { cn } from '@/lib/utils';
import { DATE_HOUR_MINUTE } from '@/utils/constants/date.constant';
import { MEMBER_STATUS_BADGE, MEMBER_TYPE_BADGE } from '@/utils/constants/member.constant';
import { MY_ROUTE } from '@/utils/constants/route.constant';
import { MemberType } from '@/utils/enums/common.enum';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router-dom';
import MemberActivityLogsTab from './components/MemberActivityLogsTab';
import MemberBasicInfoTab, { type BasicInfoInput } from './components/MemberBasicInfoTab';
import MemberBusinessInfoTab, { type BusinessInfoSavePayload } from './components/MemberBusinessInfoTab';
import MemberPasswordModal from './components/MemberPasswordModal';
import MemberSettingsSection from './components/MemberSettingsSection';
import MemberSpamReportModal from './components/MemberSpamReportModal';
import { formatPhone } from '@/utils/helper/common.helper';

const MemberDetailPage = () => {
  const { id } = useParams();
  const memberId = Number(id);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (!searchParams.get('tab')) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set('tab', 'basic');
          return next;
        },
        { replace: true },
      );
    }
  }, [searchParams, setSearchParams]);

  const { t: tMember } = useTranslation('member');
  const { t: tSidebar } = useTranslation('sidebar');
  const { t: tCommon } = useTranslation('common');

  const { data: detailData, isLoading } = useMemberDetailQuery(memberId);
  const updateMutation = useMemberBasicInfoUpdateMutation();

  const member = detailData?.member;
  const permissionInfo = detailData?.permission_information;

  const [maliciousDraft, setMaliciousDraft] = useState({
    block_purchase: false,
    block_login: false,
  });

  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isSpamReportOpen, setIsSpamReportOpen] = useState(false);

  if (isLoading) {
    return (
      <main className='flex h-64 items-center justify-center'>
        <Spinner />
      </main>
    );
  }

  if (!member) {
    return (
      <main className='space-y-5'>
        <PageTitle title={tSidebar('member_management')} returnLink={MY_ROUTE.MEMBER.LIST} />
        <p className='text-muted-foreground text-sm'>{tMember('empty.no_members')}</p>
      </main>
    );
  }

  const statusVal = member.status?.value;
  const statusLabel = member.status?.label || '-';

  const isBusiness = member.member_type === MemberType.BUSINESS;
  const rawTab = searchParams.get('tab') || 'basic';
  const activeTab = rawTab === 'business' && !isBusiness ? 'basic' : rawTab;

  const handleTabChange = (value: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('tab', value);
        return next;
      },
      { replace: true },
    );
  };

  const handleSaveBasicInfo = (dirtyValues: Partial<BasicInfoInput>) => {
    updateMutation.mutate(
      {
        member_id: member.id,
        ...dirtyValues,
      },
      {
        onSuccess: () => {
          appToast.success(tCommon('notify.success_update'));
        },
        onError: (err: any) => {
          appToast.error(err?.response?.data?.message || tCommon('notify.fail_update'));
        },
      },
    );
  };

  const handleSaveBusinessInfo = (payload: BusinessInfoSavePayload) => {
    updateMutation.mutate(
      {
        member_id: member.id,
        ...payload,
      },
      {
        onSuccess: () => {
          appToast.success(tCommon('notify.success_update'));
        },
        onError: (err: any) => {
          appToast.error(err?.response?.data?.message || tCommon('notify.fail_update'));
        },
      },
    );
  };

  return (
    <main className='space-y-5'>
      <PageTitle title={tSidebar('member_management')} returnLink={MY_ROUTE.MEMBER.LIST} />

      {/* Member Header Card */}
      <div className='space-y-3 rounded-lg border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-950'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div>
            <p className='text-muted-foreground font-mono text-xs'>{member.username}</p>
            <h1 className='text-2xl font-bold text-gray-900 dark:text-gray-100'>{member.name}</h1>
          </div>
          <div className='flex flex-wrap items-center gap-2'>
            {member.member_type && (
              <Badge className={cn(MEMBER_TYPE_BADGE[member.member_type])}>
                {isBusiness ? tMember('field.business_member') : tMember('field.individual_member')}
              </Badge>
            )}
            {(permissionInfo?.status?.value || statusVal) && (
              <Badge
                className={cn(
                  MEMBER_STATUS_BADGE[(permissionInfo?.status?.value || statusVal) as keyof typeof MEMBER_STATUS_BADGE],
                )}>
                {permissionInfo?.status?.label || statusLabel}
              </Badge>
            )}
          </div>
        </div>

        <div className='text-muted-foreground flex flex-wrap gap-x-6 gap-y-1 border-t border-gray-100 pt-3 text-xs dark:border-gray-900'>
          {member.email && (
            <span>
              <strong className='font-medium text-gray-700 dark:text-gray-300'>{tMember('field.email')}:</strong> {member.email}
            </span>
          )}
          {member.mobile && (
            <span>
              <strong className='font-medium text-gray-700 dark:text-gray-300'>{tMember('field.mobile')}:</strong>{' '}
              {formatPhone(member.mobile)}
            </span>
          )}
          {member.phone && (
            <span>
              <strong className='font-medium text-gray-700 dark:text-gray-300'>{tMember('field.phone')}:</strong>{' '}
              {formatPhone(member.phone)}
            </span>
          )}
          {(member.date_of_joining || member.created_at) && (
            <span>
              <strong className='font-medium text-gray-700 dark:text-gray-300'>{tMember('column.sign_up_date')}:</strong>{' '}
              {dayjs(member.date_of_joining || member.created_at).format(DATE_HOUR_MINUTE)}
            </span>
          )}
        </div>
      </div>

      {/* Detailed Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value='basic'>{tMember('tab.basic_information')}</TabsTrigger>
          {isBusiness && <TabsTrigger value='business'>{tMember('section.business_info')}</TabsTrigger>}
          <TabsTrigger value='activity'>{tMember('section.modification_log')}</TabsTrigger>
        </TabsList>

        <TabsContent value='basic' className='space-y-4'>
          <MemberBasicInfoTab key={activeTab} member={member} isSaving={updateMutation.isPending} onSave={handleSaveBasicInfo} />
        </TabsContent>

        {isBusiness && (
          <TabsContent value='business'>
            <MemberBusinessInfoTab
              key={activeTab}
              member={member}
              isSaving={updateMutation.isPending}
              onSave={handleSaveBusinessInfo}
            />
          </TabsContent>
        )}

        <TabsContent value='activity'>
          <MemberActivityLogsTab memberId={member.id} />
        </TabsContent>
      </Tabs>

      <MemberSettingsSection
        maliciousDraft={maliciousDraft}
        onMaliciousDraftChange={(patch) => setMaliciousDraft((prev) => ({ ...prev, ...patch }))}
        maliciousWords={[]}
        onSaveMalicious={() => appToast.success(tCommon('notify.success_update'))}
        onOpenPasswordModal={() => setIsPasswordOpen(true)}
        onOpenSpamReportModal={() => setIsSpamReportOpen(true)}
      />

      <MemberPasswordModal open={isPasswordOpen} setOpen={setIsPasswordOpen} memberId={member.id} onChanged={() => {}} />
      <MemberSpamReportModal open={isSpamReportOpen} setOpen={setIsSpamReportOpen} memberId={member.id} onReported={() => {}} />
    </main>
  );
};

export default MemberDetailPage;
