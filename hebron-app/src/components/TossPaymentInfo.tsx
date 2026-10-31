import { TossLogo } from '@/assets/svgs';

const TossPaymentInfo = () => {
  return (
    <div className='flex items-center gap-2'>
      <div className='flex size-8 items-center justify-center rounded-[6px] border border-neutral-200'>
        <img src={TossLogo} alt='toss' className='size-5' />
      </div>
      <p className='text-sm font-bold'>TOSS</p>
    </div>
  );
};

export default TossPaymentInfo;
