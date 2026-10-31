import { Button } from '@/components/ui/button';
import type { MallSection } from '@/data/homepage-management/homepage.type';
import { MY_ROUTE } from '@/utils/constants/route.constant';
import { SectionType } from '@/utils/enums/homepage.enum';
import { ArrowRight, Link2, Newspaper, Package } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

type Props = {
  section: MallSection;
};

// sections whose items the storefront pulls from another admin menu, so there is nothing to edit here
const LINKED_MENUS: Partial<
  Record<SectionType, { icon: React.ElementType; sidebarKey: 'media_management' | 'product_list'; path: string }>
> = {
  [SectionType.MEDIA_LIST]: { icon: Newspaper, sidebarKey: 'media_management', path: MY_ROUTE.CONTENT.MEDIA },
  [SectionType.PRODUCT_LIST]: { icon: Package, sidebarKey: 'product_list', path: MY_ROUTE.PRODUCT.LIST },
};

export const LinkedContentSectionView: React.FC<Props> = ({ section }) => {
  const { t: tContent } = useTranslation('content');
  const { t: tSidebar } = useTranslation('sidebar');

  const linked = LINKED_MENUS[section.type];
  if (!linked) return null;

  const menu = tSidebar(linked.sidebarKey);
  const Icon = linked.icon;

  return (
    <div className='bg-card rounded-2xl border shadow-2xs'>
      <div className='flex flex-col items-center gap-4 px-6 py-12 text-center'>
        <div className='relative'>
          <div className='bg-primary/10 text-primary flex h-16 w-16 items-center justify-center rounded-2xl'>
            <Icon className='h-7 w-7' />
          </div>
          <div className='bg-background text-primary ring-border absolute -right-2 -bottom-2 flex h-7 w-7 items-center justify-center rounded-full shadow-sm ring-1'>
            <Link2 className='h-3.5 w-3.5' />
          </div>
        </div>

        <div className='max-w-md space-y-1.5'>
          <p className='text-foreground text-sm font-bold'>{tContent('homepage.linked_content_title')}</p>
          <p className='text-muted-foreground text-xs leading-relaxed'>{tContent('homepage.linked_content_desc', { menu })}</p>
        </div>

        <Button asChild size='sm' className='gap-1.5'>
          <Link to={linked.path}>
            {tContent('homepage.go_to_menu', { menu })}
            <ArrowRight className='h-3.5 w-3.5' />
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default LinkedContentSectionView;
