import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { getMyPageFaqPath, getMyPageOrdersPath, getMyPageShippingInquiryCreatePath } from '@/utils/constants/route.constant';
import { ArrowRightIcon, ClipboardTextIcon, QuestionIcon, TruckIcon, XIcon } from '@phosphor-icons/react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

type CtaCard = {
  id: string;
  icon: typeof ClipboardTextIcon;
  title: string;
  description: string;
  link: string;
  buttonLabel?: string;
  isPopup?: boolean;
};

const CTA_CARDS: CtaCard[] = [
  {
    id: 'order-shipping',
    icon: ClipboardTextIcon,
    title: '주문배송',
    description: '주문 및 배송 정보를 확인해보세요',
    link: getMyPageOrdersPath(),
    buttonLabel: '확인하기',
    isPopup: true,
  },
  {
    id: 'shipping-inquiry',
    icon: TruckIcon,
    title: '1:1 문의',
    description: '출고 및 배송 관련 궁금한 점을 문의해보세요',
    link: getMyPageShippingInquiryCreatePath(),
    buttonLabel: '확인하기',
  },
  {
    id: 'faq',
    icon: QuestionIcon,
    title: '자주묻는질문',
    description: '자주 묻는 질문과 답변을 확인해보세요',
    link: getMyPageFaqPath(),
    buttonLabel: '확인하기',
  },
];

type HomeCtaSectionProps = {
  orderMethodImage?: string;
};

const HomeCtaSection = ({ orderMethodImage }: HomeCtaSectionProps) => {
  const [isOrderShippingModalOpen, setIsOrderShippingModalOpen] = useState(false);

  const visibleCards = useMemo(() => {
    return CTA_CARDS.filter((_, index) => {
      if (index === 0) return Boolean(orderMethodImage);
      return true;
    });
  }, [orderMethodImage]);

  if (!visibleCards.length) return null;

  return (
    <section className='w-full'>
      <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
        {visibleCards.map((card) => {
          const Icon = card.icon;
          const cardContent = (
            <>
              <div>
                <div className='flex size-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-900 transition-colors group-hover:bg-neutral-200'>
                  <Icon size={24} weight='regular' />
                </div>
                <div className='mt-6 space-y-1.5'>
                  <h3 className='text-lg font-bold text-neutral-950'>{card.title}</h3>
                  <p className='text-sm text-neutral-500'>{card.description}</p>
                </div>
              </div>

              <div className='mt-8 flex items-center gap-1 text-sm font-semibold text-neutral-900 transition-colors group-hover:text-blue-600'>
                <span>{card.buttonLabel || '확인하기'}</span>
                <ArrowRightIcon size={16} className='transition-transform group-hover:translate-x-0.5' />
              </div>
            </>
          );

          if (card.isPopup) {
            return (
              <button
                key={card.id}
                type='button'
                onClick={() => setIsOrderShippingModalOpen(true)}
                className='group flex cursor-pointer flex-col justify-between rounded-2xl border border-neutral-200/80 bg-white p-6 text-left shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md'>
                {cardContent}
              </button>
            );
          }

          return (
            <Link
              key={card.id}
              to={card.link}
              className='group flex flex-col justify-between rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md'>
              {cardContent}
            </Link>
          );
        })}
      </div>

      {orderMethodImage && (
        <Dialog open={isOrderShippingModalOpen} onOpenChange={setIsOrderShippingModalOpen}>
          <DialogContent
            showCloseButton={false}
            className='flex h-[852px] max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] flex-col gap-0 overflow-hidden rounded-3xl border border-neutral-200 bg-white p-0 shadow-xl sm:h-[852px] sm:w-[860px] sm:max-w-[860px]'>
            <div className='flex h-[68px] shrink-0 items-center justify-between border-b border-neutral-100 px-6'>
              <DialogTitle className='text-xl font-bold text-neutral-900'>주문방법</DialogTitle>
              <DialogDescription className='sr-only'>주문방법 안내</DialogDescription>
              <button
                type='button'
                aria-label='Close'
                onClick={() => setIsOrderShippingModalOpen(false)}
                className='flex size-9 cursor-pointer items-center justify-center rounded-full text-neutral-900 transition-colors hover:bg-neutral-100'>
                <XIcon className='size-5' weight='bold' />
              </button>
            </div>

            <div className='custom-scrollbar flex-1 overflow-y-auto p-6'>
              <img
                src={orderMethodImage}
                alt='주문방법'
                className='mx-auto block h-auto w-full max-w-[812px] rounded-xl select-none'
              />
            </div>

            <div className='flex h-[72px] shrink-0 items-center justify-center border-t border-neutral-100 px-6'>
              <Button
                type='button'
                variant='outline'
                className='h-10 w-[311px] rounded-full border-neutral-200 text-sm font-medium text-neutral-800 hover:bg-neutral-50'
                onClick={() => setIsOrderShippingModalOpen(false)}>
                네, 알겠습니다
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </section>
  );
};

export default HomeCtaSection;
