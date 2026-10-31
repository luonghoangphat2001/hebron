import { Badge } from '@/components/ui/badge';
import type { MesIntegrationStatus } from '@/data/mes/mes.response';
import { cn } from '@/lib/utils';
import { formatDate } from '@/utils/helper/common.helper';
import { Activity, AlertTriangle, CheckCircle2, Clock, Gauge, Layers, XCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = { data: MesIntegrationStatus };

type StatCard = {
  key: string;
  label: string;
  value: string;
  Icon: LucideIcon;
  iconBg: string;
  iconColor: string;
};

const MesStatusCards = ({ data }: Props) => {
  const { t: tMes } = useTranslation('mes');
  const isHealthy = data.connection_status?.trim().toLowerCase() === 'connected';

  const cards: StatCard[] = [
    {
      key: 'last_sync',
      label: tMes('dashboard.last_sync_time'),
      value: data.last_sync_time ? formatDate(data.last_sync_time, 'YYYY-MM-DD HH:mm') : '-',
      Icon: Clock,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      key: 'response_time',
      label: tMes('dashboard.response_time'),
      value: `${data.response_time ?? 0} ms`,
      Icon: Gauge,
      iconBg: 'bg-violet-100',
      iconColor: 'text-violet-600',
    },
    {
      key: 'success_rate',
      label: tMes('dashboard.success_rate'),
      value: `${data.success_rate ?? 0}%`,
      Icon: CheckCircle2,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      key: 'failed_today',
      label: tMes('dashboard.failed_requests_today'),
      value: (data.failed_requests_today ?? 0).toLocaleString(),
      Icon: XCircle,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
    },
    {
      key: 'total_today',
      label: tMes('dashboard.total_requests_today'),
      value: (data.total_requests_today ?? 0).toLocaleString(),
      Icon: Layers,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
    },
  ];

  return (
    <div className='grid grid-cols-2 gap-4 lg:grid-cols-3'>
      {/* Connection status — highlighted */}
      <div className='rounded-xl border border-gray-200 bg-white p-4'>
        <div className='flex items-start justify-between'>
          <p className='text-sm text-gray-500'>{tMes('dashboard.connection_status')}</p>
          <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', isHealthy ? 'bg-green-100' : 'bg-red-100')}>
            {isHealthy ? <Activity className='h-5 w-5 text-green-600' /> : <AlertTriangle className='h-5 w-5 text-red-600' />}
          </div>
        </div>
        <div className='mt-2 flex items-center gap-2'>
          <span className={cn('h-2.5 w-2.5 rounded-full', isHealthy ? 'bg-green-500' : 'bg-red-500')} />
          <p className='text-xl font-semibold text-gray-900'>
            {isHealthy ? tMes('dashboard.healthy') : tMes('dashboard.disconnected')}
          </p>
        </div>
        <Badge
          className={cn('mt-2', isHealthy ? 'rounded-sm bg-green-100 text-green-600' : 'rounded-sm bg-red-100 text-red-600')}>
          {isHealthy ? tMes('dashboard.mes_connected') : tMes('dashboard.mes_unreachable')}
        </Badge>
      </div>

      {cards.map((card) => (
        <div key={card.key} className='rounded-xl border border-gray-200 bg-white p-4'>
          <div className='flex items-start justify-between'>
            <p className='text-sm text-gray-500'>{card.label}</p>
            <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', card.iconBg)}>
              <card.Icon className={cn('h-5 w-5', card.iconColor)} />
            </div>
          </div>
          <p className='mt-2 text-xl font-semibold text-gray-900'>{card.value}</p>
        </div>
      ))}
    </div>
  );
};

export default MesStatusCards;
