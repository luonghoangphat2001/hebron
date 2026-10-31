import { OrderStepArrow } from '@/assets/svgs';
import { Typography } from '@/components/typography/Typography';
import { cn } from '@/lib/utils';
import { CUSTOMER_ORDER_STEPS } from '@/data/orders/customer-order-status';
import { ChecksIcon } from '@phosphor-icons/react';

type OrderDetailStatusStepperProps = {
  currentStepKey: string;
};

const OrderDetailStatusStepper = ({ currentStepKey }: OrderDetailStatusStepperProps) => {
  const isRevisionRequested = currentStepKey === 'design_revision_requested';
  const activeKey = isRevisionRequested ? 'design_confirmation_requested' : currentStepKey;
  const currentIndex = CUSTOMER_ORDER_STEPS.findIndex((step) => step.key === activeKey);

  return (
    <div className='flex w-full min-w-0 flex-col gap-3'>
      <div className='scrollbar-hide flex w-full min-w-0 items-center gap-2 overflow-x-auto'>
        {CUSTOMER_ORDER_STEPS.map((step, index) => {
          const Icon = ChecksIcon;
          const isReached = currentIndex >= 0 && index <= currentIndex;
          const isCurrent = step.key === activeKey;

          return (
            <div key={step.key} className='flex shrink-0 items-center gap-2'>
              <div
                className={cn(
                  'flex w-20 shrink-0 flex-col items-center justify-center gap-2 rounded-lg border bg-white px-2 pt-4 pb-3',
                  isCurrent ? 'border-neutral-400' : 'border-neutral-200',
                )}>
                <Icon
                  className={cn('size-8 shrink-0', isReached ? 'text-neutral-950' : 'text-neutral-300')}
                  weight={isReached ? 'duotone' : 'regular'}
                />
                <Typography
                  variant='title-sm'
                  weight='regular'
                  className={cn('text-center whitespace-normal', isReached ? 'text-neutral-500' : 'text-neutral-400')}>
                  {step.label}
                </Typography>
              </div>
              {index < CUSTOMER_ORDER_STEPS.length - 1 ? (
                <img src={OrderStepArrow} alt='' aria-hidden className='h-1.5 w-3.5 shrink-0' />
              ) : null}
            </div>
          );
        })}
      </div>
      {isRevisionRequested ? (
        <p role='status' className='rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950'>
          시안 수정요청 → 관리자 시안 재등록 → 시안확인요청
        </p>
      ) : null}
    </div>
  );
};

export default OrderDetailStatusStepper;
