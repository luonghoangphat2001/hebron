import { cn } from '@/lib/utils';

type DescriptionItem = {
  label: string;
  value?: React.ReactNode;
};

type Props = {
  items: DescriptionItem[];

  columns?: number;
};

export default function AppDescription({ items, columns = 2 }: Props) {
  return (
    <div
      className={cn(
        'grid gap-x-6 gap-y-4 rounded-md bg-slate-100 p-4',
        columns === 1 && 'grid-cols-1',
        columns === 2 && 'grid-cols-2',
        columns === 3 && 'grid-cols-3',
      )}>
      {items.map((item) => (
        <div key={item.label} className='space-y-1'>
          <div className='text-muted-foreground text-sm'>{item.label}</div>

          <div className='text-sm font-medium break-words'>{item.value || '-'}</div>
        </div>
      ))}
    </div>
  );
}
