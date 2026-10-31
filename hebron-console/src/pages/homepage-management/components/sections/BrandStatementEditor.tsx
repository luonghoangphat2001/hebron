import { appToast } from '@/components/toast/AppToast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import AppUpload from '@/components/upload/AppUpload';
import { uploadFileAPI } from '@/data/file/file.api';
import type { UpdatePageSectionREQ } from '@/data/homepage-management/homepage.request';
import { buildBrandStatementUpdatePayload } from '@/data/homepage-management/homepage.service';
import type { BrandStatementContent, MallSection } from '@/data/homepage-management/homepage.type';
import { FileType } from '@/utils/enums/file.enum';
import { ImageIcon, Info, Sparkles, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSectionActionLoading } from '../../hooks/useSectionActionLoading';
import SectionHeader from '../ui/SectionHeader';

type Props = {
  section: MallSection;
  onSaveSection?: (payload?: Partial<UpdatePageSectionREQ>) => Promise<any> | void;
};

export const BrandStatementEditor: React.FC<Props> = ({ section, onSaveSection }) => {
  const { t: tCommon } = useTranslation('common');
  const { t: tContent } = useTranslation('content');
  const { t: tEnum } = useTranslation('enum');

  const rawContent = (section.rawSection?.content || {}) as BrandStatementContent;

  const [heading, setHeading] = useState(section.rawSection?.title || '헤브론 소개');
  const [description, setDescription] = useState(section.rawSection?.description || section.rawSection?.subtitle || '');
  const [imageUrl, setImageUrl] = useState(rawContent.visual?.image_url || section.rawSection?.image || '');
  const [mediaType, setMediaType] = useState(rawContent.visual?.media_type || 'image');
  const imageAlt = rawContent.visual?.alt;
  const position = rawContent.visual?.position;
  const [isUploading, setIsUploading] = useState(false);

  const { isLoading, isLoadingTarget, runWithLoading } = useSectionActionLoading<'save_statement'>();

  const uploadFile = async (file: File, type: FileType): Promise<string | null> => {
    try {
      const resp = await uploadFileAPI(file, type);
      const url = resp?.data?.file?.url;
      appToast.success(tCommon('notify.success_upload') || 'Uploaded successfully');
      return url;
    } catch (err: any) {
      appToast.error(err?.response?.data?.message || tCommon('notify.fail_upload'));
      return null;
    }
  };

  const handleUrlChange = (url: string) => {
    setImageUrl(url);
    setMediaType(/\.mp4(\?|#|$)/i.test(url) ? 'video' : 'image');
  };

  const handleFileUpload = async (val?: string | File | (string | File)[]) => {
    if (!val) return;
    if (typeof val === 'string') {
      handleUrlChange(val);
    } else if (val instanceof File) {
      const isVideo = val.type.startsWith('video/');
      setIsUploading(true);
      const url = await uploadFile(val, isVideo ? FileType.PAGE_VIDEO : FileType.BANNERS);
      setIsUploading(false);
      if (url) {
        setImageUrl(url);
        setMediaType(isVideo ? 'video' : 'image');
      }
    }
  };

  const handleRemoveImage = () => {
    setImageUrl('');
  };

  const handleSave = () => {
    return runWithLoading('save_statement', () =>
      onSaveSection?.(
        buildBrandStatementUpdatePayload(heading, description, imageUrl, imageAlt, position, section.name, section, mediaType),
      ),
    );
  };

  return (
    <div className='space-y-6'>
      <SectionHeader
        title={section.name || tEnum('content.brand_statement', '헤브론 소개')}
        icon={Sparkles}
        badgeText='brand_statement'
        onSave={handleSave}
        isSaving={isLoadingTarget('save_statement')}
        saveDisabled={isLoading || isUploading}
      />

      {/* Main Content Form */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-12'>
        {/* Left Column: Heading & Description Text */}
        <div className='space-y-4 lg:col-span-7'>
          <div className='bg-card space-y-4 rounded-xl border p-4 shadow-2xs'>
            <div className='space-y-1.5'>
              <label className='text-foreground text-xs font-bold'>{tContent('homepage.section_heading')}</label>
              <Textarea
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                placeholder='헤브론 소개'
                rows={2}
                className='text-xs leading-relaxed'
              />
            </div>

            <div className='space-y-1.5'>
              <div className='flex items-center justify-between'>
                <label className='text-foreground text-xs font-bold'>{tContent('homepage.brand_statement_desc_label')}</label>
                <span className='text-muted-foreground font-mono text-[10px]'>{description.length} chars</span>
              </div>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={9}
                placeholder={tContent('homepage.brand_statement_desc_ph')}
                className='text-xs leading-relaxed'
              />
              <p className='text-muted-foreground flex items-center gap-1 text-[11px]'>
                <Info className='h-3 w-3 shrink-0' />
                {tContent('homepage.enter_newline_hint')}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Image & Settings */}
        <div className='space-y-4 lg:col-span-5'>
          <div className='bg-card space-y-4 rounded-xl border p-4 shadow-2xs'>
            <div className='flex items-center justify-between border-b pb-2.5'>
              <div className='flex items-center gap-2'>
                <ImageIcon className='text-primary h-4 w-4' />
                <h5 className='text-foreground text-xs font-bold'>{tContent('homepage.visual_file')}</h5>
              </div>
              {imageUrl && (
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  onClick={handleRemoveImage}
                  className='text-destructive hover:text-destructive h-6 gap-1 px-2 text-[10px]'>
                  <Trash2 className='h-3 w-3' /> {tContent('homepage.delete_file')}
                </Button>
              )}
            </div>

            {imageUrl ? (
              <div className='space-y-2'>
                <div className='bg-muted/40 relative aspect-16/10 w-full overflow-hidden rounded-xl border'>
                  {mediaType === 'video' ? (
                    <video src={imageUrl} className='h-full w-full object-cover' controls muted playsInline />
                  ) : (
                    <img src={imageUrl} alt={imageAlt} className='h-full w-full object-cover' />
                  )}
                </div>
                <Input
                  value={imageUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder='https://...'
                  className='h-8 font-mono text-xs'
                />
              </div>
            ) : (
              <div className='space-y-2'>
                <Input
                  value={imageUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder={tContent('homepage.enter_file_url_ph')}
                  className='h-8 font-mono text-xs'
                />
              </div>
            )}

            <div className='space-y-1.5'>
              <span className='text-muted-foreground text-[11px] font-semibold'>{tContent('homepage.upload_file_directly')}</span>
              <AppUpload type='file' accept='image/*,video/mp4' disabled={isUploading || isLoading} onChange={handleFileUpload} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandStatementEditor;
