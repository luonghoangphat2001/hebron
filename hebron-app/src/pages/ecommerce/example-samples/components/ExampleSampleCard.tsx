import type { ExampleSentenceSampleItemRESP } from '@/data/example-sentence-samples/example-sentence-samples.response';
import { cn } from '@/lib/utils';
import { getExampleSampleDetailPath } from '@/utils/constants/route.constant';
import { QuotesIcon } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import ExampleSampleHtmlContent from './ExampleSampleHtmlContent';

type ExampleSampleCardProps = {
  sample: ExampleSentenceSampleItemRESP;
  className?: string;
};

const ExampleSampleCard = ({ sample, className }: ExampleSampleCardProps) => {
  return (
    <Link
      to={getExampleSampleDetailPath(sample.id)}
      className={cn(
        'flex min-h-0 flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-4',
        'transition-colors hover:border-neutral-300 focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:outline-none',
        className,
      )}>
      <QuotesIcon className='size-10 shrink-0 text-neutral-950' weight='fill' aria-hidden />

      <div className='custom-scrollbar max-h-54 min-h-0 overflow-y-auto'>
        <ExampleSampleHtmlContent html={sample.content} />
      </div>

      <h3 className='text-xl leading-(--text-xl--line-height) font-bold text-neutral-950'>{sample.title}</h3>
    </Link>
  );
};

export default ExampleSampleCard;
