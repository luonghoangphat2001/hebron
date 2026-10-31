import { Logo } from '@/assets/svgs';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BRAND_ROUTE } from '@/utils/constants/route.constant';
import { DotsThreeIcon, XIcon } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const BRAND_NAV_ITEMS = [
  { label: '브랜드', href: BRAND_ROUTE.BRAND_PAGE },
  { label: '제품', href: BRAND_ROUTE.PRODUCTS },
  { label: '공정', href: BRAND_ROUTE.PROCESS },
  { label: '포트폴리오', href: BRAND_ROUTE.PORTFOLIO },
  { label: '언론보도', href: BRAND_ROUTE.MEDIA },
  // { label: 'FAQs', href: BRAND_ROUTE.FAQ },
  // { label: '문의하기', href: BRAND_ROUTE.CONTACT },
] as const;

type BrandNavProps = {
  variant?: 'overlay' | 'solid';
};

const BrandNav = ({ variant = 'overlay' }: BrandNavProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');

    const handleChange = () => {
      if (mediaQuery.matches) setIsMenuOpen(false);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <>
      {isMenuOpen ? (
        <div className='fixed inset-0 z-40 bg-black/70 backdrop-blur-md lg:hidden'>
          <nav className='flex h-full flex-col items-center justify-center gap-6 px-4' aria-label='모바일 브랜드 메뉴'>
            {BRAND_NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                onClick={() => setIsMenuOpen(false)}
                className='text-display-md font-bold text-white'>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}

      <div className={cn('relative flex justify-center px-4 py-6', isMenuOpen && 'z-50')}>
        <div
          className={cn(
            'flex w-full max-w-full min-w-0 items-center rounded-full py-2 pr-2.5 pl-4 lg:w-fit lg:pl-8',
            variant === 'overlay' ? 'bg-[#0000003D] backdrop-blur-xl' : 'bg-neutral-900 backdrop-blur-xl',
          )}>
          <Link to={BRAND_ROUTE.HOME} className='shrink-0' onClick={() => setIsMenuOpen(false)}>
            <img src={Logo} alt='logo' />
          </Link>

          <nav className='ml-6 hidden min-w-0 items-center gap-2 text-white lg:ml-16 lg:flex' aria-label='브랜드 메뉴'>
            {BRAND_NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className='text-md flex h-11 shrink-0 items-center rounded-full px-4 font-bold transition-colors outline-none hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white/50 active:bg-white/25'>
                {item.label}
              </Link>
            ))}
          </nav>

          <Button
            asChild
            variant='ghost'
            size='lg'
            className='text-md bg-brand hover:bg-brand/85 active:bg-brand/70 ml-auto h-11 shrink-0 rounded-full px-4.5 py-2.5 font-medium! text-white transition-colors lg:ml-8'>
            <Link to={BRAND_ROUTE.PRODUCT_INQUIRY} onClick={() => setIsMenuOpen(false)}>
              제작 문의
            </Link>
          </Button>

          <button
            type='button'
            aria-label={isMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
            className='ml-2 flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-white lg:hidden'>
            {isMenuOpen ? <XIcon className='size-6' weight='bold' /> : <DotsThreeIcon className='size-7' weight='bold' />}
          </button>
        </div>
      </div>
    </>
  );
};

export default BrandNav;
