import Can from '@/components/Can';
import PageTitle from '@/components/PageTitle';
import { Button } from '@/components/ui/button';
import { useCategoryListQuery } from '@/data/category/category.query';
import type { CategorynNode } from '@/data/category/category.response';
import type { CategoryTreeFilterValues } from '@/data/category/category.service';
import { findCategoryById, normalizeCategoryTree } from '@/data/category/category.tree';
import { MY_ROUTE } from '@/utils/constants/route.constant';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import CategoryDetail from './components/CategoryDetail';
import CategoryTree from './components/CategoryTree';
import CategoryUpsertModal from './components/CategoryUpsertModal';

const CategoryPage = () => {
  const { t: tSidebar } = useTranslation('sidebar');
  const { t: tCategory } = useTranslation('category');
  const navigate = useNavigate();
  const { search } = useLocation();
  const { id } = useParams<{ id?: string }>();

  const [isCreateParent, setIsCreateParent] = useState(false);
  const [isCreateChild, setIsCreateChild] = useState(false);
  const [filters, setFilters] = useState<CategoryTreeFilterValues>({});

  const { data, isLoading } = useCategoryListQuery(filters);
  const categories = useMemo(() => normalizeCategoryTree(data?.data?.categories), [data]);

  // selection is derived from the /category/:id URL — the URL is the single source of truth
  const selected = useMemo(() => (id ? findCategoryById(categories, Number(id)) : null), [id, categories]);

  const handleSelect = (item: CategorynNode) => {
    navigate({ pathname: MY_ROUTE.CATEGORY.DETAIL(item.id), search }, { replace: true });
  };

  const handleDeleted = () => {
    navigate(MY_ROUTE.CATEGORY.INDEX, { replace: true });
  };

  return (
    <main className='flex h-[calc(100vh-6.5rem)] flex-col gap-6'>
      <div className='flex shrink-0 items-center justify-between'>
        <PageTitle title={tSidebar('category_management')} />
        <Can action='register'>
          <Button onClick={() => setIsCreateParent(true)}>
            <Plus className='h-4 w-4' />
            {tCategory('button.add_parent')}
          </Button>
        </Can>
      </div>

      <div className='flex min-h-0 flex-1 gap-6'>
        <CategoryTree
          categories={categories}
          isLoading={isLoading}
          selectedId={selected?.id ?? null}
          onSelect={handleSelect}
          filters={filters}
          onFiltersChange={setFilters}
        />
        <CategoryDetail
          key={selected?.id ?? 'empty'}
          categoryId={selected?.id ?? null}
          onDeleted={handleDeleted}
          onAddSub={() => setIsCreateChild(true)}
        />
      </div>

      <CategoryUpsertModal open={isCreateParent} setOpen={setIsCreateParent} depth={1} />

      {selected && <CategoryUpsertModal open={isCreateChild} setOpen={setIsCreateChild} depth={2} parentCategory={selected} />}
    </main>
  );
};

export default CategoryPage;
