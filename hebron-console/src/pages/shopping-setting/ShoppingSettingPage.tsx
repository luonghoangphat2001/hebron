import Can from '@/components/Can';
import PageTitle from '@/components/PageTitle';
import { AppRichTextEditor } from '@/components/shared/app-rich-text-editor';
import { appToast } from '@/components/toast/AppToast';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useShoppingSettingDetailQuery,
  useShoppingSettingListQuery,
  useShoppingSettingUpdateMutation,
} from '@/data/shopping-setting';
import { cn } from '@/lib/utils';
import { FileType } from '@/utils/enums/file.enum';
import { sanitizeHtml } from '@/utils/helper/string.helper';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const SECTIONS = [
  { key: 'precaution', apiType: 'General Precautions' },
  { key: 'production_guide', apiType: 'General Production Guide' },
  { key: 'shipping', apiType: 'Shipment & Delivery Information' },
  { key: 'usage_guide', apiType: 'User Guide' },
] as const;

type SectionKey = (typeof SECTIONS)[number]['key'];

const CONTENT_MAX_LENGTH = 20000;
const EDITOR_MIN_HEIGHT = 400;

const ShoppingSettingPage = () => {
  const { t: tContent } = useTranslation('content');
  const { t: tCommon } = useTranslation('common');

  const [activeKey, setActiveKey] = useState<SectionKey>(SECTIONS[0].key);
  const [drafts, setDrafts] = useState<Partial<Record<SectionKey, string>>>({});
  const [isPreviewing, setIsPreviewing] = useState(true);

  const { data: settings, isLoading: isLoadingList } = useShoppingSettingListQuery();

  const activeSection = SECTIONS.find((section) => section.key === activeKey)!;
  const settingId = settings?.find((setting) => setting.type === activeSection.apiType)?.id;

  const { data: detail, isLoading: isLoadingDetail } = useShoppingSettingDetailQuery(settingId);

  const isLoading = isLoadingList || isLoadingDetail;
  const activeContent = drafts[activeKey] ?? detail?.content ?? '';
  const isDirty = Boolean(detail) && activeContent !== detail?.content;

  const { mutate: mutateUpdate, isPending: isSaving } = useShoppingSettingUpdateMutation({
    onSuccess: () => {
      setDrafts((prev) => {
        const { [activeKey]: _removed, ...rest } = prev;
        return rest;
      });
      appToast.success(tCommon('notify.success_update'));
    },
    onError: (error) => {
      appToast.error(error.response?.data.message || tCommon('notify.fail_update'));
    },
  });

  const onSelectSection = (key: SectionKey) => {
    setActiveKey(key);
    setIsPreviewing(true);
  };

  const onChangeContent = (html: string) => setDrafts((prev) => ({ ...prev, [activeKey]: html }));

  const onCancel = () =>
    setDrafts((prev) => {
      const { [activeKey]: _removed, ...rest } = prev;
      return rest;
    });

  const onSave = () => {
    if (settingId === undefined || isSaving) return;
    mutateUpdate({ id: settingId, content: activeContent });
  };

  return (
    <main className='space-y-6'>
      <div className='space-y-4'>
        <div className='space-y-1'>
          <PageTitle title={tContent('shopping_setting.page_title')} />
          <p className='text-muted-foreground text-sm'>{tContent('shopping_setting.page_desc')}</p>
        </div>
        <Separator />
      </div>

      <div className='grid gap-6 lg:grid-cols-[260px_1fr]'>
        <nav aria-label={tContent('shopping_setting.page_title')} className='h-fit rounded-lg border p-3'>
          <ul className='space-y-1'>
            {SECTIONS.map((section) => {
              const isActive = section.key === activeKey;

              return (
                <li key={section.key}>
                  <button
                    type='button'
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => onSelectSection(section.key)}
                    className={cn(
                      'hover:bg-muted focus-visible:ring-ring/50 w-full cursor-pointer rounded-md px-3 py-2 text-left text-sm transition-colors focus-visible:ring-3 focus-visible:outline-none',
                      isActive && 'bg-muted font-semibold',
                    )}>
                    {tContent(`shopping_setting.${section.key}`)}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <section className='space-y-4 rounded-lg border p-5'>
          <header className='flex flex-wrap items-start justify-between gap-3'>
            <div className='space-y-1'>
              <h3 className='text-lg font-semibold'>{tContent(`shopping_setting.${activeKey}`)}</h3>
              <p className='text-muted-foreground text-sm'>{tContent('shopping_setting.edit_desc')}</p>
            </div>
            <Can action='edit'>
              <div className='flex items-center gap-2'>
                <Button variant='ghost' disabled={isLoading} onClick={() => setIsPreviewing((prev) => !prev)}>
                  {tCommon(isPreviewing ? 'button.edit' : 'button.preview')}
                </Button>
                <Button variant='outline' disabled={!isDirty || isSaving} onClick={onCancel}>
                  {tCommon('button.cancel')}
                </Button>
                <Button disabled={!isDirty} loading={isSaving} onClick={onSave}>
                  {tCommon('button.save')}
                </Button>
              </div>
            </Can>
          </header>

          {isLoading ? (
            <Skeleton className='w-full' style={{ height: EDITOR_MIN_HEIGHT }} />
          ) : !detail ? (
            <p className='text-muted-foreground text-sm'>{tContent('shopping_setting.empty')}</p>
          ) : isPreviewing ? (
            <div
              className='app-rich-text-editor__content cursor-default rounded-lg border'
              style={{ minHeight: EDITOR_MIN_HEIGHT }}>
              {activeContent ? (
                <div className='tiptap' dangerouslySetInnerHTML={{ __html: sanitizeHtml(activeContent) }} />
              ) : (
                <p className='text-muted-foreground px-4 py-3 text-sm'>{tContent('shopping_setting.preview_empty')}</p>
              )}
            </div>
          ) : (
            <AppRichTextEditor
              key={activeKey}
              value={activeContent}
              onValueChange={onChangeContent}
              placeholder={tContent('shopping_setting.ph_content')}
              maxLength={CONTENT_MAX_LENGTH}
              minHeight={EDITOR_MIN_HEIGHT}
              disabled={isSaving}
              imageUploadMode='immediate'
              imageFileType={FileType.GUIDE_CONTENT_ATTACHMENTS}
            />
          )}
        </section>
      </div>
    </main>
  );
};

export default ShoppingSettingPage;
