import { Link } from 'react-router-dom';

import type { HomeBannerItem } from '@/utils/types/home-mall.type';

export type { HomeBannerItem };

type HomeImageBannersProps = {
  banners?: HomeBannerItem[];
};

const HomeImageBanners = ({ banners }: HomeImageBannersProps) => {
  const validBanners = banners?.filter((b) => Boolean(b.imageUrl)) ?? [];
  if (!validBanners.length) return null;

  return (
    <section className='w-full'>
      <div className={`grid gap-4 ${validBanners.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
        {validBanners.map((banner, index) => {
          const content = (
            <div className='relative aspect-[632/176] w-full overflow-hidden rounded-xl bg-neutral-900 shadow-sm transition hover:opacity-95'>
              <img
                src={banner.imageUrl}
                alt={banner.alt || (banner.id ? String(banner.id) : 'Secondary Banner')}
                className='size-full object-cover'
                draggable={false}
              />
            </div>
          );

          if (!banner.linkUrl) {
            return <div key={`${banner.id}-${index}`}>{content}</div>;
          }

          const isExternal = banner.linkUrl.startsWith('http://') || banner.linkUrl.startsWith('https://');

          return isExternal ? (
            <a
              key={`${banner.id}-${index}`}
              href={banner.linkUrl}
              target='_blank'
              rel='noopener noreferrer'
              className='block size-full'>
              {content}
            </a>
          ) : (
            <Link key={`${banner.id}-${index}`} to={banner.linkUrl} className='block size-full'>
              {content}
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default HomeImageBanners;
