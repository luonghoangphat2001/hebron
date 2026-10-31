import CategoryManageModal from '@/components/shared/CategoryManageModal';
import {
  useNoticeCategoryCreateMutation,
  useNoticeCategoryDeleteMutation,
  useNoticeCategoryListQuery,
  useNoticeCategoryUpdateMutation,
} from '@/data/notice/notice.query';
import { useTranslation } from 'react-i18next';

type Props = {
  open: boolean;
  setOpen: (value: boolean) => void;
};

const NoticeCategoryModal = ({ open, setOpen }: Props) => {
  const { t: tContent } = useTranslation('content');
  const { data: categories = [], isLoading } = useNoticeCategoryListQuery();
  const { mutate: mutateCreate, isPending: isCreating } = useNoticeCategoryCreateMutation();
  const { mutate: mutateUpdate, isPending: isUpdating } = useNoticeCategoryUpdateMutation();
  const { mutate: mutateDelete, isPending: isDeleting } = useNoticeCategoryDeleteMutation();

  return (
    <CategoryManageModal
      open={open}
      setOpen={setOpen}
      title={tContent('notice.modal_category')}
      addButtonText={tContent('notice.add_category')}
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

export default NoticeCategoryModal;
