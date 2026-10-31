import { appToast } from '@/components/toast/AppToast';
import { Button } from '@/components/ui/button';
import { CopyIcon } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';

type AIPhraseItemProps = {
  styleName: string;
  category: string;
  to: string;
  content: string;
  onApply?: () => void;
};

const copyText = async (text: string) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.top = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();

  try {
    document.execCommand('copy');
  } finally {
    document.body.removeChild(textarea);
  }
};

const AIPhraseItem = ({ styleName, category, to, content, onApply }: AIPhraseItemProps) => {
  const { t: tCommon } = useTranslation('common');

  const handleCopy = async () => {
    if (onApply) {
      onApply();
      return;
    }

    try {
      await copyText(content);
      appToast.success(tCommon('notify.success_copy'));
    } catch {
      appToast.error(tCommon('notify.fail_copy'));
    }
  };

  return (
    <section className='rounded-lg bg-neutral-50 p-3'>
      <div className='flex items-start justify-between'>
        <div className='space-y-0.5 text-sm'>
          <p className='text-blue-brand font-medium'>{styleName}</p>
          <p className='font-semibold'>{category}</p>
          <p className='text-neutral-500'>{to}</p>
        </div>
        <Button variant='outline' onClick={handleCopy}>
          <CopyIcon className='size-5' /> {tCommon(onApply ? 'button.apply' : 'button.copy')}
        </Button>
      </div>
      <div className='mt-1 text-sm whitespace-pre-line text-neutral-500'>{content}</div>
    </section>
  );
};

export default AIPhraseItem;
