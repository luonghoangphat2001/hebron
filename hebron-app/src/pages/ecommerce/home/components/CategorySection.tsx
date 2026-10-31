import type { CategoryShortcutView } from '@/data/pages/home-mall.service';
import { CATEGORY_SHORTCUT_TYPE } from '@/data/pages/pages.response';
import { downloadByUrl } from '@/utils/helper/file.helper';
import { Link } from 'react-router-dom';

type CategorySectionProps = {
  shortcuts?: CategoryShortcutView[];
};

// The CMS stores full mall URLs; same-host links route in-app, other hosts open in a new tab.
const getInternalPath = (link: string) => {
  try {
    const url = new URL(link, window.location.origin);
    return url.host === window.location.host ? `${url.pathname}${url.search}${url.hash}` : null;
  } catch {
    return null;
  }
};

const getDownloadName = ({ label, link }: CategoryShortcutView) => {
  const ext = link.match(/\.(\w+)(?:[?#]|$)/)?.[1];
  return ext ? `${label}.${ext}` : label;
};

const CategorySection = ({ shortcuts }: CategorySectionProps) => {
  if (!shortcuts || shortcuts.length === 0) return null;

  return (
    <section className='scrollbar-hide flex w-full items-center justify-start gap-3 overflow-x-auto py-6 sm:justify-center'>
      {shortcuts.map((item, index) => {
        const key = `${item.label}-${index}`;
        const className = 'group flex w-16 shrink-0 cursor-pointer flex-col items-center gap-2';
        const content = (
          <>
            <div className='flex size-16 items-center justify-center rounded-full border border-neutral-200 bg-white transition-all duration-200 group-hover:border-neutral-400 group-hover:shadow-xs'>
              {item.icon ? (
                <img src={item.icon} alt={item.label} className='size-8 object-contain' draggable={false} />
              ) : (
                <div className='size-8 rounded-full bg-neutral-100' />
              )}
            </div>
            <p className='text-center text-xs font-medium whitespace-nowrap text-neutral-600 transition-colors group-hover:text-neutral-950'>
              {item.label}
            </p>
          </>
        );

        if (item.type === CATEGORY_SHORTCUT_TYPE.DOWNLOAD) {
          return (
            <button
              key={key}
              type='button'
              className={className}
              onClick={() => void downloadByUrl({ name: getDownloadName(item), url: item.link })}>
              {content}
            </button>
          );
        }

        const internalPath = getInternalPath(item.link);

        return internalPath ? (
          <Link key={key} to={internalPath} className={className}>
            {content}
          </Link>
        ) : (
          <a key={key} href={item.link} target='_blank' rel='noopener noreferrer' className={className}>
            {content}
          </a>
        );
      })}
    </section>
  );
};

export default CategorySection;
