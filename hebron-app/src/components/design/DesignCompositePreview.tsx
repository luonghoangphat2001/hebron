import { getTransformedBackgroundGeometry } from '@/utils/helper/background-transform.helper';
import { cn } from '@/lib/utils';
import { resolveStorageUrl } from '@/utils/helper/canvas.helper';
import type { ProductDesignState } from '@/utils/helper/guest-cart.helper';
import type { CardSide } from '@/utils/types/canvas.types';

type DesignCompositePreviewProps = {
  preview?: string;
  design?: ProductDesignState;
  alt: string;
  className?: string;
  side?: CardSide;
};

const DesignCompositePreview = ({ preview, design, alt, className, side = 'front' }: DesignCompositePreviewProps) => {
  const sideData = side === 'back' ? design?.backData : design?.frontData;
  const sideFrame = design?.sideFrames?.[side];
  const background = sideData?.background.backgroundImage;
  const canvasSize = sideFrame?.canvasSize || design?.canvasSize;
  const contentSize = sideFrame?.contentSize || design?.contentSize || canvasSize;
  const contentOffset = sideFrame?.contentOffset || design?.contentOffset || { x: 0, y: 0 };
  // New editor previews already contain the whole template canvas. Re-applying
  // the background/content offset would shrink and crop them a second time.
  const canComposite = Boolean(preview && background && canvasSize && contentSize && design?.previewMode !== 'full_canvas');
  const backgroundGeometry = canvasSize
    ? getTransformedBackgroundGeometry(sideData?.background.previewSize ?? canvasSize, sideData?.background.backgroundTransform)
    : undefined;
  const isPortrait = !canvasSize || canvasSize.width <= canvasSize.height;

  return (
    <span className={cn('flex items-center justify-center overflow-hidden bg-neutral-50', className)}>
      {canComposite ? (
        <span
          className='relative block max-h-full max-w-full overflow-hidden'
          style={{
            aspectRatio: `${canvasSize!.width} / ${canvasSize!.height}`,
            height: isPortrait ? '100%' : undefined,
            width: isPortrait ? undefined : '100%',
          }}>
          <img
            src={resolveStorageUrl(background!)}
            alt=''
            className='absolute inset-0 size-full object-fill'
            style={
              backgroundGeometry
                ? {
                    left: `${(backgroundGeometry.x / canvasSize!.width) * 100}%`,
                    top: `${(backgroundGeometry.y / canvasSize!.height) * 100}%`,
                    width: `${(backgroundGeometry.width / canvasSize!.width) * 100}%`,
                    height: `${(backgroundGeometry.height / canvasSize!.height) * 100}%`,
                  }
                : undefined
            }
            aria-hidden
          />
          <img
            src={preview}
            alt={alt}
            className='absolute object-fill'
            style={{
              left: `${(contentOffset.x / canvasSize!.width) * 100}%`,
              top: `${(contentOffset.y / canvasSize!.height) * 100}%`,
              width: `${(contentSize!.width / canvasSize!.width) * 100}%`,
              height: `${(contentSize!.height / canvasSize!.height) * 100}%`,
            }}
          />
        </span>
      ) : (
        preview && <img src={preview} alt={alt} className='size-full object-contain' />
      )}
    </span>
  );
};

export default DesignCompositePreview;
