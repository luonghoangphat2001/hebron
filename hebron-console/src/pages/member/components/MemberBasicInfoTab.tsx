import Can from '@/components/Can';
import FormItem from '@/components/form/FormItem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { MemberDetailItemRESP } from '@/data/member/member.respsonse';
import { replacePhoneDigits, transformMemberDetailToBasicInput } from '@/data/member/member.service';
import { memberBasicInfoSchema, type MemberBasicInfoInput } from '@/schemas/member/member.schema';
import { formatPhone, getDirtyValues } from '@/utils/helper/common.helper';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { Controller, useForm, type Resolver } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export type BasicInfoInput = MemberBasicInfoInput;

type MemberBasicInfoTabProps = {
  member: MemberDetailItemRESP;
  isSaving?: boolean;
  onSave: (dirtyValues: Partial<BasicInfoInput>) => void;
};

const MemberBasicInfoTab = ({ member, isSaving, onSave }: MemberBasicInfoTabProps) => {
  const { t: tMember } = useTranslation('member');
  const { t: tCommon } = useTranslation('common');

  const defaultValues = useMemo<BasicInfoInput>(() => transformMemberDetailToBasicInput(member), [member]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { dirtyFields, isDirty, errors },
  } = useForm<BasicInfoInput>({
    mode: 'all',
    defaultValues,
    resolver: zodResolver(memberBasicInfoSchema) as Resolver<BasicInfoInput>,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const onSubmit = (data: BasicInfoInput) => {
    if (!isDirty) return;
    onSave(getDirtyValues(dirtyFields, data));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 rounded-md border border-gray-200 p-5 dark:border-gray-800'>
      <div className='grid grid-cols-2 gap-4'>
        <FormItem label={tMember('field.name')} required error={errors.name?.message}>
          <Controller control={control} name='name' render={({ field }) => <Input {...field} />} />
        </FormItem>

        <FormItem label={tMember('field.username')} required error={errors.username?.message}>
          <Controller control={control} name='username' render={({ field }) => <Input {...field} />} />
        </FormItem>

        <FormItem label={tMember('field.email')} error={errors.email?.message}>
          <Controller control={control} name='email' render={({ field }) => <Input type='email' {...field} />} />
        </FormItem>

        <FormItem label={tMember('field.mobile')} required error={errors.mobile?.message}>
          <Controller
            control={control}
            name='mobile'
            render={({ field }) => (
              <Input
                {...field}
                value={formatPhone(field.value || '')}
                onChange={(e) => field.onChange(replacePhoneDigits(e.target.value))}
              />
            )}
          />
        </FormItem>

        <FormItem label={tMember('field.phone')} required error={errors.phone?.message}>
          <Controller
            control={control}
            name='phone'
            render={({ field }) => (
              <Input
                {...field}
                value={formatPhone(field.value || '')}
                onChange={(e) => field.onChange(replacePhoneDigits(e.target.value))}
              />
            )}
          />
        </FormItem>

        <FormItem label={tMember('field.postcode')} required error={errors.postcode?.message}>
          <Controller control={control} name='postcode' render={({ field }) => <Input {...field} />} />
        </FormItem>

        <FormItem label={tMember('field.address')} required error={errors.address?.message}>
          <Controller control={control} name='address' render={({ field }) => <Input {...field} />} />
        </FormItem>

        <FormItem label={tMember('field.detailed_address')} error={errors.detailed_address?.message}>
          <Controller control={control} name='detailed_address' render={({ field }) => <Input {...field} />} />
        </FormItem>
      </div>

      <div className='flex justify-end'>
        <Can action='edit'>
          <Button size='sm' type='submit' disabled={!isDirty || isSaving}>
            {tCommon('button.save')}
          </Button>
        </Can>
      </div>
    </form>
  );
};

export default MemberBasicInfoTab;
