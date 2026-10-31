import CategoryManageModal from '@/components/shared/CategoryManageModal';
import {
  usePortfolioCategoryCreateMutation,
  usePortfolioCategoryDeleteMutation,
  usePortfolioCategoryListQuery,
  usePortfolioCategoryUpdateMutation,
} from '@/data/portfolio/portfolio.query';
import { useTranslation } from 'react-i18next';

type Props = {
  open: boolean;
  setOpen: (value: boolean) => void;
};

const PortfolioCategoryModal = ({ open, setOpen }: Props) => {
  const { t: tContent } = useTranslation('content');
  const { data: categories = [], isLoading } = usePortfolioCategoryListQuery();
  const { mutate: mutateCreate, isPending: isCreating } = usePortfolioCategoryCreateMutation();
  const { mutate: mutateUpdate, isPending: isUpdating } = usePortfolioCategoryUpdateMutation();
  const { mutate: mutateDelete, isPending: isDeleting } = usePortfolioCategoryDeleteMutation();

  return (
    <CategoryManageModal
      open={open}
      setOpen={setOpen}
      title={tContent('portfolio.modal_category')}
      addButtonText={tContent('portfolio.add_category')}
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

export default PortfolioCategoryModal;
