import { appToast } from '@/components/toast/AppToast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppUpload from '@/components/upload/AppUpload';
import { uploadFileAPI } from '@/data/file/file.api';
import type { UpdatePageSectionREQ } from '@/data/homepage-management/homepage.request';
import { buildFooterQuickLinksUpdatePayload } from '@/data/homepage-management/homepage.service';
import type { FooterQuickLinkItem, MallSection } from '@/data/homepage-management/homepage.type';
import { FileType } from '@/utils/enums/file.enum';
import { ImageIcon, Link2, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSectionActionLoading } from '../../hooks/useSectionActionLoading';
import SectionHeader from '../ui/SectionHeader';

type Props = {
  section: MallSection;
  onSaveSection?: (payload?: Partial<UpdatePageSectionREQ>) => Promise<any> | void;
};

export const FooterQuickLinksEditor: React.FC<Props> = ({ section, onSaveSection }) => {
  const { t: tCommon } = useTranslation('common');
  const { t: tContent } = useTranslation('content');
  const { t: tEnum } = useTranslation('enum');

  const rawContent = (section.rawSection?.content || {}) as any;
  const items: FooterQuickLinkItem[] = Array.isArray(rawContent?.items) ? rawContent.items : [];
  const orderMethodItem = items.find((it) => it?.field_name === 'order_method');

  const [imageUrl, setImageUrl] = useState(orderMethodItem?.image || '');
  const [isUploading, setIsUploading] = useState(false);
  const { isLoading, isLoadingTarget, runWithLoading } = useSectionActionLoading<'save_quick_links'>();

  useEffect(() => {
    const raw = (section.rawSection?.content || {}) as any;
    const currentItems: FooterQuickLinkItem[] = Array.isArray(raw?.items) ? raw.items : [];
    const found = currentItems.find((it) => it?.field_name === 'order_method');
    if (found?.image !== undefined) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setImageUrl(found.image);
    }
  }, [section.rawSection?.content]);

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const resp = await uploadFileAPI(file, FileType.BANNERS);
      const url = resp?.data?.file?.url;
      appToast.success(tCommon('notify.success_upload') || 'Uploaded successfully');
      return url;
    } catch (err: any) {
      appToast.error(err?.response?.data?.message || tCommon('notify.fail_upload'));
      return null;
    }
  };

  const handleFileUpload = async (val?: string | File | (string | File)[]) => {
    if (!val) return;
    if (typeof val === 'string') {
      setImageUrl(val);
    } else if (val instanceof File) {
      setIsUploading(true);
      const url = await uploadFile(val);
      setIsUploading(false);
      if (url) {
        setImageUrl(url);
      }
    }
  };

  const handleSave = () => {
    return runWithLoading('save_quick_links', () =>
      onSaveSection?.(buildFooterQuickLinksUpdatePayload(imageUrl, section.enabled, section)),
    );
  };

  return (
    <div className='space-y-6'>
      <SectionHeader
        title={tEnum('content.footer_quick_links')}
        icon={Link2}
        onSave={handleSave}
        isSaving={isLoadingTarget('save_quick_links')}
        saveDisabled={isLoading || isUploading}
      />

      <div className='bg-card space-y-5 rounded-xl border p-5 shadow-2xs'>
        <div className='flex items-center justify-between border-b pb-3'>
          <div className='space-y-1'>
            <div className='flex items-center gap-2'>
              <h5 className='text-foreground text-sm font-bold'>주문 방법 안내</h5>
            </div>
            <p className='text-muted-foreground text-xs'>
              {tContent('homepage.order_method_desc', '쇼핑몰 하단 푸터 영역에 노출되는 주문 방법 바로가기 이미지 배너입니다.')}
            </p>
          </div>

          {imageUrl && (
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={() => setImageUrl('')}
              className='text-destructive hover:text-destructive h-7 gap-1 px-2.5 text-xs'>
              <Trash2 className='h-3.5 w-3.5' /> {tContent('homepage.delete_image', '이미지 삭제')}
            </Button>
          )}
        </div>

        {/* Image Preview */}
        <div className='bg-muted/20 relative aspect-[8/5] max-w-xl overflow-hidden rounded-xl border'>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt='Order Method'
              className='h-full w-full object-cover transition-transform duration-300 hover:scale-105'
            />
          ) : (
            <div className='text-muted-foreground flex h-full w-full flex-col items-center justify-center gap-2'>
              <ImageIcon className='h-10 w-10' />
              <p className='text-xs'>등록된 주문 방법 배너 이미지가 없습니다.</p>
            </div>
          )}
        </div>

        {/* Upload and URL input */}
        <div className='max-w-xl space-y-3 pt-1'>
          <label className='text-foreground text-xs font-semibold'>
            {tContent('homepage.banner_image', '배너 이미지 업로드')}
          </label>
          <AppUpload
            value={imageUrl}
            onChange={handleFileUpload}
            type='image'
            disabled={isUploading}
            previewHeight='h-28 w-full'
          />

          <Input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder='https://...'
            className='h-8 font-mono text-xs'
          />
        </div>

        {/* <div className='flex justify-end pt-2'>
          <Button onClick={handleSave} disabled={isLoading || isUploading} size='sm'>
            {isLoadingTarget('save_quick_links') && <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' />}
            {tCommon('button.save')}
          </Button>
        </div> */}
      </div>
    </div>
  );
};

export default FooterQuickLinksEditor;
