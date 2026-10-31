import type { BrandProcessStepView } from '@/data/pages/pages.mapper';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { useRef } from 'react';

type ProcessStepsSectionProps = {
  steps: BrandProcessStepView[];
  activeId: string;
  onSelect: (id: string) => void;
};

const ProcessStepNode = ({
  step,
  isActive,
  onSelect,
}: {
  step: BrandProcessStepView;
  isActive: boolean;
  onSelect: (id: string) => void;
}) => {
  return (
    <motion.button
      type='button'
      aria-pressed={isActive}
      onClick={() => onSelect(step.id)}
      layout
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
        mass: 0.8,
      }}
      className={cn(
        'relative z-10 flex shrink-0 cursor-pointer items-center justify-center rounded-full select-none',
        isActive
          ? 'size-[180px] sm:size-[210px] lg:size-[240px]'
          : 'size-[120px] hover:scale-105 sm:size-[140px] lg:size-[164px]',
      )}>
      {/* Outer border / background */}
      <span
        className={cn(
          'absolute inset-0 rounded-full transition-colors duration-300',
          isActive ? 'p-[1.5px]' : 'bg-[#1E1E1E] hover:bg-[#282828]',
        )}
        style={isActive ? { background: 'linear-gradient(107deg, #1E50A2 0%, #E60013 100%)' } : undefined}
        aria-hidden>
        {isActive && <span className='block size-full rounded-full bg-neutral-950' />}
      </span>

      {/* Text label */}
      <motion.span
        layout='position'
        className={cn(
          'relative z-10 px-4 text-center transition-colors duration-300',
          isActive
            ? 'text-[22px] leading-[1.25] font-bold text-white sm:text-[26px] lg:text-[30px]'
            : 'text-[15px] leading-[1.35] font-medium text-neutral-400 sm:text-[18px] lg:text-[20px]',
        )}>
        {step.name}
      </motion.span>
    </motion.button>
  );
};

const ProcessConnectorLine = ({ className }: { className?: string }) => (
  <div
    className={cn('pointer-events-none absolute top-1/2 right-0 left-0 h-px -translate-y-1/2 bg-neutral-800', className)}
    aria-hidden
  />
);

const ProcessStepsSection = ({ steps, activeId, onSelect }: ProcessStepsSectionProps) => {
  const touchStartX = useRef<number | null>(null);
  const activeIndex = Math.max(
    0,
    steps.findIndex((step) => step.id === activeId),
  );
  const activeStep = steps[activeIndex] ?? steps[0];

  const selectByOffset = (offset: number) => {
    if (steps.length === 0) return;
    const nextIndex = Math.min(steps.length - 1, Math.max(0, activeIndex + offset));
    onSelect(steps[nextIndex].id);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current == null) return;

    const deltaX = (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(deltaX) < 40) return;
    selectByOffset(deltaX < 0 ? 1 : -1);
  };

  if (!activeStep) return null;

  return (
    <div className='flex w-full flex-col items-center'>
      {/* Mobile + tablet: horizontal scrollable / swipe timeline */}
      <div
        className='relative flex w-full items-center justify-center lg:hidden'
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}>
        <ProcessConnectorLine />
        <ProcessStepNode step={activeStep} isActive onSelect={onSelect} />
      </div>

      {/* Desktop: full timeline with smooth layout animations */}
      <div className='relative hidden w-full max-w-7xl lg:block'>
        <ProcessConnectorLine className='right-12 left-12' />

        <div className='flex w-full items-center justify-between gap-4'>
          {steps.map((step) => (
            <div key={step.id} className='flex shrink-0 items-center justify-center'>
              <ProcessStepNode step={step} isActive={step.id === activeId} onSelect={onSelect} />
            </div>
          ))}
        </div>
      </div>

      {/* Card Content with smooth fade & slide animation */}
      <AnimatePresence mode='wait'>
        <motion.div
          key={activeStep.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className='mt-10 flex w-full max-w-135 flex-col items-center gap-6 px-4 text-center'>
          <div className='flex flex-col gap-2'>
            <h2 className='text-display-xs md:text-display-sm font-medium text-white'>{activeStep.title}</h2>
            <p className='md:text-md text-sm text-neutral-400'>{activeStep.description}</p>
          </div>

          {activeStep.image && (
            <div className='w-full overflow-hidden rounded-xl bg-neutral-900 shadow-2xl'>
              <img
                src={activeStep.image}
                alt={activeStep.title || activeStep.name}
                className='aspect-video w-full object-cover object-center'
                loading='eager'
                decoding='async'
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ProcessStepsSection;
