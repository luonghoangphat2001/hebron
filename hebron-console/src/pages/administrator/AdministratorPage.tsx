import Can from '@/components/Can';
import PageTitle from '@/components/PageTitle';
import ConfirmDialog from '@/components/dialog/ConfirmDialog';
import { appToast } from '@/components/toast/AppToast';
import { Button } from '@/components/ui/button';
import { useAdminDeleteMutation, useAdminListQuery } from '@/data/admin/admin.query';
import type { AdminListREQ } from '@/data/admin/admin.request';
import { getAdminListInitFilter } from '@/data/admin/admin.service';
import { useFilterPaging } from '@/hooks/useFilterPaging';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AdministratorChangePasswordModal from './components/AdministratorChangePasswordModal';
import AdministratorFilter from './components/AdministratorFilter';
import AdministratorTable from './components/AdministratorTable';
import AdministratorUpsertModal from './components/AdministratorUpsertModal';

const AdministratorPage = () => {
  const { t: tSidebar } = useTranslation('sidebar');
  const { t: tCommon } = useTranslation('common');
  const [isUpsert, setIsUpsert] = useState(false);
  const [adminId, setAdminId] = useState<number | null>(null);
  const [isChangePassword, setIsChangePassword] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [deleteAdminId, setDeleteAdminId] = useState<number | null>(null);

  const { filter, pagination, handleFilterChange, onPaginationChange } = useFilterPaging<AdminListREQ>({
    getInitialFilter: getAdminListInitFilter,
  });

  //api list
  const { data: dataAdmin, isLoading } = useAdminListQuery(filter);
  const { mutate: mutateDelete, isPending: isDeleting } = useAdminDeleteMutation({
    onSuccess: () => {
      setIsDelete(false);
      setDeleteAdminId(null);
      appToast.success(tCommon('notify.success_delete'));
    },
    onError: (error) => {
      appToast.error(error.response?.data.message || tCommon('notify.fail_delete'));
    },
  });

  const clickCreate = () => {
    setAdminId(null);
    setIsUpsert(true);
  };

  const clickUpdate = (id: number) => {
    setAdminId(id);
    setIsUpsert(true);
  };

  const clickResetPassword = (id: number) => {
    setAdminId(id);
    setIsChangePassword(true);
  };

  const clickDelete = (id: number) => {
    setDeleteAdminId(id);
    setIsDelete(true);
  };

  const confirmDelete = () => {
    if (!deleteAdminId || isDeleting) return;

    mutateDelete(deleteAdminId);
  };

  return (
    <main className='space-y-6'>
      <PageTitle
        title={tSidebar('administrator_management')}
        extra={
          <div className='space-x-2'>
            <Can action='register'>
              <Button onClick={clickCreate}>
                <Plus /> {tCommon('button.create')}
              </Button>
            </Can>
          </div>
        }
      />
      <AdministratorFilter filter={filter} handleFilterChange={handleFilterChange} />
      <AdministratorTable
        data={dataAdmin?.list || []}
        isLoading={isLoading}
        totalRecord={dataAdmin?.pagination.total_item || 0}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        clickUpdate={clickUpdate}
        clickResetPassword={clickResetPassword}
        clickDelete={clickDelete}
      />
      <AdministratorUpsertModal open={isUpsert} setOpen={setIsUpsert} adminId={adminId} />
      <AdministratorChangePasswordModal open={isChangePassword} setOpen={setIsChangePassword} adminId={adminId} />
      <ConfirmDialog
        open={isDelete}
        onOpenChange={setIsDelete}
        title={tCommon('confirm.delete_administrator_title')}
        description={tCommon('confirm.delete_administrator_description')}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        variant='destructive'
      />
    </main>
  );
};

export default AdministratorPage;
