import { AppAccordion } from '@/components/accordion/AppAccordion';
import type { FAQItemRESP } from '@/data/faqs/faqs.response';
import { cn } from '@/lib/utils';
import { getFAQCategoryLabel } from '@/utils/constants/faq.constant';
import { CaretDownIcon, QuestionMarkIcon } from '@phosphor-icons/react';
import { useState } from 'react';

type FAQAccordionItemVariant = 'list' | 'card';

type FAQAccordionItemProps = {
  item: FAQItemRESP;
  defaultOpen?: boolean;
  variant?: FAQAccordionItemVariant;
};

const FAQAccordionItem = ({ item, defaultOpen = false }: FAQAccordionItemProps) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <AppAccordion
      open={open}
      onOpenChange={setOpen}
      className={cn(
        'w-full',
        open ? 'border-b-0 md:border-b md:border-neutral-200' : 'border-b border-neutral-200',
        'last:border-b-0',
      )}>
      <AppAccordion.Trigger
        aria-expanded={open}
        className={cn(
          'flex w-full cursor-pointer items-center justify-between px-4 text-left transition-colors',
          'gap-1.5 md:gap-6',
          open ? 'pt-6 pb-4' : 'py-6',
        )}>
        {/* Left: Question mark badge & Title */}
        <div className='flex min-w-0 flex-1 items-center gap-1.5 md:gap-6'>
          <div className='flex size-6 shrink-0 items-center justify-center rounded-full bg-[#e7fbed] p-1 md:size-12 md:rounded-xl md:p-2.5'>
            <QuestionMarkIcon className='size-4 text-emerald-600 md:size-7' weight='bold' aria-hidden />
          </div>

          <div className='min-w-0 flex-1 text-base leading-6 text-neutral-950'>
            <span className='mr-1.5 font-bold text-[#2b231f] md:mr-3'>[{getFAQCategoryLabel(item.category)}]</span>
            <span className='font-normal text-[#2b231f]'>{item.question}</span>
          </div>
        </div>

        {/* Right: Caret Icon (Desktop only, per Figma) */}
        <div className='hidden shrink-0 items-center justify-center p-1 md:flex'>
          <CaretDownIcon
            className={cn('size-5 text-neutral-400 transition-transform duration-200', open && 'rotate-180')}
            aria-hidden
          />
        </div>
      </AppAccordion.Trigger>

      <AppAccordion.Content>
        <div className='w-full border-b border-[#dcd7cc] bg-[#f9f8f6] px-4 pt-4 pb-6 md:border-b-0 md:bg-neutral-100 md:p-4'>
          <div className='flex w-full items-start md:gap-6'>
            {/* Desktop spacer to align answer text directly under question */}
            <div className='hidden md:block md:size-12 md:shrink-0' aria-hidden />

            <div
              className='min-w-0 flex-1 text-sm leading-5 text-neutral-950 md:text-base md:leading-6 [&_p]:mb-2 [&_p:last-child]:mb-0'
              dangerouslySetInnerHTML={{ __html: item.answer }}
            />

            {/* Desktop spacer to balance caret icon */}
            <div className='hidden md:block md:w-7 md:shrink-0' aria-hidden />
          </div>
        </div>
      </AppAccordion.Content>
    </AppAccordion>
  );
};

export default FAQAccordionItem;
