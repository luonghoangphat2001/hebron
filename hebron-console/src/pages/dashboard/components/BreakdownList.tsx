export type BreakdownItem = {
  label: string;
  count?: string | number;
  pct: number;
  hint?: string;
};

type Props = {
  items: BreakdownItem[];
};

const BreakdownList = ({ items }: Props) => {
  return (
    <div className='space-y-3'>
      {items.map((item) => (
        <div key={item.label} className='space-y-1'>
          <div className='flex items-start justify-between gap-3 text-sm'>
            <div className='min-w-0'>
              <p className='truncate font-medium text-gray-700'>{item.label}</p>
              {item.hint && <p className='text-muted-foreground truncate text-xs'>{item.hint}</p>}
            </div>
            <span className='text-muted-foreground shrink-0'>
              {item.count !== undefined && `${typeof item.count === 'number' ? item.count.toLocaleString() : item.count} / `}
              {item.pct}%
            </span>
          </div>
          <div className='h-2 rounded-full bg-gray-100'>
            <div className='bg-primary h-2 rounded-full' style={{ width: `${Math.min(item.pct, 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default BreakdownList;
