import CareUp from '@/assets/images/care-up.svg';
import { AppAccordion } from '@/components/accordion/AppAccordion';
import type { FAQItemRESP } from '@/data/faqs/faqs.response';
import { cn } from '@/lib/utils';
import { useState } from 'react';

type BrandFAQAccordionItemProps = {
  item: FAQItemRESP;
  defaultOpen?: boolean;
};

const BrandFAQAccordionItem = ({ item, defaultOpen = false }: BrandFAQAccordionItemProps) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <AppAccordion open={open} onOpenChange={setOpen} className='border-b border-neutral-800 last:border-b-0'>
      <AppAccordion.Trigger aria-expanded={open} className='cursor-pointer gap-3 py-4 text-left'>
        <span className='truncate text-sm font-medium text-[#C9A84C]'>{item.question}</span>
        <img
          src={CareUp}
          alt=''
          aria-hidden
          className={cn('ml-auto size-3.5 shrink-0 transition-all', !open && 'rotate-180 opacity-50', open && 'opacity-100')}
        />
      </AppAccordion.Trigger>
      <AppAccordion.Content>
        <div
          className='pb-4 text-sm leading-relaxed text-neutral-300 [&_a]:text-[#C9A84C] [&_a]:underline [&_p]:mb-2 [&_p:last-child]:mb-0'
          dangerouslySetInnerHTML={{ __html: item.answer }}
        />
      </AppAccordion.Content>
    </AppAccordion>
  );
};

export default BrandFAQAccordionItem;
