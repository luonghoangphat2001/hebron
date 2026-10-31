import { Skeleton } from '@/components/ui/skeleton';

type TemplateCardSkeletonProps = {
  showLabel?: boolean;
};

export default function TemplateCardSkeleton({ showLabel = true }: TemplateCardSkeletonProps) {
  return (
    <div className='flex w-full min-w-0 flex-col gap-1' aria-hidden>
      <Skeleton className='aspect-square w-full rounded-lg' />
      {showLabel && <Skeleton className='mx-1.5 h-[18px] w-20 rounded' />}
    </div>
  );
}
