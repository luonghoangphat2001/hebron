import CategoryManageModal from '@/components/shared/CategoryManageModal';
import {
  useFAQCategoryCreateMutation,
  useFAQCategoryDeleteMutation,
  useFAQCategoryListQuery,
  useFAQCategoryUpdateMutation,
} from '@/data/faq/faq.query';
import { useTranslation } from 'react-i18next';

type Props = {
  open: boolean;
  setOpen: (value: boolean) => void;
};

const FAQCategoryModal = ({ open, setOpen }: Props) => {
  const { t: tContent } = useTranslation('content');
  const { data: categories = [], isLoading } = useFAQCategoryListQuery();
  const { mutate: mutateCreate, isPending: isCreating } = useFAQCategoryCreateMutation();
  const { mutate: mutateUpdate, isPending: isUpdating } = useFAQCategoryUpdateMutation();
  const { mutate: mutateDelete, isPending: isDeleting } = useFAQCategoryDeleteMutation();

  return (
    <CategoryManageModal
      open={open}
      setOpen={setOpen}
      title={tContent('faq.modal_category')}
      addButtonText={tContent('faq.add_category')}
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

export default FAQCategoryModal;
