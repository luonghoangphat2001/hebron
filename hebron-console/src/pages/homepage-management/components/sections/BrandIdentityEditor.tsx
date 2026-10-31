import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { UpdatePageSectionREQ } from '@/data/homepage-management/homepage.request';
import { buildBrandIdentityUpdatePayload, normalizeBrandIdentityData } from '@/data/homepage-management/homepage.service';
import type { BrandIdentityValueItem, MallSection } from '@/data/homepage-management/homepage.type';
import { Loader2, Target } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSectionActionLoading } from '../../hooks/useSectionActionLoading';
import SectionCardActions from '../ui/SectionCardActions';
import SectionHeader from '../ui/SectionHeader';
import SectionHeadingDescription from '../ui/SectionHeadingDescription';

type Props = {
  section: MallSection;
  onSaveSection?: (payload?: Partial<UpdatePageSectionREQ>) => Promise<any> | void;
};

export const BrandIdentityEditor: React.FC<Props> = ({ section, onSaveSection }) => {
  const { t: tCommon } = useTranslation('common');
  const { t: tContent } = useTranslation('content');
  const { t: tEnum } = useTranslation('enum');

  const initialData = useMemo(() => normalizeBrandIdentityData(section), [section]);

  const [heading, setHeading] = useState(initialData.heading);
  const [description, setDescription] = useState(initialData.description);
  const [values, setValues] = useState<BrandIdentityValueItem[]>(initialData.values);

  const [isOpen, setIsOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const { isLoading, isLoadingTarget, runWithLoading } = useSectionActionLoading<number | 'save_all' | 'save_item'>();

  const [form, setForm] = useState<BrandIdentityValueItem>({
    key: '',
    title: '',
    description: '',
  });

  const handleOpenAdd = () => {
    setEditingIndex(null);
    setForm({
      key: '',
      title: '',
      description: '',
    });
    setIsOpen(true);
  };

  const handleOpenEdit = (index: number) => {
    setEditingIndex(index);
    const target = values[index];
    if (target) {
      setForm({ ...target });
      setIsOpen(true);
    }
  };

  const handleDelete = (indexToDelete: number) =>
    runWithLoading(indexToDelete, async () => {
      const nextValues = values.filter((_, idx) => idx !== indexToDelete);
      setValues(nextValues);
      return onSaveSection?.(
        buildBrandIdentityUpdatePayload(
          {
            heading,
            description,
            values: nextValues,
          },
          section,
        ),
      );
    });

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.key.trim() || !form.title.trim()) return;

    return runWithLoading('save_item', async () => {
      const sanitizedItem: BrandIdentityValueItem = {
        key: form.key.trim(),
        title: form.title.trim(),
        description: form.description.trim(),
        ...(form.position ? { position: form.position } : {}),
      };

      const nextValues =
        editingIndex !== null
          ? values.map((item, idx) => (idx === editingIndex ? sanitizedItem : item))
          : [...values, sanitizedItem];

      setValues(nextValues);
      await onSaveSection?.(
        buildBrandIdentityUpdatePayload(
          {
            heading,
            description,
            values: nextValues,
          },
          section,
        ),
      );
      setIsOpen(false);
    });
  };

  const handleSaveAll = () =>
    runWithLoading('save_all', () =>
      onSaveSection?.(
        buildBrandIdentityUpdatePayload(
          {
            heading,
            description,
            values,
          },
          section,
        ),
      ),
    );

  return (
    <div className='space-y-6'>
      {/* 1. Header Bar with Actions */}
      <SectionHeader
        title={section.name || tEnum('content.brand_identity')}
        icon={Target}
        badgeText='brand_identity'
        onCreate={handleOpenAdd}
        createLabel={tContent('homepage.add_value')}
        createDisabled={isLoading}
        onSave={handleSaveAll}
        isSaving={isLoadingTarget('save_all')}
        saveDisabled={isLoading}
      />

      {/* 2. Section Heading & Description */}
      <SectionHeadingDescription
        heading={heading}
        onChangeHeading={setHeading}
        headingLabel={tContent('homepage.section_heading')}
        descriptionLabel={tContent('homepage.section_description')}
        headingType='textarea'
        description={description}
        onChangeDescription={setDescription}
        descriptionRows={2}
      />

      {/* 3. Core Values List (Cards) */}
      <div className='space-y-3'>
        <div className='flex items-center justify-between'>
          <h4 className='text-foreground text-sm font-bold'>
            {tContent('homepage.core_values_list')} ({values.length})
          </h4>
        </div>

        {values.length === 0 ? (
          <div className='border-muted-foreground/20 flex flex-col items-center justify-center rounded-2xl border border-dashed py-12 text-center'>
            <Target className='text-muted-foreground/40 mb-2 h-8 w-8' />
            <p className='text-muted-foreground text-xs'>{tContent('homepage.no_items')}</p>
            <Button type='button' variant='outline' size='sm' onClick={handleOpenAdd} className='mt-3 h-8 text-xs'>
              {tContent('homepage.add_value')}
            </Button>
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {values.map((item, idx) => (
              <div
                key={item.key || idx}
                onClick={() => handleOpenEdit(idx)}
                className='group bg-card hover:border-primary/50 relative flex cursor-pointer flex-col justify-between rounded-2xl border p-4 shadow-2xs transition-all hover:shadow-md'>
                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <div className='bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg font-bold'>
                      {item.key}
                    </div>
                    <h5 className='text-foreground text-sm font-bold'>{item.title}</h5>
                  </div>

                  <p className='text-muted-foreground line-clamp-3 text-xs leading-relaxed'>{item.description || '-'}</p>
                </div>

                <div className='mt-3 flex items-center justify-end border-t pt-2'>
                  <SectionCardActions
                    onEdit={() => handleOpenEdit(idx)}
                    onDelete={() => handleDelete(idx)}
                    isDeleting={isLoadingTarget(idx)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Add / Edit Value Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className='sm:max-w-md'>
          <form onSubmit={handleSaveItem}>
            <DialogHeader>
              <DialogTitle>
                {editingIndex !== null ? tContent('homepage.edit_value') : tContent('homepage.add_value')}
              </DialogTitle>
              <DialogDescription>{tContent('homepage.value_dialog_desc')}</DialogDescription>
            </DialogHeader>

            <div className='space-y-4 py-4'>
              <div className='grid grid-cols-2 gap-3'>
                <div className='space-y-1.5'>
                  <label className='text-foreground text-xs font-semibold'>
                    {tContent('homepage.value_key')} <span className='text-destructive'>*</span>
                  </label>
                  <Input
                    value={form.key}
                    onChange={(e) => setForm((prev) => ({ ...prev, key: e.target.value.toUpperCase() }))}
                    maxLength={5}
                    className='h-8 text-xs font-bold'
                    required
                  />
                </div>

                <div className='space-y-1.5'>
                  <label className='text-foreground text-xs font-semibold'>
                    {tContent('homepage.value_title')} <span className='text-destructive'>*</span>
                  </label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                    className='h-8 text-xs'
                    required
                  />
                </div>
              </div>

              <div className='space-y-1.5'>
                <label className='text-foreground text-xs font-semibold'>{tContent('homepage.value_description')}</label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className='resize-none text-xs leading-relaxed'
                />
              </div>
            </div>

            <DialogFooter>
              <Button type='button' variant='outline' size='sm' onClick={() => setIsOpen(false)}>
                {tCommon('button.cancel')}
              </Button>
              <Button type='submit' size='sm' disabled={isLoading}>
                {isLoadingTarget('save_item') && <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' />}
                {tCommon('button.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BrandIdentityEditor;
