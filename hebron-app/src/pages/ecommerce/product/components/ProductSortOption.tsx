import { cn } from '@/lib/utils';

type ProductSortOptionProps = {
  label: string;
  selected?: boolean;
  onClick?: () => void;
};

const ProductSortOption = ({ label, selected = false, onClick }: ProductSortOptionProps) => {
  return (
    <button
      type='button'
      className={cn(
        'text-md shrink-0 cursor-pointer rounded-[360px] border border-neutral-200 px-4 py-1 whitespace-nowrap text-neutral-500 transition-all hover:text-neutral-950',
        selected && 'border-neutral-100 bg-neutral-100 font-medium text-neutral-950',
      )}
      onClick={onClick}>
      {label}
    </button>
  );
};

export default ProductSortOption;
