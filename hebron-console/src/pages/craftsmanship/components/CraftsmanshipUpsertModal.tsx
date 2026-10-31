import AppDialog from '@/components/dialog/AppDialog';
import FormItem from '@/components/form/FormItem';
import { appToast } from '@/components/toast/AppToast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import AttachmentFile, { type AttachmentFileValue } from '@/components/upload/AttachmentFile';
import {
  useCraftsmanshipCreateMutation,
  useCraftsmanshipDetailQuery,
  useCraftsmanshipUpdateMutation,
} from '@/data/craftsmanship/craftsmanship.query';
import type { CraftsmanshipProductItem } from '@/data/craftsmanship/craftsmanship.response';
import {
  getCraftsmanshipProductName,
  resolveCraftsmanshipImage,
  toCraftsmanshipAttachment,
  transformCraftsmanshipToInput,
  transformInputToCraftsmanshipCreateREQ,
  transformInputToCraftsmanshipUpdateREQ,
} from '@/data/craftsmanship/craftsmanship.service';
import type { Product } from '@/data/product/product.response';
import {
  craftsmanshipInputDefault,
  craftsmanshipUpsertSchema,
  type CraftsmanshipInput,
} from '@/schemas/craftsmanship/craftsmanship.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Image as ImageIcon, Package, Plus, Trash2, Type } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm, type Resolver } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { CraftsmanshipProductPickerModal } from './CraftsmanshipProductPickerModal';

export type CraftsmanshipUpsertMode = 'create' | 'edit' | 'view';

type Props = {
  open: boolean;
  setOpen: (value: boolean) => void;
  id: number | null;
  mode: CraftsmanshipUpsertMode;
};

const CraftsmanshipUpsertModal = ({ open, setOpen, id, mode }: Props) => {
  const { t: tContent } = useTranslation('content');
  const { t: tCommon } = useTranslation('common');
  const { i18n } = useTranslation();
  const isKo = i18n.language === 'kr';

  const isReadonly = mode === 'view';
  const isCreate = mode === 'create';
  const [attachment, setAttachment] = useState<AttachmentFileValue | undefined>();
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [linkedProducts, setLinkedProducts] = useState<CraftsmanshipProductItem[]>([]);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CraftsmanshipInput>({
    mode: 'all',
    defaultValues: craftsmanshipInputDefault,
    resolver: zodResolver(craftsmanshipUpsertSchema) as Resolver<CraftsmanshipInput>,
  });

  const { data: dataDetail, isLoading: isDetailLoading } = useCraftsmanshipDetailQuery(open && id ? id : undefined);
  const { mutate: mutateCreate, isPending: isCreating } = useCraftsmanshipCreateMutation();
  const { mutate: mutateUpdate, isPending: isUpdating } = useCraftsmanshipUpdateMutation();

  const productIds = watch('product_ids') || [];

  const onSubmit = async (input: CraftsmanshipInput) => {
    if (isCreating || isUpdating || uploadingAttachment) return;

    try {
      setUploadingAttachment(true);
      const image_url = await resolveCraftsmanshipImage(attachment);
      const finalInput: CraftsmanshipInput = {
        ...input,
        image_url,
      };

      if (isCreate) {
        mutateCreate(transformInputToCraftsmanshipCreateREQ(finalInput), {
          onSuccess: () => {
            setOpen(false);
            appToast.success(tCommon('notify.success_create'));
          },
          onError: (error) => {
            appToast.error(error.response?.data?.message || tCommon('notify.fail_create'));
          },
        });
      } else if (id) {
        mutateUpdate(
          {
            id,
            body: transformInputToCraftsmanshipUpdateREQ(finalInput),
          },
          {
            onSuccess: () => {
              setOpen(false);
              appToast.success(tCommon('notify.success_update'));
            },
            onError: (error) => {
              appToast.error(error.response?.data?.message || tCommon('notify.fail_update'));
            },
          },
        );
      }
    } catch (err: any) {
      appToast.error(err?.response?.data?.message || err?.message || tCommon('notify.fail_upload'));
    } finally {
      setUploadingAttachment(false);
    }
  };

  useEffect(() => {
    if (!open) return;

    if (isCreate) {
      reset(craftsmanshipInputDefault);
      setAttachment(undefined);
      setLinkedProducts([]);
      return;
    }

    if (dataDetail) {
      const input = transformCraftsmanshipToInput(dataDetail);
      reset(input);
      setAttachment(toCraftsmanshipAttachment(dataDetail.image_url));
      setLinkedProducts(dataDetail.products || []);
      return;
    }

    if (id) {
      reset(craftsmanshipInputDefault);
      setAttachment(undefined);
      setLinkedProducts([]);
    }
  }, [open, id, isCreate, dataDetail, reset]);

  const handleAddProducts = (newProducts: Product[]) => {
    const formattedNew: CraftsmanshipProductItem[] = newProducts.map((p) => ({
      product_id: p.id,
      product_code: p.sku || '',
      name: {
        ko: typeof p.name === 'string' ? p.name : p.name?.ko || '',
        en: typeof p.name === 'string' ? p.name : p.name?.en || '',
      },
      slug: p.slug || '',
      selling_price: p.selling_price || p.supply_price || 0,
      original_price: p.brand_site_price || p.selling_price || 0,
      first_image: p.first_image || '',
      is_popular: p.is_popular,
      is_featured: p.is_featured,
      is_active: p.is_active,
      sort_order: p.sort_order,
      has_discount: false,
      discount_percentage: 0,
    }));

    const merged = [...linkedProducts, ...formattedNew];
    setLinkedProducts(merged);
    setValue(
      'product_ids',
      merged.map((p) => p.product_id),
      { shouldDirty: true, shouldValidate: true },
    );
  };

  const handleRemoveProduct = (productId: number) => {
    const next = linkedProducts.filter((p) => p.product_id !== productId);
    setLinkedProducts(next);
    setValue(
      'product_ids',
      next.map((p) => p.product_id),
      { shouldDirty: true, shouldValidate: true },
    );
  };

  const title = isCreate
    ? tContent('craftsmanship.modal_create')
    : mode === 'edit'
      ? tContent('craftsmanship.modal_edit')
      : tContent('craftsmanship.modal_detail');

  return (
    <>
      <AppDialog
        open={open}
        onOpenChange={setOpen}
        title={title}
        onOk={isReadonly ? undefined : handleSubmit(onSubmit)}
        loading={isCreating || isUpdating || uploadingAttachment}
        contentLoading={!isCreate && !!id && isDetailLoading}
        textCancel={isReadonly ? tCommon('button.close') : undefined}
        className='sm:max-w-250'>
        <div className='max-h-[100vh] space-y-5'>
          {/* 1. Basic Details */}
          <div className='border-border bg-card rounded-lg border p-4 shadow-2xs'>
            <div className='mb-3 flex items-center gap-2'>
              <Type className='text-primary h-4 w-4' />
              <p className='text-sm font-semibold'>{tContent('craftsmanship.field_title')}</p>
            </div>
            <Separator className='mb-4' />
            <div className='space-y-4'>
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <FormItem label={tContent('craftsmanship.field_title')} required={!isReadonly} error={errors.title?.message}>
                  <Controller
                    control={control}
                    name='title'
                    render={({ field }) => (
                      <Input {...field} placeholder={tContent('craftsmanship.ph_title')} disabled={isReadonly} />
                    )}
                  />
                </FormItem>

                <FormItem label={tContent('craftsmanship.field_subtitle')} error={errors.subtitle?.message}>
                  <Controller
                    control={control}
                    name='subtitle'
                    render={({ field }) => (
                      <Input
                        {...field}
                        value={field.value || ''}
                        placeholder={tContent('craftsmanship.ph_subtitle')}
                        disabled={isReadonly}
                      />
                    )}
                  />
                </FormItem>
              </div>

              <FormItem label={tContent('craftsmanship.field_sort_order')} error={errors.sort_order?.message}>
                <Controller
                  control={control}
                  name='sort_order'
                  render={({ field }) => (
                    <Input
                      type='number'
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      disabled={isReadonly}
                    />
                  )}
                />
              </FormItem>

              <FormItem label={tContent('craftsmanship.field_description')} error={errors.description?.message}>
                <Controller
                  control={control}
                  name='description'
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      value={field.value || ''}
                      rows={3}
                      placeholder={tContent('craftsmanship.ph_description')}
                      disabled={isReadonly}
                    />
                  )}
                />
              </FormItem>
            </div>
          </div>

          {/* 2. Showcase Image */}
          <div className='border-border bg-card rounded-lg border p-4 shadow-2xs'>
            <div className='mb-3 flex items-center gap-2'>
              <ImageIcon className='text-primary h-4 w-4' />
              <p className='text-sm font-semibold'>{tContent('craftsmanship.field_image')}</p>
            </div>
            <Separator className='mb-4' />
            <div className='space-y-2'>
              <AttachmentFile
                accept='image/*'
                disabled={isReadonly}
                uploading={uploadingAttachment}
                value={attachment}
                onChange={(val) => {
                  const item = Array.isArray(val) ? val[0] : val;
                  setAttachment(item);
                  setValue('image_url', item?.remote?.url || item?.name || null, {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true,
                  });
                }}
              />
              {!isReadonly && (
                <p className='text-muted-foreground text-xs'>
                  PNG, JPG, JPEG, WEBP ({tCommon('title.upload_hint', { size: 5 })})
                </p>
              )}
            </div>
          </div>

          {/* 3. Linked Products */}
          <div className='border-border bg-card rounded-lg border p-4 shadow-2xs'>
            <div className='mb-3 flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Package className='text-primary h-4 w-4' />
                <p className='text-sm font-semibold'>{tContent('craftsmanship.field_linked_products')}</p>
                {linkedProducts.length > 0 && (
                  <Badge variant='secondary' className='text-xs font-semibold'>
                    {linkedProducts.length}
                  </Badge>
                )}
              </div>

              {!isReadonly && (
                <Button
                  type='button'
                  size='sm'
                  variant='outline'
                  onClick={() => setIsPickerOpen(true)}
                  className='h-8 gap-1.5 text-xs font-semibold'>
                  <Plus className='h-3.5 w-3.5' />
                  {tContent('craftsmanship.add_product')}
                </Button>
              )}
            </div>
            <Separator className='mb-4' />

            {linkedProducts.length === 0 ? (
              <div className='text-muted-foreground bg-muted/20 flex flex-col items-center justify-center rounded-lg border border-dashed py-8 text-center'>
                <Package className='mb-1.5 h-7 w-7 opacity-40' />
                <p className='text-xs'>{tContent('craftsmanship.no_linked_products')}</p>
              </div>
            ) : (
              <div className='grid max-h-[360px] grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2'>
                {linkedProducts.map((p) => {
                  const name = getCraftsmanshipProductName(p.name, isKo);
                  const price = p.selling_price || p.original_price || 0;

                  return (
                    <div
                      key={p.product_id}
                      className='border-border bg-muted/20 hover:bg-muted/40 flex items-center justify-between rounded-lg border p-2.5 transition-all'>
                      <div className='flex min-w-0 items-center gap-3'>
                        <div className='bg-background relative h-12 w-12 shrink-0 overflow-hidden rounded-md border'>
                          {p.first_image ? (
                            <img src={p.first_image} alt={name} className='h-full w-full object-cover' />
                          ) : (
                            <div className='text-muted-foreground flex h-full w-full items-center justify-center'>
                              <Package className='h-4 w-4' />
                            </div>
                          )}
                        </div>
                        <div className='min-w-0 flex-1'>
                          <div className='flex items-center gap-1.5'>
                            {p.product_code && (
                              <span className='bg-muted text-muted-foreground rounded px-1.5 py-0.5 font-mono text-[10px]'>
                                {p.product_code}
                              </span>
                            )}
                            <p className='truncate text-xs font-semibold'>{name}</p>
                          </div>
                          <p className='text-muted-foreground text-[11px] font-medium'>₩{Number(price).toLocaleString()}</p>
                        </div>
                      </div>

                      {!isReadonly && (
                        <Button
                          type='button'
                          size='icon-sm'
                          variant='ghost'
                          onClick={() => handleRemoveProduct(p.product_id)}
                          className='text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-7 w-7'>
                          <Trash2 className='h-3.5 w-3.5' />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </AppDialog>

      {/* Product Picker Dialog */}
      <CraftsmanshipProductPickerModal
        open={isPickerOpen}
        onOpenChange={setIsPickerOpen}
        selectedProductIds={productIds}
        onConfirm={handleAddProducts}
      />
    </>
  );
};

export default CraftsmanshipUpsertModal;
