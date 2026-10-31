import { Skeleton } from '@/components/ui/skeleton';
import {
  useTemplateCreateMutation,
  useTemplateQuery,
  useTemplateUpdateMutation,
} from '@/data/product-catalog/product-catalog.query';
import type { Template, TemplateWrite } from '@/data/product-catalog/product-catalog.types';
import { productCatalogApi } from '@/data/product-catalog/product-catalog.api';
import { MY_ROUTE } from '@/utils/constants/route.constant';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import TemplateEditor from './TemplateEditor';
import { QueryError } from './TemplateUi';
import { templateAssetUrl } from './templateAssetUrl';
import { getTemplateErrorMessage } from './templateUtils';
import { useEffect, useMemo, useState } from 'react';
import { useCan, useMenuAccess } from '@/hooks/useMenuAccess';

type TemplatePreviewFiles = { front: File; back?: File };

const preloadImage = (url: string) =>
  new Promise<void>((resolve) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve();
    image.onerror = () => resolve();
    image.src = url;
  });

const useTemplateBackgroundReady = (template?: Template) => {
  const backgroundUrls = useMemo(() => {
    const background = template?.layout_config?.background;
    return [
      background?.front_image_url || template?.background?.image_url || template?.background?.image_path,
      background?.back_image_url,
    ]
      .filter((url): url is string => Boolean(url))
      .map(templateAssetUrl);
  }, [template]);
  const backgroundKey = backgroundUrls.join('|');
  const [loadedBackgroundKey, setLoadedBackgroundKey] = useState<string | null>(null);

  useEffect(() => {
    if (!backgroundKey) return;

    let cancelled = false;
    Promise.all(backgroundUrls.map(preloadImage)).then(() => {
      if (!cancelled) setLoadedBackgroundKey(backgroundKey);
    });

    return () => {
      cancelled = true;
    };
  }, [backgroundKey, backgroundUrls]);

  return !backgroundKey || loadedBackgroundKey === backgroundKey;
};

export function TemplateCreatePage() {
  const navigate = useNavigate();
  const { t } = useTranslation('template');
  const mutation = useTemplateCreateMutation();
  const save = async (payload: TemplateWrite, previewFiles: TemplatePreviewFiles) => {
    try {
      const template = await mutation.mutateAsync(payload);
      await productCatalogApi.templates.upsertPreview(template.id, 'front', previewFiles.front);
      if (previewFiles.back) await productCatalogApi.templates.upsertPreview(template.id, 'back', previewFiles.back);
      toast.success(t('template.message.created'));
      navigate(MY_ROUTE.PRODUCT.TEMPLATE_LIST);
    } catch (error) {
      toast.error(getTemplateErrorMessage(error, t('template.message.create_failed')));
    }
  };
  return <TemplateEditor title={t('template.title.create')} pending={mutation.isPending} onSave={save} />;
}

function TemplateDetail({ readOnly }: { readOnly: boolean }) {
  const navigate = useNavigate();
  const { t } = useTranslation('template');
  const can = useCan();
  const { isLoading: isPermissionLoading } = useMenuAccess();
  const id = Number(useParams().templateId);
  const validId = Number.isFinite(id) && id > 0;
  const query = useTemplateQuery(validId ? id : undefined);
  const mutation = useTemplateUpdateMutation(validId ? id : 0);
  const isBackgroundReady = useTemplateBackgroundReady(query.data);

  if (!validId) return <QueryError message={t('template.message.invalid_id')} />;
  if (query.isLoading) return <Skeleton className='h-[700px] w-full' />;
  if (query.isError || !query.data) {
    return <QueryError message={getTemplateErrorMessage(query.error, t('template.message.not_found'))} />;
  }
  if (!isBackgroundReady) return <Skeleton className='h-[700px] w-full' />;

  if (!readOnly && !isPermissionLoading && !can('edit')) {
    return <Navigate to={MY_ROUTE.PRODUCT.TEMPLATE_DETAIL(id)} replace />;
  }

  const save = async (payload: TemplateWrite, previewFiles: TemplatePreviewFiles) => {
    try {
      await mutation.mutateAsync(payload);
      await productCatalogApi.templates.upsertPreview(id, 'front', previewFiles.front);
      if (previewFiles.back) await productCatalogApi.templates.upsertPreview(id, 'back', previewFiles.back);
      toast.success(t('template.message.updated'));
      navigate(MY_ROUTE.PRODUCT.TEMPLATE_LIST);
    } catch (error) {
      toast.error(getTemplateErrorMessage(error, t('template.message.update_failed')));
    }
  };

  return (
    <TemplateEditor
      key={id}
      title={t(readOnly ? 'template.title.detail' : 'template.title.edit')}
      existing={query.data}
      pending={mutation.isPending}
      onSave={save}
      readOnly={readOnly}
    />
  );
}

export const TemplateEditPage = () => <TemplateDetail readOnly={false} />;
export const TemplateDetailPage = () => <TemplateDetail readOnly />;
