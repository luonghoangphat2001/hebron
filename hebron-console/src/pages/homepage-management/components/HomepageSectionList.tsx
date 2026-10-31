import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getSectionTypeLabel } from '@/data/homepage-management/homepage.service';
import type { MallSection } from '@/data/homepage-management/homepage.type';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

type Props = {
  sections: MallSection[];
  selectedSectionId: string;
  onSelectSection: (id: string) => void;
};

export const HomepageSectionList = ({ sections, selectedSectionId, onSelectSection }: Props) => {
  const { t: tEnum } = useTranslation('enum');
  const { t: tContent } = useTranslation('content');
  const activeCount = sections.filter((s) => s.enabled).length;

  return (
    <Card className='sticky top-6 h-fit self-start rounded-2xl shadow-xs lg:col-span-4'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between gap-3'>
          <div>
            <CardTitle className='text-foreground text-base font-bold'>{tContent('homepage.sections_title')}</CardTitle>
            <CardDescription className='text-muted-foreground mt-0.5 text-xs'>
              {tContent('homepage.sections_desc')}
            </CardDescription>
          </div>
          <Badge
            variant='outline'
            className='border-primary/20 bg-primary/5 text-primary rounded-full px-2.5 py-0.5 text-xs font-semibold'>
            {tContent('homepage.active_count', { count: activeCount })}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className='space-y-2.5 pt-1'>
        {sections.map((section, index) => {
          const sectionTitle = getSectionTypeLabel(section.type, tEnum);
          const isSelected = selectedSectionId === section.id;

          return (
            <div
              key={section.id}
              onClick={() => onSelectSection(section.id)}
              className={cn(
                'group flex cursor-pointer items-center justify-between rounded-xl border p-3.5 transition-all duration-200',
                isSelected
                  ? 'border-primary bg-primary/5 ring-primary/40 shadow-xs ring-1'
                  : 'border-border bg-card hover:border-primary/40 hover:bg-accent/30',
                !section.enabled && 'bg-muted/30 opacity-60',
              )}>
              <div className='flex items-center gap-3.5'>
                <div
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors',
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary',
                  )}>
                  {index + 1}
                </div>
                <div className='min-w-0'>
                  <div className='flex items-center gap-2'>
                    <p className='text-foreground truncate text-sm font-bold'>{sectionTitle}</p>
                    {section.enabled ? (
                      <Badge className='border-emerald-200 bg-emerald-50 px-1.5 py-0 text-[10px] font-semibold text-emerald-600 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400'>
                        {tContent('homepage.badge_active')}
                      </Badge>
                    ) : (
                      <Badge variant='secondary' className='px-1.5 py-0 text-[10px]'>
                        {tContent('homepage.badge_disabled')}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default HomepageSectionList;
