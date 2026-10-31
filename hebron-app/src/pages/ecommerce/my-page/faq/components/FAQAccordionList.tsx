import { Typography } from '@/components/typography/Typography';
import type { FAQItemRESP } from '@/data/faqs/faqs.response';
import { cn } from '@/lib/utils';
import FAQAccordionItem from '@/pages/ecommerce/my-page/faq/components/FAQAccordionItem';
import FAQAccordionSkeleton from '@/pages/ecommerce/my-page/faq/components/FAQAccordionSkeleton';
import { FAQ_PAGE_LABELS } from '@/utils/constants/faq.constant';
import type { ReactNode } from 'react';

type FAQAccordionListProps = {
  items: FAQItemRESP[];
  footer?: ReactNode;
  emptyMessage?: string;
  className?: string;
  defaultOpenFirst?: boolean;
  isLoading?: boolean;
};

const FAQAccordionList = ({
  items,
  footer,
  emptyMessage = FAQ_PAGE_LABELS.empty,
  className,
  defaultOpenFirst = true,
  isLoading = false,
}: FAQAccordionListProps) => {
  if (isLoading) {
    return <FAQAccordionSkeleton className={className} />;
  }

  if (items.length === 0) {
    return (
      <Typography variant='body-sm' className={cn('py-10 text-center text-neutral-500', className)} role='status'>
        {emptyMessage}
      </Typography>
    );
  }

  return (
    <div className={cn('flex flex-col', className)}>
      <div className='flex flex-col'>
        {items.map((item, index) => (
          <FAQAccordionItem key={item.id} item={item} defaultOpen={defaultOpenFirst && index === 0} />
        ))}
      </div>

      {footer ? <div className='hidden border-t border-neutral-200 p-3 md:block'>{footer}</div> : null}
    </div>
  );
};

export default FAQAccordionList;
