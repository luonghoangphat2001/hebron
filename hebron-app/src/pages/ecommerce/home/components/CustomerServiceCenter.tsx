import type { CustomerCenterView } from '@/data/pages/home-mall.service';
import { getMyPageNoticePath } from '@/utils/constants/route.constant';
import { EnvelopeIcon, HeadsetIcon } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

type CustomerServiceCenterProps = {
  data?: CustomerCenterView;
};

const CustomerServiceCenter = ({ data }: CustomerServiceCenterProps) => {
  const { t: tCommon } = useTranslation('common');

  if (!data || (!data.phone && !data.email)) return null;

  const phone = data.phone;
  const email = data.email;
  const hours = data.businessHours ? `${data.businessHours}${data.closedDays ? `\n※ ${data.closedDays}` : ''}` : '';

  return (
    <section className='space-y-5'>
      <div className='flex items-end justify-between gap-5'>
        <p className='md:text-display-sm text-xl font-bold'>{data.title || tCommon('title.customer_center')}</p>
        {/* ponytail: /my-page is behind ProtectedRoute, which sends guests to login with this path as callback */}
        <Link to={getMyPageNoticePath()} className='text-md text-blue-brand-700 font-bold hover:underline'>
          {tCommon('button.see_more')}
        </Link>
      </div>
      <div className='space-y-5 rounded-lg border border-neutral-200 bg-neutral-50 px-6 py-4'>
        {phone && (
          <div className='space-y-2'>
            <div className='bg-blue-brand-25 w-fit rounded-full p-3'>
              <HeadsetIcon size={24} className='text-blue-brand-700' />
            </div>
            <p className='text-display-xs font-bold'>{phone}</p>
            {hours && <p className='text-sm whitespace-pre-line text-slate-500'>{hours}</p>}
          </div>
        )}
        {email && (
          <div className='space-y-2'>
            <div className='bg-blue-brand-25 w-fit rounded-full p-3'>
              <EnvelopeIcon size={24} className='text-blue-brand-700' />
            </div>
            <p className='text-display-xs font-bold'>{email}</p>
            <p className='text-sm whitespace-pre-line text-slate-500'>{data.emailDescription || '이메일 문의'}</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default CustomerServiceCenter;
