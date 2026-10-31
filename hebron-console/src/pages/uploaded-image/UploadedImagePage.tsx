import Can from '@/components/Can';
import PageTitle from '@/components/PageTitle';
import { Button } from '@/components/ui/button';
import type { FileRESP } from '@/data/file/file.response';
import { useUploadedImageListQuery } from '@/data/file/file.query';
import { getUploadedImageListInitFilter, transformUploadedImageFilterToREQ } from '@/data/file/file.service';
import { useFilterPaging } from '@/hooks/useFilterPaging';
import { Upload } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import UploadedImageDetailModal from './components/UploadedImageDetailModal';
import UploadedImageFilter, { type UploadedImageFilterValues } from './components/UploadedImageFilter';
import UploadedImageTable from './components/UploadedImageTable';
import UploadImageModal from './components/UploadImageModal';

const UploadedImagePage = () => {
  const { t: tSidebar } = useTranslation('sidebar');
  const { t: tContent } = useTranslation('content');

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [detailItem, setDetailItem] = useState<FileRESP | null>(null);

  const { filter, pagination, handleFilterChange, onPaginationChange } = useFilterPaging<UploadedImageFilterValues>({
    getInitialFilter: getUploadedImageListInitFilter,
  });

  const queryParams = useMemo(() => transformUploadedImageFilterToREQ(filter), [filter]);
  const { data: listData, isLoading } = useUploadedImageListQuery(queryParams);

  const openView = (id: number) => {
    const found = listData?.list?.find((item) => item.id === id) || null;
    setDetailItem(found);
    setDetailId(id);
  };

  return (
    <main className='space-y-6'>
      <PageTitle
        title={tSidebar('manage_uploaded_images')}
        extra={
          <Can action='register'>
            <Button onClick={() => setIsUploadOpen(true)}>
              <Upload /> {tContent('button.upload_image')}
            </Button>
          </Can>
        }
      />
      <UploadedImageFilter onFilterChange={handleFilterChange} />
      <UploadedImageTable
        data={listData?.list ?? []}
        totalRows={listData?.pagination?.total_item ?? 0}
        isLoading={isLoading}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        onView={openView}
      />
      <UploadImageModal open={isUploadOpen} setOpen={setIsUploadOpen} />
      <UploadedImageDetailModal
        open={!!detailId}
        setOpen={(open) => {
          if (!open) {
            setDetailId(null);
            setDetailItem(null);
          }
        }}
        imageId={detailId}
        initialData={detailItem}
      />
    </main>
  );
};

export default UploadedImagePage;
