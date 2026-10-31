import { DateRangePicker } from '@/components/date-picker/DateRangePicker';
import FilterContainer from '@/components/FilterContainer';
import FormItem from '@/components/form/FormItem';
import { DataTable } from '@/components/table/DataTable';
import { Spinner } from '@/components/ui/spinner';
import { useMemberActivityLogsQuery } from '@/data/member/member.query';
import type { MemberActivityLogsREQ } from '@/data/member/member.request';
import type { MemberModificationLogItemRESP } from '@/data/member/member.respsonse';
import {
  getMemberActivityLogsInitFilter,
  transformMemberActivityLogsFilterToREQ,
  type MemberActivityLogsFilterValues,
} from '@/data/member/member.service';
import { useFilterPaging } from '@/hooks/useFilterPaging';
import { formatPhone } from '@/utils/helper/common.helper';
import type { ColumnDef } from '@tanstack/react-table';
import { History, ShoppingBag, User } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type MemberActivityLogsTabProps = {
  memberId: number;
};

const MemberActivityLogsTab = ({ memberId }: MemberActivityLogsTabProps) => {
  const { t: tMember } = useTranslation('member');
  const { t: tCommon } = useTranslation('common');

  const { filter, pagination, handleFilterChange, onPaginationChange } = useFilterPaging<MemberActivityLogsFilterValues>({
    getInitialFilter: getMemberActivityLogsInitFilter,
    prefix: 'log',
  });

  const queryParams = useMemo<MemberActivityLogsREQ>(() => transformMemberActivityLogsFilterToREQ(filter), [filter]);

  const { data: activityData, isLoading } = useMemberActivityLogsQuery(memberId, queryParams);

  const activityLogs = activityData?.activity_logs;
  const modificationInfo = activityLogs?.information_modifications;

  const handleResetFilter = () => {
    handleFilterChange({
      login_period: undefined,
      order_period: undefined,
      modification_period: undefined,
    });
  };

  const columns = useMemo<ColumnDef<MemberModificationLogItemRESP>[]>(
    () => [
      {
        id: 'modified_at',
        header: tMember('column.transaction_date', 'Modified At'),
        cell: ({ row }) => <span className='font-mono text-xs text-gray-600 dark:text-gray-400'>{row.original.modified_at}</span>,
        meta: { width: '160px' },
      },
      {
        id: 'description',
        header: tMember('column.description', 'Description'),
        cell: ({ row }) => <span className='text-xs font-medium'>{row.original.description}</span>,
      },
      {
        id: 'modified_by',
        header: tMember('label.actor', 'Modified By'),
        cell: ({ row }) => {
          const user = row.original.modified_by;
          if (!user) return '-';
          return (
            <div className='flex flex-col'>
              <span className='text-xs text-gray-800 dark:text-gray-400'>{user.username}</span>
              <span className='text-[10px] text-gray-600 dark:text-gray-400'>({user.email})</span>
            </div>
          );
        },
        meta: { width: '220px' },
      },
      {
        id: 'changes',
        header: tMember('column.changes', 'Changes'),
        cell: ({ row }) => {
          const changes = row.original.fields?.changes;
          if (!changes || Object.keys(changes).length === 0) return '-';

          return (
            <div className='space-y-1 py-1 text-xs'>
              {Object.entries(changes).map(([key, val]) => {
                const fieldLabel = tMember(`field.${key}`, key);
                const isPhoneKey = key.includes('phone') || key.includes('mobile');
                const rawBefore = row.original.fields?.before?.[key];

                const formatValue = (v: unknown): string | null => {
                  if (v === undefined || v === null) return null;
                  const str = String(v);
                  return isPhoneKey ? formatPhone(str) : str;
                };

                const beforeVal = formatValue(rawBefore);
                const afterVal = formatValue(val) ?? '-';

                return (
                  <div key={key} className='text-muted-foreground flex flex-wrap items-center gap-1'>
                    <span className='font-medium text-gray-700 dark:text-gray-300'>{fieldLabel}:</span>
                    {beforeVal !== null && (
                      <>
                        <span className='text-rose-500/80 line-through'>{beforeVal}</span>
                        <span>→</span>
                      </>
                    )}
                    <span className='font-medium text-emerald-600 dark:text-emerald-400'>{afterVal}</span>
                  </div>
                );
              })}
            </div>
          );
        },
      },
    ],
    [tMember],
  );

  return (
    <div className='space-y-4'>
      {/* Activity Logs Filter */}
      <FilterContainer onResetFilter={handleResetFilter}>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          <FormItem label={tMember('filter.login_date_range', 'Login Date Range')}>
            <DateRangePicker
              value={filter.login_period}
              onChange={(range) => handleFilterChange({ login_period: range })}
              placeholder={tCommon('filter.pick_date_range')}
            />
          </FormItem>

          <FormItem label={tMember('filter.order_date_range', 'Order Date Range')}>
            <DateRangePicker
              value={filter.order_period}
              onChange={(range) => handleFilterChange({ order_period: range })}
              placeholder={tCommon('filter.pick_date_range')}
            />
          </FormItem>

          <FormItem label={tMember('filter.modification_date_range', 'Modification Date Range')}>
            <DateRangePicker
              value={filter.modification_period}
              onChange={(range) => handleFilterChange({ modification_period: range })}
              placeholder={tCommon('filter.pick_date_range')}
            />
          </FormItem>
        </div>
      </FilterContainer>

      {isLoading ? (
        <div className='flex items-center justify-center py-12'>
          <Spinner className='size-6' />
        </div>
      ) : (
        <div className='space-y-4'>
          {/* Recent Logins */}
          <div className='space-y-3 rounded-md border border-gray-200 p-5 dark:border-gray-800'>
            <h4 className='flex items-center gap-2 border-b pb-2 text-sm font-semibold dark:border-gray-800'>
              <User className='size-4 text-blue-600' />
              {tMember('section.recent_logins', 'Recent Logins')}
            </h4>
            {!activityLogs?.recent_logins || activityLogs.recent_logins.length === 0 ? (
              <p className='text-muted-foreground text-xs'>{tMember('empty.no_recent_logins', 'No recent logins found')}</p>
            ) : (
              <div className='space-y-2 text-xs'>
                {activityLogs.recent_logins.map((login) => (
                  <div
                    key={login.id}
                    className='flex items-center justify-between border-b border-gray-100 py-1.5 last:border-0 dark:border-gray-900'>
                    <span className='font-medium text-gray-900 dark:text-gray-100'>
                      {login.event_type_label || login.event_type} ({login.browser_info})
                    </span>
                    <span className='text-muted-foreground font-mono'>
                      {login.ip_address} · {login.connection_time}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Orders */}
          <div className='space-y-3 rounded-md border border-gray-200 p-5 dark:border-gray-800'>
            <h4 className='flex items-center gap-2 border-b pb-2 text-sm font-semibold dark:border-gray-800'>
              <ShoppingBag className='size-4 text-green-600' />
              {tMember('section.recent_orders', 'Recent Orders')}
            </h4>
            {!activityLogs?.recent_orders || activityLogs.recent_orders.length === 0 ? (
              <p className='text-muted-foreground text-xs'>{tMember('empty.no_recent_orders', 'No recent orders found')}</p>
            ) : (
              <div className='space-y-2 text-xs'>
                {activityLogs.recent_orders.map((order) => (
                  <div
                    key={order.id}
                    className='flex items-center justify-between border-b border-gray-100 py-1.5 last:border-0 dark:border-gray-900'>
                    <span className='font-medium text-gray-900 dark:text-gray-100'>
                      {order.order_number} ({order.status})
                    </span>
                    <span className='text-muted-foreground font-mono'>
                      {order.total_amount?.toLocaleString()} KRW · {order.placed_at}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Information Modification Logs Table */}
          <div className='space-y-3 rounded-md border border-gray-200 p-5 dark:border-gray-800'>
            <h4 className='flex items-center gap-2 border-b pb-2 text-sm font-semibold dark:border-gray-800'>
              <History className='size-4 text-amber-600' />
              {tMember('section.modification_log')}
            </h4>

            <DataTable
              data={modificationInfo?.logs || []}
              columns={columns}
              totalRows={modificationInfo?.pagination?.total_item || 0}
              pagination={pagination}
              onPaginationChange={onPaginationChange}
              pageSizeOptions={[10, 20, 50]}
              getRowId={(row) => row.id.toString()}
              emptyMessage={tMember('empty.no_activity_log')}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberActivityLogsTab;
