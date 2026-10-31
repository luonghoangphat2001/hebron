import { Input } from '@/components/ui/input';
import { MagnifyingGlassIcon } from '@phosphor-icons/react';

type PortfolioSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  variant?: 'default' | 'prominent';
};

const PortfolioSearchBar = ({
  value,
  onChange,
  placeholder = '포트폴리오 검색',
  ariaLabel = '포트폴리오 검색',
  variant = 'default',
}: PortfolioSearchBarProps) => {
  if (variant === 'prominent') {
    return (
      <div className='group flex h-12 w-full items-center gap-3 rounded-md border-2 border-neutral-600 bg-neutral-900 px-4 shadow-sm transition-colors focus-within:border-white focus-within:ring-2 focus-within:ring-white/20'>
        <MagnifyingGlassIcon className='size-6 shrink-0 text-neutral-200 transition-colors group-focus-within:text-white' />
        <input
          type='text'
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          aria-label={ariaLabel}
          className='w-full bg-transparent text-base text-neutral-50 placeholder:text-neutral-400 focus:outline-none'
        />
      </div>
    );
  }

  return (
    <div className='relative w-full'>
      <MagnifyingGlassIcon className='pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-neutral-400' />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className='h-12 rounded-full border-neutral-800 bg-neutral-900 pl-12 text-white placeholder:text-neutral-500 focus-visible:border-neutral-600 focus-visible:ring-0'
      />
    </div>
  );
};

export default PortfolioSearchBar;
