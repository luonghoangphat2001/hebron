import { LogoShort } from '@/assets/svgs';
import { BrandScrollReveal } from '@/components/brand/BrandScrollReveal';
import type { BrandHomeManufacturingView } from '@/data/pages/pages.mapper';
import { CaretLeftIcon, CaretRightIcon, PauseIcon, PlayIcon, XIcon } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import ManufacturingThumbnailList from './ManufacturingThumbnailList';

type ManufacturingVideoSectionProps = {
  data: BrandHomeManufacturingView;
};

const STEP_DURATION = 6000;

const ManufacturingVideoSection = ({ data }: ManufacturingVideoSectionProps) => {
  const { title, subtitle, slides } = data;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(0);

  const activeSlide = slides[activeIndex];
  const hasVideo = Boolean(activeSlide?.videoUrl);

  const handleSelectStep = (index: number) => {
    setIsPlayingVideo(false);
    setActiveIndex(index);
    setProgress(0);
  };

  const goToPrev = () => {
    setIsPlayingVideo(false);
    setActiveIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    setProgress(0);
  };

  const goToNext = () => {
    setIsPlayingVideo(false);
    setActiveIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    setProgress(0);
  };

  useEffect(() => {
    if (isPlayingVideo || isPaused || isHovered || slides.length <= 1) {
      return;
    }

    const intervalTime = 40;
    const increment = (intervalTime / STEP_DURATION) * 100;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveIndex((current) => (current === slides.length - 1 ? 0 : current + 1));
          return 0;
        }
        return prev + increment;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isPlayingVideo, isPaused, isHovered, slides.length]);

  if (!slides.length || !activeSlide) return null;

  return (
    <section className='w-full' onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <BrandScrollReveal variant='scaleUp' className='mx-auto w-full'>
        <div className='relative flex min-h-[760px] w-full flex-col justify-between overflow-hidden text-white sm:min-h-[820px] md:h-[880px]'>
          {/* Active Step Background Image with Smooth Transitions */}
          <AnimatePresence mode='wait'>
            <motion.div
              key={activeSlide.id}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className='absolute inset-0 size-full'>
              <img src={activeSlide.poster} alt={activeSlide.title} className='size-full object-cover object-center' />
            </motion.div>
          </AnimatePresence>

          {/* Dark Tint & Figma Vignette Gradient Overlay */}
          <div className='pointer-events-none absolute inset-0 bg-black/40' aria-hidden />
          <div
            className='pointer-events-none absolute inset-0'
            style={{
              backgroundImage:
                'linear-gradient(180deg, #0A0A0A 0%, rgba(10, 10, 10, 0.55) 20%, rgba(10, 10, 10, 0.45) 50%, rgba(10, 10, 10, 0.85) 80%, #0A0A0A 100%)',
            }}
            aria-hidden
          />

          {/* Video Player overlay */}
          {isPlayingVideo && hasVideo ? (
            <video
              key={activeSlide.id}
              src={activeSlide.videoUrl}
              controls
              autoPlay
              className='absolute inset-0 z-20 size-full object-cover'
              onEnded={goToNext}
            />
          ) : null}

          {/* Fallback Notice if Video URL is absent */}
          {isPlayingVideo && !hasVideo ? (
            <div className='absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/85 px-6 text-center'>
              <div className='mb-4 flex size-16 items-center justify-center rounded-full bg-white/10 text-white'>
                <PlayIcon className='size-8' weight='fill' />
              </div>
              <p className='text-lg font-bold text-white'>{activeSlide.title}</p>
              <p className='mt-1 text-sm text-neutral-400'>영상 URL이 등록되면 고화질 영상으로 재생됩니다.</p>
              <button
                type='button'
                onClick={() => setIsPlayingVideo(false)}
                className='mt-6 cursor-pointer rounded-full bg-white px-5 py-2 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-200'>
                미리보기로 돌아가기
              </button>
            </div>
          ) : null}

          {/* Close Video Button */}
          {isPlayingVideo ? (
            <button
              type='button'
              aria-label='영상 닫기'
              onClick={() => setIsPlayingVideo(false)}
              className='absolute top-6 right-6 z-30 flex size-10 cursor-pointer items-center justify-center rounded-full bg-neutral-950/80 text-white backdrop-blur-md transition-colors hover:bg-neutral-800 md:top-8 md:right-8'>
              <XIcon className='size-5' weight='bold' />
            </button>
          ) : null}

          {/* Top Section Header */}
          <div className='relative z-10 mx-auto flex w-full max-w-304 flex-col gap-4 px-4 pt-6 md:flex-row md:items-start md:justify-between md:gap-2 md:pt-12 lg:px-0 lg:pt-16'>
            <div className='flex flex-1 items-center gap-3 md:gap-2'>
              <img src={LogoShort} alt='' className='size-6 shrink-0' aria-hidden />
              <h2 className='text-[30px] leading-[38px] font-bold text-white md:text-[36px] md:leading-[44px]'>{title}</h2>
            </div>
            <p className='text-sm whitespace-pre-line text-neutral-400 md:max-w-[554px] md:text-[18px] md:leading-[28px]'>
              {subtitle}
            </p>
          </div>

          {/* Center Play Button (Active Step Video Trigger) */}
          {!isPlayingVideo ? (
            <div className='relative z-10 my-auto flex flex-col items-center justify-center gap-3 py-6'>
              <button
                type='button'
                aria-label='공정 영상 재생'
                onClick={() => setIsPlayingVideo(true)}
                className='group relative flex size-16 cursor-pointer items-center justify-center rounded-full border border-white/30 bg-white/20 text-white shadow-[0_0_30px_rgba(255,255,255,0.2)] backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-white/50 hover:bg-white/30 md:size-20'>
                <span className='absolute inset-0 animate-ping rounded-full bg-white/30 opacity-40 group-hover:opacity-70' />
                <PlayIcon className='size-7 translate-x-0.5 text-white md:size-8' weight='fill' />
              </button>
              <span className='rounded-full border border-white/15 bg-black/40 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm'>
                영상 미리보기 재생
              </span>
            </div>
          ) : (
            <div className='my-auto' />
          )}

          {/* Bottom Area: Active Step Info + Stepper Thumbnail Cards */}
          <div className='relative z-10 mx-auto flex w-full max-w-304 flex-col gap-4 px-4 pb-6 md:gap-5 md:pb-8 lg:px-0 lg:pb-10'>
            {/* Active Step Details & Controls */}
            <div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
              <div className='flex flex-col gap-2'>
                <div className='flex items-center gap-2.5'>
                  <span className='inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/50 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md'>
                    <span className='relative flex size-2'>
                      <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75' />
                      <span className='relative inline-flex size-2 rounded-full bg-emerald-500' />
                    </span>
                    단계 {String(activeIndex + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
                  </span>
                  <span className='text-xs font-medium text-neutral-400'>
                    {isPaused ? '일시정지' : isHovered ? '마우스 오버 (정지)' : '자동 전환 중'}
                  </span>
                </div>
                <h3 className='text-2xl font-bold text-white md:text-[36px] md:leading-[44px]'>{activeSlide.title}</h3>
                {activeSlide.description ? (
                  <p className='max-w-2xl text-xs whitespace-pre-line text-neutral-300 sm:text-sm'>{activeSlide.description}</p>
                ) : null}
              </div>

              {/* Navigation Controls */}
              <div className='flex shrink-0 items-center gap-2 sm:gap-3'>
                <button
                  type='button'
                  aria-label={isPaused ? '자동 재생 시작' : '자동 재생 일시정지'}
                  onClick={() => setIsPaused((prev) => !prev)}
                  className='flex size-10 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-neutral-950/80 text-white backdrop-blur-md transition-colors hover:bg-neutral-800'>
                  {isPaused ? <PlayIcon className='size-5' weight='fill' /> : <PauseIcon className='size-5' weight='fill' />}
                </button>
                <button
                  type='button'
                  aria-label='이전 공정'
                  onClick={goToPrev}
                  className='flex size-10 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-neutral-950/80 text-white backdrop-blur-md transition-colors hover:bg-neutral-800'>
                  <CaretLeftIcon className='size-5' weight='bold' />
                </button>
                <button
                  type='button'
                  aria-label='다음 공정'
                  onClick={goToNext}
                  className='flex size-10 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-neutral-950/80 text-white backdrop-blur-md transition-colors hover:bg-neutral-800'>
                  <CaretRightIcon className='size-5' weight='bold' />
                </button>
              </div>
            </div>

            {/* Stepper Thumbnail Preview Cards (Active & Inactive Steps) */}
            <ManufacturingThumbnailList
              slides={slides}
              activeIndex={activeIndex}
              progress={progress}
              isPaused={isPaused}
              onSelectStep={handleSelectStep}
            />
          </div>
        </div>
      </BrandScrollReveal>
    </section>
  );
};

export default ManufacturingVideoSection;
