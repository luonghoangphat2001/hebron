import type { AppDialogProps } from '@/components/dialog/AppDialog';
import AppDialog from '@/components/dialog/AppDialog';
import FormDatePicker from '@/components/form/FormDatePicker';
import FormInput from '@/components/form/FormInput';
import FormSelect from '@/components/form/FormSelect';
import FormTextarea from '@/components/form/FormTextarea';
import { appToast } from '@/components/toast/AppToast';
import { Button } from '@/components/ui/button';
import { AIAPI, type GeneratedPlaqueText, type GeneratePlaqueTextREQ } from '@/data/ai/ai.api';
import { ArrowClockwiseIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import AIPhraseItem from './AIPhraseItem';

type AIPhraseAssistantModalProps = Omit<AppDialogProps, 'children'> & {
  onApplyToWritingForm?: (item: GeneratedPlaqueText) => void;
};

const AIPhraseAssistantModal = (props: AIPhraseAssistantModalProps) => {
  const { t: tCommon } = useTranslation('common');
  const [items, setItems] = useState<GeneratedPlaqueText[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<GeneratePlaqueTextREQ>({
    defaultValues: {
      situation: '공로/감사',
      receiver: '',
      message: '',
      date: '',
      sender: '',
    },
  });
  const { control } = form;

  const handleGenerate = form.handleSubmit(async (values) => {
    if (Object.values(values).some((value) => !value.trim())) {
      appToast.warning('필수 항목을 모두 입력해 주세요.');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await AIAPI.generatePlaqueText(values);
      setItems(response.data.items ?? []);
    } catch (error) {
      console.error('[AI plaque text] Cannot generate text:', error);
      appToast.error('AI 문구를 생성하지 못했습니다. 다시 시도해 주세요.');
    } finally {
      setIsGenerating(false);
    }
  });

  const handleReset = () => {
    form.reset();
    setItems([]);
  };

  return (
    <AppDialog {...props} onConfirm={handleGenerate} isConfirming={isGenerating} closeOnInteractOutside={!isGenerating}>
      <div>
        <FormProvider {...form}>
          <div className='space-y-4'>
            <FormSelect
              control={control}
              name='situation'
              label={tCommon('title.status')}
              options={[
                { label: '공로/감사', value: '공로/감사' },
                { label: '기념', value: '기념' },
                { label: '축하', value: '축하' },
                { label: '퇴임/은퇴', value: '퇴임/은퇴' },
              ]}
              placeholder='공로/감사'
              containerClassName='md:gap-12'
              required
            />
            <FormInput
              control={control}
              name='receiver'
              label={tCommon('title.recipient')}
              required
              placeholder='홍길동 사무님'
              containerClassName='md:gap-12'
            />
            <FormTextarea
              control={control}
              name='message'
              label={tCommon('title.message_to_convey')}
              required
              placeholder={'상패에 새길 문안을 작성해주세요.\nAI 문구 도우미를 이용하시면 자동으로 작성됩니다.'}
              className='h-32 min-h-32 placeholder:whitespace-pre-line'
              containerClassName='md:gap-9'
              labelClassName='md:w-27 tracking-tight'
            />
            <FormDatePicker
              control={control}
              name='date'
              label={tCommon('title.gift_date')}
              required
              placeholder={tCommon('placeholder.select_date')}
              containerClassName='md:gap-12'
            />
            <FormInput
              control={control}
              name='sender'
              label={`${tCommon('title.giver')} (${tCommon('title.organization_name')})`}
              required
              placeholder='예) 전축공학회 임직원 일동, 동반자 백제수 등'
              containerClassName='md:gap-10'
              labelClassName='md:w-26 tracking-tight'
            />
          </div>
          <div className='mt-4 flex justify-end'>
            <Button variant='outline' type='button' onClick={handleReset} disabled={isGenerating}>
              <ArrowClockwiseIcon />
              {tCommon('button.reset')}
            </Button>
          </div>
        </FormProvider>
        {items.length > 0 && (
          <div className='mt-4 space-y-3'>
            {items.map((item, index) => (
              <AIPhraseItem
                key={`${item.title}-${index}`}
                styleName={item.style || '정중한 스타일'}
                category={item.title}
                to={item.recipient || form.getValues('receiver')}
                content={[item.message, item.date, item.sender].filter(Boolean).join('\n')}
                onApply={
                  props.onApplyToWritingForm
                    ? () => {
                        props.onApplyToWritingForm?.(item);
                        props.onOpenChange(false);
                      }
                    : undefined
                }
              />
            ))}
          </div>
        )}
      </div>
    </AppDialog>
  );
};

export default AIPhraseAssistantModal;
