import { FooterBackground, Logo, NaverBlog } from '@/assets/images';
import { Logo as BrandLogo, Instagram } from '@/assets/svgs';
import { cn } from '@/lib/utils';
import { BRAND_FOOTER_NAV, ECOMMERCE_FOOTER_NAV, FOOTER_INFO } from '@/utils/constants/common.constant';
import { Link } from 'react-router-dom';

type FooterProps = {
  type?: 'ecommerce' | 'brand' | 'vendor';
};

const FooterEcommerceBackground = () => (
  <>
    <div className='pointer-events-none absolute inset-x-0 top-0 z-0 h-110 overflow-hidden opacity-35 md:h-128 lg:hidden'>
      <img src={FooterBackground} alt='' aria-hidden className='absolute top-0 left-0 h-full w-auto max-w-none' />
    </div>
    <div className='pointer-events-none absolute inset-x-0 top-0 z-0 mx-auto hidden w-fit opacity-35 lg:block'>
      <img src={FooterBackground} alt='' aria-hidden />
    </div>
  </>
);

const Footer = ({ type = 'ecommerce' }: FooterProps) => {
  const logo = type === 'brand' ? BrandLogo : Logo;
  const navs = type === 'brand' ? BRAND_FOOTER_NAV : ECOMMERCE_FOOTER_NAV;
  const isBrand = type === 'brand';
  const containerClass = isBrand ? 'brand-container lg:!py-0 !py-5' : 'ecommerce-container';

  return (
    <footer
      className={cn(
        'relative w-full overflow-hidden',
        type === 'ecommerce' && 'bg-neutral-50',
        isBrand && 'bg-neutral-950 sm:px-[clamp(16px,5.56vw,80px)] lg:py-24',
      )}>
      <div
        className={cn(containerClass, 'relative z-10 flex flex-col', isBrand ? 'gap-6 py-5 lg:gap-10 lg:py-14' : 'gap-6 py-8')}>
        {/* Header: Logo & Navigation */}
        <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
          <img src={logo} alt='logo' className={cn('w-auto', isBrand ? 'h-6 self-start lg:h-10' : 'h-10 w-27.5 lg:w-auto')} />
          <nav className={cn('flex flex-wrap', isBrand ? 'gap-x-8 gap-y-3 lg:gap-14' : 'gap-x-4 gap-y-2 lg:gap-8 xl:gap-12')}>
            {navs.map((nav) => (
              <Link
                key={nav.title}
                to={nav.to}
                className={cn('lg:text-md text-sm text-neutral-600', isBrand && 'transition-colors hover:text-white')}>
                {nav.title}
              </Link>
            ))}
          </nav>
        </div>

        {/* Main: Company Info & Customer Center */}
        <div className={cn('flex flex-col lg:flex-row lg:justify-between lg:gap-16', isBrand ? 'gap-6' : 'gap-6')}>
          {/* Company Info */}
          <div className={cn('flex flex-col', isBrand ? 'gap-2' : 'gap-2')}>
            {FOOTER_INFO.COMMON.map((info) => (
              <div
                key={info.label}
                className={cn(
                  'text-sm lg:flex-row lg:gap-5',
                  isBrand ? 'flex flex-row items-start gap-5 leading-5' : 'flex flex-row items-start gap-3 lg:gap-5',
                )}>
                <p className={cn('text-neutral-500 lg:w-31', isBrand && 'w-31 shrink-0')}>{info.label}</p>
                <p className={cn('font-medium text-neutral-950', isBrand && 'min-w-0 flex-1 font-normal text-white')}>
                  {info.info}
                </p>
              </div>
            ))}
          </div>

          {/* Customer Center & Bank Info */}
          <div className={cn('flex flex-col', isBrand ? 'gap-4 lg:gap-4' : 'gap-4')}>
            {FOOTER_INFO.CUSTOMER_CENTER.map((item) => (
              <div
                key={item.label}
                className={cn('flex flex-col gap-2 text-sm lg:flex-row lg:gap-3', isBrand ? 'text-white' : 'text-neutral-950')}>
                <p className={cn('font-bold lg:w-34', isBrand && 'w-34 shrink-0')}>{item.label}</p>
                <div className='flex shrink-0 flex-col gap-0.5 font-bold'>
                  <p>{item.primary}</p>
                  <p>{item.secondary}</p>
                </div>
                <div className='flex shrink-0 flex-col gap-0.5'>
                  {item.descriptions.map((desc) => (
                    <p key={desc} className='text-neutral-500'>
                      {desc}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: Copyright & Social Links */}
        <div
          className={cn(
            'flex flex-col border-t lg:flex-row lg:items-center lg:justify-between',
            isBrand ? 'gap-3 border-[#E5E5E529] pt-3 pb-3' : 'gap-4 border-neutral-200 pt-5 pb-1',
          )}>
          <p
            className={cn(
              isBrand ? 'text-sm font-light text-neutral-50 opacity-36' : 'lg:text-md text-sm font-light text-neutral-500',
            )}>
            @ 2026 Hebron. All rights reserved.
          </p>
          <div className='flex items-center gap-3'>
            <img src={NaverBlog} alt='naver-blog' className='size-9' />
            <img src={Instagram} alt='instagram' className='size-9' />
          </div>
        </div>
      </div>

      {type === 'ecommerce' && <FooterEcommerceBackground />}
    </footer>
  );
};

export default Footer;
