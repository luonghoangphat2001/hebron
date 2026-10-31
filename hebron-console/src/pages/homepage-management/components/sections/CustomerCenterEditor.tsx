import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { UpdatePageSectionREQ } from '@/data/homepage-management/homepage.request';
import {
  buildCustomerCenterUpdatePayload,
  type CustomerCenterContactItem,
  type NormalizedCustomerCenter,
} from '@/data/homepage-management/homepage.service';
import type { MallSection } from '@/data/homepage-management/homepage.type';
import { Edit3, Headphones, HelpCircle, Loader2, Mail, Phone, Plus, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSectionActionLoading } from '../../hooks/useSectionActionLoading';

type Props = {
  section: MallSection;
  customerCenter: NormalizedCustomerCenter;
  onSaveSection?: (payload?: Partial<UpdatePageSectionREQ>) => Promise<any> | void;
};

export const CustomerCenterEditor: React.FC<Props> = ({ section, customerCenter, onSaveSection }) => {
  const { t: tContent } = useTranslation('content');
  const { t: tCommon } = useTranslation('common');

  const items = customerCenter.items || [];

  const [isOpen, setIsOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const { isLoading, isLoadingTarget, runWithLoading } = useSectionActionLoading<number | 'save_item'>();

  const [form, setForm] = useState<CustomerCenterContactItem>({
    type: 'phone',
    text: '',
    textarea: '',
  });

  const handleOpenAdd = () => {
    setEditingIndex(null);
    setForm({
      type: 'phone',
      text: '',
      textarea: '',
    });
    setIsOpen(true);
  };

  const handleOpenEdit = (index: number) => {
    setEditingIndex(index);
    setForm({ ...items[index] });
    setIsOpen(true);
  };

  const handleDeleteItem = (indexToDelete: number) =>
    runWithLoading(indexToDelete, () => {
      const nextItems = items.filter((_, idx) => idx !== indexToDelete);
      return onSaveSection?.(
        buildCustomerCenterUpdatePayload(
          nextItems,
          section.rawSection?.title || '고객센터',
          section.rawSection?.subtitle || null,
          section.rawSection?.image || null,
          section.rawSection?.link || '/mall/customer-center',
          section.enabled ?? true,
          section.rawSection?.metadata || [],
        ),
      );
    });

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.text.trim()) return;

    return runWithLoading('save_item', async () => {
      let nextItems: CustomerCenterContactItem[];
      if (editingIndex !== null) {
        nextItems = items.map((item, idx) => (idx === editingIndex ? { ...form } : item));
      } else {
        nextItems = [...items, { ...form }];
      }

      await onSaveSection?.(
        buildCustomerCenterUpdatePayload(
          nextItems,
          section.rawSection?.title || '고객센터',
          section.rawSection?.subtitle || null,
          section.rawSection?.image || null,
          section.rawSection?.link || '/mall/customer-center',
          section.enabled ?? true,
          section.rawSection?.metadata || [],
        ),
      );
      setIsOpen(false);
    });
  };

  const getItemIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'phone':
        return <Phone className='h-4 w-4 text-blue-500' />;
      case 'email':
        return <Mail className='h-4 w-4 text-emerald-500' />;
      default:
        return <HelpCircle className='h-4 w-4 text-indigo-500' />;
    }
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Headphones className='text-primary h-4 w-4' />
          <h4 className='text-sm font-semibold'>{tContent('homepage.customer_support')}</h4>
          <Badge variant='outline' className='font-mono text-xs'>
            {items.length}
          </Badge>
        </div>
        <Button size='sm' onClick={handleOpenAdd} disabled={isLoading} className='h-8 gap-1.5 text-xs font-semibold'>
          <Plus className='h-3.5 w-3.5' />
          {tCommon('button.create')}
        </Button>
      </div>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        {items.length > 0 ? (
          items.map((item, idx) => (
            <div
              key={idx}
              className='bg-card hover:border-primary/40 group relative flex flex-col justify-between space-y-3 rounded-xl border p-4 shadow-2xs transition-all'>
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    {getItemIcon(item.type)}
                    <Badge variant='secondary' className='font-mono text-[10px] uppercase'>
                      {item.type}
                    </Badge>
                  </div>

                  <div
                    className={`flex items-center gap-1 transition-opacity ${
                      isLoadingTarget(idx) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}>
                    <Button
                      size='icon'
                      variant='ghost'
                      onClick={() => handleOpenEdit(idx)}
                      className='h-7 w-7'
                      disabled={isLoading}>
                      <Edit3 className='h-3.5 w-3.5' />
                    </Button>
                    <Button
                      size='icon'
                      variant='ghost'
                      onClick={() => handleDeleteItem(idx)}
                      className='text-muted-foreground hover:text-destructive h-7 w-7'
                      disabled={isLoading}>
                      {isLoadingTarget(idx) ? (
                        <Loader2 className='h-3.5 w-3.5 animate-spin' />
                      ) : (
                        <Trash2 className='h-3.5 w-3.5' />
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <p className='text-foreground font-mono text-base font-bold tracking-tight'>{item.text}</p>
                  {item.textarea && (
                    <p className='text-muted-foreground mt-2 text-xs leading-relaxed whitespace-pre-line'>{item.textarea}</p>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className='bg-muted/10 space-y-2.5 rounded-xl border border-dashed p-8 text-center sm:col-span-2'>
            <Headphones className='text-muted-foreground mx-auto h-8 w-8' />
            <p className='text-muted-foreground text-xs'>{tContent('homepage.customer_support')}</p>
            <Button
              size='sm'
              variant='outline'
              onClick={handleOpenAdd}
              disabled={isLoading}
              className='h-8 gap-1.5 text-xs font-semibold'>
              <Plus className='h-3.5 w-3.5' /> {tCommon('button.create')}
            </Button>
          </div>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className='sm:max-w-md'>
          <form onSubmit={handleSaveItem} className='space-y-4'>
            <DialogHeader>
              <DialogTitle className='text-base font-bold'>
                {editingIndex !== null ? tCommon('button.edit') : tCommon('button.create')}{' '}
                {tContent('homepage.customer_support')}
              </DialogTitle>
              <DialogDescription className='text-xs'>{tContent('homepage.customer_center_desc')}</DialogDescription>
            </DialogHeader>

            <div className='space-y-3 text-xs'>
              <div className='space-y-1.5'>
                <label className='font-semibold'>{tContent('homepage.field_type')}</label>
                <Select value={form.type} onValueChange={(val) => setForm({ ...form, type: val })}>
                  <SelectTrigger className='h-8 text-xs'>
                    <SelectValue placeholder={tContent('homepage.ph_select_type')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='phone'>{tContent('homepage.type_phone')}</SelectItem>
                    <SelectItem value='email'>{tContent('homepage.type_email')}</SelectItem>
                    <SelectItem value='fax'>{tContent('homepage.type_fax')}</SelectItem>
                    <SelectItem value='inquiry'>{tContent('homepage.type_inquiry')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-1.5'>
                <label className='font-semibold'>{tContent('homepage.field_contact_value')}</label>
                <Input
                  value={form.text}
                  onChange={(e) => setForm({ ...form, text: e.target.value })}
                  placeholder={tContent('homepage.ph_contact_value')}
                  className='h-8 font-mono text-xs'
                  required
                />
              </div>

              <div className='space-y-1.5'>
                <label className='font-semibold'>{tContent('homepage.field_details_hours')}</label>
                <Textarea
                  value={form.textarea}
                  onChange={(e) => setForm({ ...form, textarea: e.target.value })}
                  placeholder={tContent('homepage.ph_details_hours')}
                  rows={4}
                  className='text-xs leading-relaxed'
                />
              </div>
            </div>

            <DialogFooter className='gap-2 pt-2'>
              <Button type='button' variant='outline' size='sm' onClick={() => setIsOpen(false)}>
                {tCommon('button.cancel')}
              </Button>
              <Button type='submit' size='sm' disabled={isLoading}>
                {isLoadingTarget('save_item') ? <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' /> : null}
                {tCommon('button.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerCenterEditor;
