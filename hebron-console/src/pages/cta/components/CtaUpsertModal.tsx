import AppDialog from '@/components/dialog/AppDialog';
import { appToast } from '@/components/toast/AppToast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { uploadAttachmentFiles } from '@/components/upload/AttachmentFile';
import { useAboutCtaUpdateMutation } from '@/data/cta/cta.query';
import type { AboutCTA } from '@/data/cta/cta.response';
import { CTA_MAX_PRODUCTS, transformInputToAboutCtaUpdateREQ } from '@/data/cta/cta.service';
import type { Product } from '@/data/product/product.response';
import { SiteType } from '@/utils/enums/common.enum';
import { FileType } from '@/utils/enums/file.enum';
import { Globe, ImageIcon, Pencil, UploadIcon, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CtaProductSelectModal from './CtaProductSelectModal';

export type CtaUpsertMode = 'edit' | 'view';

type CtaItem = {
  id: string;
  product_id: number;
  image: string;
  file?: File;
};

type CtaUpsertModalProps = {
  open: boolean;
  setOpen: (value: boolean) => void;
  siteType: SiteType | null;
  cta?: AboutCTA | null;
  mode: CtaUpsertMode;
};

const CtaUpsertModal: React.FC<CtaUpsertModalProps> = ({ open, setOpen, siteType, cta, mode }) => {
  const { t: tContent } = useTranslation('content');
  const { t: tCommon } = useTranslation('common');
  const { t: tEnum } = useTranslation('enum');

  const isReadonly = mode === 'view';
  const [items, setItems] = useState<CtaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutateAsync: mutateUpdateAsync, isPending: isUpdating } = useAboutCtaUpdateMutation();

  useEffect(() => {
    if (!open) {
      setItems([]);
      setPendingFile(null);
      setEditingIndex(null);
      return;
    }

    setItems(
      (cta?.content?.item || []).map((it, idx) => ({
        id: `remote-${it.product_id}-${idx}`,
        product_id: it.product_id,
        image: it.image,
      })),
    );
  }, [open, cta]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (items.length >= CTA_MAX_PRODUCTS) {
      appToast.warning(tContent('cta.limit_reached', '최대 20개까지 등록할 수 있습니다.'));
      return;
    }

    setPendingFile(file);
  };

  const handleProductSelect = ([product]: Product[]) => {
    if (!product) return;

    if (editingIndex !== null) {
      setItems((prev) => prev.map((it, idx) => (idx === editingIndex ? { ...it, product_id: product.id } : it)));
      setEditingIndex(null);
      return;
    }

    if (pendingFile) {
      setItems((prev) => [
        ...prev,
        {
          id: `local-${Date.now()}`,
          product_id: product.id,
          image: URL.createObjectURL(pendingFile),
          file: pendingFile,
        },
      ]);
      setPendingFile(null);
    }
  };

  const handleRemove = (index: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSave = async () => {
    if (!siteType || isUpdating || uploading) return;

    try {
      setUploading(true);
      const resolvedItems = await Promise.all(
        items.map(async (item) => {
          if (!item.file) return { product_id: item.product_id, image: item.image };
          const [uploaded] = await uploadAttachmentFiles(
            {
              localId: item.id,
              name: item.file.name,
              size: item.file.size,
              mime_type: item.file.type,
              file: item.file,
            },
            FileType.PRODUCT_IMAGES,
          );
          return { product_id: item.product_id, image: uploaded?.url || item.image };
        }),
      );

      await mutateUpdateAsync({
        siteType,
        body: transformInputToAboutCtaUpdateREQ({ site_type: siteType, item: resolvedItems }),
      });
      setOpen(false);
      appToast.success(tCommon('notify.success_update'));
    } catch {
      appToast.error(tCommon('notify.fail_update'));
    } finally {
      setUploading(false);
    }
  };

  const title = mode === 'edit' ? tContent('cta.modal_edit') : tContent('cta.modal_detail');

  return (
    <>
      <input ref={fileInputRef} type='file' accept='image/*' className='hidden' onChange={handleFileChange} />

      <AppDialog
        open={open}
        onOpenChange={setOpen}
        title={title}
        onOk={isReadonly ? undefined : handleSave}
        loading={isUpdating || uploading}
        textCancel={isReadonly ? tCommon('button.close') : undefined}
        className='sm:max-w-xl'>
        <div className='space-y-5'>
          {/* Target Site Info */}
          <div className='border-border bg-muted/20 flex items-center justify-between rounded-lg border px-4 py-3'>
            <div className='flex items-center gap-2'>
              <Globe className='text-primary h-4 w-4' />
              <span className='text-muted-foreground text-xs font-semibold'>{tContent('cta.field_site_type')}:</span>
              <Badge variant='outline' className='font-semibold'>
                {siteType ? tEnum(`common.${siteType}` as any) || siteType : '-'}
              </Badge>
            </div>
          </div>

          {/* Showcase Images Gallery */}
          <div className='border-border bg-card rounded-lg border p-4 shadow-2xs'>
            <div className='mb-3 flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <ImageIcon className='text-primary h-4 w-4' />
                <p className='text-sm font-semibold'>{tContent('cta.field_images')}</p>
                <Badge variant={items.length >= CTA_MAX_PRODUCTS ? 'destructive' : 'secondary'} className='text-xs font-medium'>
                  {items.length} / {CTA_MAX_PRODUCTS}
                </Badge>
              </div>
            </div>
            <Separator className='mb-4' />

            <div className='flex flex-wrap items-start gap-2.5'>
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => !isReadonly && setEditingIndex(idx)}
                  className={`group border-border bg-muted/30 relative size-24 shrink-0 overflow-hidden rounded-md border sm:size-28 ${
                    !isReadonly ? 'hover:border-primary/60 cursor-pointer' : ''
                  }`}>
                  <img
                    src={item.image}
                    alt={`Product ${item.product_id}`}
                    className='size-full object-cover transition-transform group-hover:scale-105'
                  />

                  {!isReadonly && (
                    <div className='absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100'>
                      <Pencil className='size-4' />
                      <span className='text-[10px] font-medium'>{tContent('cta.change_product', '상품 변경')}</span>
                    </div>
                  )}

                  <span className='bg-background/90 text-foreground absolute bottom-1 left-1 z-10 rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold shadow-xs'>
                    #{item.product_id}
                  </span>

                  {!isReadonly && (
                    <Button
                      type='button'
                      size='icon'
                      variant='destructive'
                      className='absolute top-1 right-1 z-10 size-6'
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(idx);
                      }}>
                      <X className='size-3.5' />
                    </Button>
                  )}
                </div>
              ))}

              {!isReadonly && items.length < CTA_MAX_PRODUCTS && (
                <button
                  type='button'
                  onClick={() => fileInputRef.current?.click()}
                  title={tCommon('title.click_to_upload')}
                  className='hover:bg-accent text-muted-foreground flex size-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed transition-colors sm:size-28'>
                  <UploadIcon className='size-5' />
                  <span className='px-1 text-center text-[10px] leading-tight'>{tCommon('title.upload_hint', { size: 5 })}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </AppDialog>

      <CtaProductSelectModal
        open={Boolean(pendingFile) || editingIndex !== null}
        setOpen={(isOpen) => {
          if (!isOpen) {
            setPendingFile(null);
            setEditingIndex(null);
          }
        }}
        selectedProductIds={items.filter((_, i) => i !== editingIndex).map((i) => i.product_id)}
        onConfirm={handleProductSelect}
        mode='single'
        title={
          editingIndex !== null
            ? tContent('cta.change_product', '연결 상품 변경')
            : tContent('cta.select_product_for_image', '업로드한 이미지에 연결할 상품 선택')
        }
      />
    </>
  );
};

export default CtaUpsertModal;
