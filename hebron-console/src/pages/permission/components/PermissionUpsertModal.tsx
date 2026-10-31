import AppDialog from '@/components/dialog/AppDialog';
import FormItem from '@/components/form/FormItem';
import AppSelect from '@/components/select/AppSelect';
import { appToast } from '@/components/toast/AppToast';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  usePermissionCreateMutation,
  usePermissionDetailQuery,
  usePermissionListQuery,
  usePermissionUpdateMutation,
} from '@/data/permission/permission.query';
import type { MenuPermissionREQ } from '@/data/permission/permission.request';
import type { MenuPermission } from '@/data/permission/permission.response';
import { nextCopyName } from '@/data/permission/permission.service';
import { permissionInputDefault, permissionUpsertSchema, type PermissionInput } from '@/schemas/permission/permission.schema';
import { STATUS_ENUM_KEY } from '@/utils/constants/common.constant';
import {
  DEFAULT_MENU_ACTIONS,
  PERMISSION_ACTIONS,
  PERMISSION_MENU_GROUPS,
  SYSTEM_MENUS,
  type PermissionActionKey,
  type SystemMenu,
} from '@/utils/constants/permission.constant';
import { Status } from '@/utils/enums/common.enum';
import { zodResolver } from '@hookform/resolvers/zod';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { Controller, useForm, type Resolver } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

type MatrixState = Record<string, Record<PermissionActionKey, boolean>>;

const getInitialMatrix = (): MatrixState => Object.fromEntries(SYSTEM_MENUS.map((m) => [m.key, { ...DEFAULT_MENU_ACTIONS }]));

const isPermissionActionKey = (value: string): value is PermissionActionKey => value in DEFAULT_MENU_ACTIONS;

const matrixFromMenuPermissions = (menuPermissions: MenuPermission[]): MatrixState => {
  const base = getInitialMatrix();
  menuPermissions.forEach((mp) => {
    if (!base[mp.menu]) return;
    const actions = { ...DEFAULT_MENU_ACTIONS, view: true };
    mp.actions.filter(isPermissionActionKey).forEach((key) => {
      actions[key] = true;
    });
    base[mp.menu] = actions;
  });
  return base;
};

const buildMenuPermissionsREQ = (matrix: MatrixState): MenuPermissionREQ[] =>
  SYSTEM_MENUS.filter((menu) => matrix[menu.key]?.view).map((menu) => ({
    menu: menu.key,
    actions: ['view', ...PERMISSION_ACTIONS.filter((a) => matrix[menu.key]?.[a.key]).map((a) => a.key)],
  }));

type Props = {
  open: boolean;
  setOpen: (value: boolean) => void;
  permissionId?: number | null;
};

const PermissionUpsertModal = ({ open, setOpen, permissionId }: Props) => {
  const { t: tPermission } = useTranslation('system');
  const { t: tEnum } = useTranslation('enum');
  const { t: tSidebar } = useTranslation('sidebar');
  const { t: tCommon } = useTranslation('common');
  const isEdit = !!permissionId;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PermissionInput>({
    mode: 'all',
    defaultValues: permissionInputDefault,
    resolver: zodResolver(permissionUpsertSchema) as Resolver<PermissionInput>,
  });

  const [matrix, setMatrix] = useState<MatrixState>(getInitialMatrix());
  const [selectedCopyFromId, setSelectedCopyFromId] = useState<number | undefined>();

  const { data: dataDetail, isLoading: isDetailLoading } = usePermissionDetailQuery(isEdit && open ? permissionId : undefined);
  const { data: copyListData } = usePermissionListQuery({ page: 1, per_page: 100 });
  const { data: copySourceDetail } = usePermissionDetailQuery(!isEdit && open ? selectedCopyFromId : undefined);

  const { mutate: mutateCreate, isPending: isCreating } = usePermissionCreateMutation();
  const { mutate: mutateUpdate, isPending: isUpdating } = usePermissionUpdateMutation();

  const statusOptions = useMemo(
    () => Object.values(Status).map((v) => ({ value: v, label: tEnum(STATUS_ENUM_KEY[v]) })),
    [tEnum],
  );
  const copyOptions = useMemo(() => (copyListData?.list || []).map((p) => ({ value: p.id, label: p.name })), [copyListData]);

  const handleCopyFromChange = (id?: number) => {
    setSelectedCopyFromId(id);
    if (!id) setMatrix(getInitialMatrix());
  };

  // ticking an action implies access to the page, an access-less menu is not sent at all
  const handleCellChange = (menuKey: string, actionKey: PermissionActionKey, checked: boolean) => {
    setMatrix((prev) => ({
      ...prev,
      [menuKey]: { ...prev[menuKey], [actionKey]: checked, view: checked || prev[menuKey].view },
    }));
  };

  const handleToggleAccess = (menuKey: string, checked: boolean) => {
    setMatrix((prev) => ({ ...prev, [menuKey]: checked ? { ...prev[menuKey], view: true } : { ...DEFAULT_MENU_ACTIONS } }));
  };

  const handleSelectAllColumn = (actionKey: PermissionActionKey, checked: boolean) => {
    setMatrix((prev) => {
      const next = { ...prev };
      SYSTEM_MENUS.forEach((m) => {
        next[m.key] = { ...next[m.key], [actionKey]: checked, view: checked || next[m.key].view };
      });
      return next;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    setMatrix((prev) =>
      Object.fromEntries(
        SYSTEM_MENUS.map((m) => [m.key, checked ? { ...prev[m.key], view: true } : { ...DEFAULT_MENU_ACTIONS }]),
      ),
    );
  };

  const handleSelectAllGroup = (menus: SystemMenu[], checked: boolean) => {
    setMatrix((prev) => {
      const next = { ...prev };
      menus.forEach((m) => {
        next[m.key] = checked ? { ...next[m.key], view: true } : { ...DEFAULT_MENU_ACTIONS };
      });
      return next;
    });
  };

  const hasAccess = (menuKey: string) => !!matrix[menuKey]?.view;
  // full row = access + every action, access with anything missing stays indeterminate
  const rowCheckedState = (menuKey: string) =>
    (hasAccess(menuKey) && PERMISSION_ACTIONS.every((a) => matrix[menuKey]?.[a.key])) || (hasAccess(menuKey) && 'indeterminate');

  const isColumnAllChecked = (actionKey: PermissionActionKey) => SYSTEM_MENUS.every((m) => matrix[m.key]?.[actionKey]);
  const isColumnSomeChecked = (actionKey: PermissionActionKey) => SYSTEM_MENUS.some((m) => matrix[m.key]?.[actionKey]);
  const columnCheckedState = (actionKey: PermissionActionKey) =>
    isColumnAllChecked(actionKey) || (isColumnSomeChecked(actionKey) && 'indeterminate');

  const isGroupAllChecked = (menus: SystemMenu[]) => menus.every((m) => hasAccess(m.key));
  const isGroupSomeChecked = (menus: SystemMenu[]) => menus.some((m) => hasAccess(m.key));
  const groupCheckedState = (menus: SystemMenu[]) => isGroupAllChecked(menus) || (isGroupSomeChecked(menus) && 'indeterminate');

  const isAllChecked = SYSTEM_MENUS.every((m) => hasAccess(m.key));
  const isSomeChecked = SYSTEM_MENUS.some((m) => hasAccess(m.key));
  const allCheckedState = isAllChecked || (isSomeChecked && 'indeterminate');

  const onCreate = (input: PermissionInput) => {
    if (isCreating) return;

    mutateCreate(
      {
        name: input.name.trim(),
        description: input.description?.trim() || undefined,
        usage_status: input.usage_status,
        menu_permissions: buildMenuPermissionsREQ(matrix),
      },
      {
        onSuccess: () => {
          setOpen(false);
          appToast.success(tCommon('notify.success_create'));
        },
        onError: (error) => appToast.error(error.response?.data.message || tCommon('notify.fail_create')),
      },
    );
  };

  const onUpdate = (input: PermissionInput) => {
    if (!permissionId || isUpdating) return;

    mutateUpdate(
      {
        id: permissionId,
        name: input.name.trim(),
        description: input.description?.trim() || undefined,
        usage_status: input.usage_status,
        menu_permissions: buildMenuPermissionsREQ(matrix),
      },
      {
        onSuccess: () => {
          setOpen(false);
          appToast.success(tCommon('notify.success_update'));
        },
        onError: (error) => appToast.error(error.response?.data.message || tCommon('notify.fail_update')),
      },
    );
  };

  // Reset form when the modal opens (edit mode fills in once the detail arrives)
  useEffect(() => {
    if (!open) return;
    if (!isEdit) {
      reset(permissionInputDefault);
      setMatrix(getInitialMatrix());
      setSelectedCopyFromId(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isEdit]);

  useEffect(() => {
    if (!dataDetail) return;
    reset({
      name: dataDetail.name,
      description: dataDetail.description || '',
      usage_status: dataDetail.usage_status.value,
    });
    setMatrix(matrixFromMenuPermissions(dataDetail.menu_permissions));
  }, [dataDetail, reset]);

  useEffect(() => {
    if (!copySourceDetail) return;
    reset({
      name: nextCopyName(copySourceDetail.name),
      description: copySourceDetail.description || '',
      usage_status: copySourceDetail.usage_status.value,
    });
    setMatrix(matrixFromMenuPermissions(copySourceDetail.menu_permissions));
  }, [copySourceDetail, reset]);

  return (
    <AppDialog
      open={open}
      onOpenChange={setOpen}
      title={isEdit ? tPermission('permission.modal.title_edit') : tPermission('permission.modal.title_create')}
      onOk={handleSubmit(isEdit ? onUpdate : onCreate)}
      loading={isCreating || isUpdating}
      contentLoading={isEdit && isDetailLoading}
      className='sm:max-w-5xl'>
      <div className='space-y-6'>
        {/* Basic Info */}
        <div className='grid grid-cols-2 gap-4'>
          <FormItem label={tPermission('permission.field.name')} required error={errors.name?.message}>
            <Controller
              control={control}
              name='name'
              render={({ field }) => <Input {...field} placeholder={tPermission('permission.placeholder.name')} />}
            />
          </FormItem>
          <FormItem label={tPermission('permission.field.status')} required error={errors.usage_status?.message}>
            <Controller
              control={control}
              name='usage_status'
              render={({ field }) => <AppSelect options={statusOptions} value={field.value} onChange={field.onChange} />}
            />
          </FormItem>
          <div className='col-span-2'>
            <FormItem label={tPermission('permission.field.description')} error={errors.description?.message}>
              <Controller
                control={control}
                name='description'
                render={({ field }) => (
                  <Textarea {...field} placeholder={tPermission('permission.placeholder.description')} rows={3} />
                )}
              />
            </FormItem>
          </div>
        </div>

        {/* Copy From (create mode only) */}
        {!isEdit && (
          <>
            <Separator />
            <FormItem label={tPermission('permission.field.copy_from')}>
              <AppSelect
                options={copyOptions}
                value={selectedCopyFromId}
                onChange={handleCopyFromChange}
                placeholder={tPermission('permission.placeholder.copy_from')}
                showSearch
              />
            </FormItem>
          </>
        )}

        <Separator />

        {/* Permission Matrix */}
        <div>
          <p className='mb-3 text-sm font-medium'>{tPermission('permission.modal.matrix_title')}</p>
          <div className='overflow-x-auto rounded-md border'>
            <table className='w-full text-sm'>
              <thead className='bg-slate-100'>
                <tr>
                  <th className='px-3 py-2.5 text-left font-medium text-gray-600'>
                    {tPermission('permission.modal.matrix_access')}
                  </th>
                  <th className='min-w-2 px-2 py-2.5'></th>
                  {PERMISSION_ACTIONS.map((action) => (
                    <th key={action.key} className='min-w-2 px-2 py-2.5 text-center font-medium text-gray-600'>
                      {tPermission(`permission.action.${action.key}`)}
                    </th>
                  ))}
                </tr>
                <tr className='border-t bg-slate-50'>
                  <td className='px-3 py-2'>
                    <div className='flex items-center gap-2'>
                      <Checkbox
                        className='cursor-pointer'
                        checked={allCheckedState}
                        onCheckedChange={(c) => handleSelectAll(!!c)}
                      />
                      <span className='text-xs font-medium text-gray-500'>
                        {tPermission('permission.modal.matrix_select_all')}
                      </span>
                    </div>
                  </td>
                  <td className='px-2 py-2'></td>
                  {PERMISSION_ACTIONS.map((action) => (
                    <td key={action.key} className='px-2 py-2'>
                      <div className='flex justify-center'>
                        <Checkbox
                          className='cursor-pointer'
                          checked={columnCheckedState(action.key)}
                          onCheckedChange={(c) => handleSelectAllColumn(action.key, !!c)}
                        />
                      </div>
                    </td>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERMISSION_MENU_GROUPS.map((group) => {
                  const selectedCount = group.menus.filter((m) => hasAccess(m.key)).length;

                  return (
                    <Fragment key={group.key}>
                      <tr className='border-t border-gray-200 bg-slate-50'>
                        <td colSpan={2 + PERMISSION_ACTIONS.length} className='px-3 py-2.5'>
                          <div className='flex items-center gap-2'>
                            <Checkbox
                              className='cursor-pointer'
                              checked={groupCheckedState(group.menus)}
                              onCheckedChange={(c) => handleSelectAllGroup(group.menus, !!c)}
                            />
                            <div>
                              <p className='font-medium text-gray-700'>{tSidebar(group.groupSidebarKey)}</p>
                              <p className='text-xs text-gray-400'>
                                {tPermission('permission.modal.matrix_menus_selected', {
                                  selected: selectedCount,
                                  total: group.menus.length,
                                })}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                      {group.menus.map((menu) => (
                        <tr key={menu.key} className='border-t bg-white'>
                          <td className='border-r'></td>
                          <td className='py-2.5 pr-3'>
                            <div className='flex items-center gap-2 pl-3'>
                              <Checkbox
                                className='cursor-pointer'
                                checked={rowCheckedState(menu.key)}
                                onCheckedChange={() => handleToggleAccess(menu.key, !hasAccess(menu.key))}
                              />
                              <span className='text-gray-700'>{tSidebar(menu.sidebarKey)}</span>
                            </div>
                          </td>
                          {PERMISSION_ACTIONS.map((action) => (
                            <td key={action.key} className='px-2 py-2.5'>
                              <div className='flex justify-center'>
                                <Checkbox
                                  className='cursor-pointer'
                                  checked={matrix[menu.key]?.[action.key] ?? false}
                                  onCheckedChange={(c) => handleCellChange(menu.key, action.key, !!c)}
                                />
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppDialog>
  );
};

export default PermissionUpsertModal;
