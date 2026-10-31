import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTemplatesQuery } from '@/data/product-catalog/product-catalog.query';
import useDebounce from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';
import type { ProductUpsertInput } from '@/schemas/product/product.schema';
import { toStorageUrl } from '@/utils/helper/storage-url.helper';
import { Check, ChevronLeft, ChevronRight, ImageOff, Search } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

type Props = {
  control: Control<ProductUpsertInput>;
  errors: FieldErrors<ProductUpsertInput>;
};

const TEMPLATE_PAGE_SIZE = 8;

const ProductTemplateSection = ({ control, errors }: Props) => {
  const { t } = useTranslation('product');
  const { t: tError } = useTranslation('error');

  const [templateSearchInput, setTemplateSearchInput] = useState('');
  const [templateSearch, setTemplateSearch] = useState('');
  const [templatePage, setTemplatePage] = useState(1);
  const handleTemplateSearchChange = useCallback((v: string) => {
    setTemplateSearch(v);
    setTemplatePage(1);
  }, []);
  useDebounce(templateSearchInput, handleTemplateSearchChange);

  const templatesQuery = useTemplatesQuery({
    page: templatePage,
    per_page: TEMPLATE_PAGE_SIZE,
    template_name: templateSearch || undefined,
  });

  const templateTotalPages = Math.max(1, Math.ceil((templatesQuery.data?.total || 0) / TEMPLATE_PAGE_SIZE));

  const templateOptions = useMemo(
    () =>
      (templatesQuery.data?.items || []).map((template) => ({
        id: template.id,
        name: template.name,
        image: toStorageUrl(template.preview_images?.[0] || template.front_preview_url),
      })),
    [templatesQuery.data],
  );

  return (
    <section className='space-y-4'>
      <h3 className='text-sm font-semibold'>{t('modal.section_template')}</h3>
      <div className='relative max-w-xs'>
        <Search className='text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2' />
        <Input
          value={templateSearchInput}
          onChange={(e) => setTemplateSearchInput(e.target.value)}
          placeholder={t('modal.template_search_placeholder')}
          className='pl-8'
        />
      </div>
      <Controller
        control={control}
        name='template_ids'
        render={({ field }) => {
          const selectedIds = field.value ?? [];
          const toggle = (id: number) =>
            field.onChange(selectedIds.includes(id) ? selectedIds.filter((v) => v !== id) : [...selectedIds, id]);

          return (
            <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4'>
              {templateOptions.map((template) => {
                const selected = selectedIds.includes(template.id);

                return (
                  <button
                    key={template.id}
                    type='button'
                    onClick={() => toggle(template.id)}
                    className={cn(
                      'overflow-hidden rounded-lg border text-left transition-colors',
                      selected ? 'border-primary ring-primary ring-2' : 'border-border hover:border-primary/50',
                    )}>
                    <div className='bg-muted/30 relative flex h-28 items-center justify-center overflow-hidden'>
                      {template.image ? (
                        <img src={template.image} alt={template.name} loading='lazy' className='h-full w-full object-contain' />
                      ) : (
                        <ImageOff className='text-muted-foreground size-6' />
                      )}
                      {selected && (
                        <span className='bg-primary text-primary-foreground absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full'>
                          <Check className='size-3.5' />
                        </span>
                      )}
                    </div>
                    <div className='truncate border-t px-2 py-1.5 text-xs font-medium'>{template.name}</div>
                  </button>
                );
              })}
              {!templatesQuery.isLoading && !templateOptions.length && (
                <p className='text-muted-foreground col-span-full text-sm'>{t('modal.no_templates')}</p>
              )}
            </div>
          );
        }}
      />
      <div className='flex items-center justify-end gap-2'>
        <Button
          type='button'
          variant='outline'
          size='icon-sm'
          disabled={templatePage <= 1}
          onClick={() => setTemplatePage((p) => p - 1)}>
          <ChevronLeft />
        </Button>
        <span className='text-muted-foreground text-xs'>
          {templatesQuery.data?.page ?? templatePage} / {templateTotalPages}
        </span>
        <Button
          type='button'
          variant='outline'
          size='icon-sm'
          disabled={templatePage >= templateTotalPages}
          onClick={() => setTemplatePage((p) => p + 1)}>
          <ChevronRight />
        </Button>
      </div>
      {errors.template_ids?.message && <p className='text-destructive text-xs'>{tError(errors.template_ids.message as never)}</p>}
    </section>
  );
};

export default ProductTemplateSection;
