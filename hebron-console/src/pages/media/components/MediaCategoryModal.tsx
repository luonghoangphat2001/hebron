import CategoryManageModal from '@/components/shared/CategoryManageModal';
import {
  useMediaCategoryCreateMutation,
  useMediaCategoryDeleteMutation,
  useMediaCategoryListQuery,
  useMediaCategoryUpdateMutation,
} from '@/data/media/media.query';
import type { SiteType } from '@/utils/enums/common.enum';
import { useTranslation } from 'react-i18next';

type Props = {
  open: boolean;
  setOpen: (value: boolean) => void;
  siteType?: SiteType;
};

const MediaCategoryModal = ({ open, setOpen }: Props) => {
  const { t: tContent } = useTranslation('content');
  const { data: categories = [], isLoading } = useMediaCategoryListQuery();
  const { mutate: mutateCreate, isPending: isCreating } = useMediaCategoryCreateMutation();
  const { mutate: mutateUpdate, isPending: isUpdating } = useMediaCategoryUpdateMutation();
  const { mutate: mutateDelete, isPending: isDeleting } = useMediaCategoryDeleteMutation();

  return (
    <CategoryManageModal
      open={open}
      setOpen={setOpen}
      title={tContent('media.modal_category')}
      addButtonText={tContent('media.add_category')}
      categories={categories}
      isLoading={isLoading}
      isCreating={isCreating}
      isUpdating={isUpdating}
      isDeleting={isDeleting}
      onCreate={(body, options) => mutateCreate(body, options)}
      onUpdate={(id, body, options) => mutateUpdate({ id, body }, options)}
      onDelete={(id, options) => mutateDelete(id, options)}
    />
  );
};

export default MediaCategoryModal;
