import opacityIcon from '@/assets/images/canvas-editor/opacity-icon.svg';
import { Switch } from '@/components/ui/switch';
import { useWebEditorStore } from '@/stores/useWebEditorStore';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useShallow } from 'zustand/react/shallow';

type NumericFieldProps = {
  label: ReactNode;
  ariaLabel: string;
  value: number;
  min?: number;
  max?: number;
  unit?: string;
  alwaysCommit?: boolean;
  onCommit: (value: number) => void;
};

const formatNumericValue = (value: number) => String(Math.round(value * 100) / 100);

const NumericField = ({ label, ariaLabel, value, min, max, unit, alwaysCommit = false, onCommit }: NumericFieldProps) => {
  const isEditingRef = useRef(false);
  const [draft, setDraft] = useState(() => formatNumericValue(value));

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!isEditingRef.current) setDraft(formatNumericValue(value));
  }, [value]);

  const commitDraft = () => {
    const parsedValue = Number(draft);
    isEditingRef.current = false;

    if (!Number.isFinite(parsedValue)) {
      setDraft(formatNumericValue(value));
      return;
    }

    const nextValue = Math.min(max ?? Number.POSITIVE_INFINITY, Math.max(min ?? Number.NEGATIVE_INFINITY, parsedValue));
    setDraft(formatNumericValue(nextValue));
    if (alwaysCommit || nextValue !== value) onCommit(nextValue);
  };

  return (
    <label className='flex h-6 min-w-0 flex-1 items-center rounded-md bg-neutral-100 focus-within:ring-1 focus-within:ring-blue-500'>
      <span className='flex size-6 shrink-0 items-center justify-center text-xs text-neutral-500'>{label}</span>
      <input
        type='number'
        inputMode='decimal'
        aria-label={ariaLabel}
        value={draft}
        min={min}
        max={max}
        step='1'
        onChange={(event) => setDraft(event.currentTarget.value)}
        onFocus={(event) => {
          isEditingRef.current = true;
          event.currentTarget.select();
        }}
        onBlur={commitDraft}
        onKeyDown={(event) => {
          if (event.key === 'Enter') event.currentTarget.blur();
        }}
        className='min-w-0 flex-1 appearance-none bg-transparent p-0 text-xs font-medium text-neutral-950 outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
      />
      {unit && <span className='pr-2 text-xs font-medium text-neutral-950'>{unit}</span>}
    </label>
  );
};

type SnapSettingProps = {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

const SnapSetting = ({ label, description, checked, onCheckedChange }: SnapSettingProps) => (
  <div
    className={
      checked
        ? 'flex items-center justify-between rounded-md bg-blue-50 px-2 py-1'
        : 'flex items-center justify-between px-2 py-1'
    }>
    <span className='flex min-w-0 flex-col'>
      <span className='text-xs leading-[18px] font-medium text-neutral-700'>{label}</span>
      <span className='truncate text-[10px] leading-4 text-neutral-400'>{description}</span>
    </span>
    <Switch checked={checked} onCheckedChange={onCheckedChange} aria-label={label} className='data-checked:bg-blue-brand' />
  </div>
);

export default function SidebarRight() {
  const {
    selectedObject,
    snapToCenter,
    snapToEdges,
    snapToObjects,
    snapToSafeArea,
    toggleSnapToCenter,
    toggleSnapToEdges,
    toggleSnapToObjects,
    toggleSnapToSafeArea,
    updateObject,
    inspectorPreview,
    trimSelected,
    contentOffset,
    contentSize,
    canvasSize,
    templateFrameConfig,
    updateTrimFrame,
    updateFreeEditFrame,
  } = useWebEditorStore(
    useShallow((state) => {
      const objects = state.activeSide === 'front' ? state.frontData.objects : state.backData.objects;

      return {
        selectedObject: state.selectedId ? (objects.find((object) => object.id === state.selectedId) ?? null) : null,
        snapToCenter: state.snapToCenter,
        snapToEdges: state.snapToEdges,
        snapToObjects: state.snapToObjects,
        snapToSafeArea: state.snapToSafeArea,
        toggleSnapToCenter: state.toggleSnapToCenter,
        toggleSnapToEdges: state.toggleSnapToEdges,
        toggleSnapToObjects: state.toggleSnapToObjects,
        toggleSnapToSafeArea: state.toggleSnapToSafeArea,
        updateObject: state.updateObject,
        inspectorPreview: state.inspectorPreview,
        trimSelected: state.trimSelected,
        contentOffset: state.contentOffset,
        contentSize: state.contentSize,
        canvasSize: state.canvasSize,
        templateFrameConfig: state.templateFrameConfig,
        updateTrimFrame: state.updateTrimFrame,
        updateFreeEditFrame: state.updateFreeEditFrame,
      };
    }),
  );

  if (trimSelected) {
    const frame = { ...contentOffset, ...contentSize };
    const unitScale = templateFrameConfig?.pageUnit === 'px' ? 25.4 / 96 : 1;
    const widthMm = (templateFrameConfig?.pageWidth ?? 140) * unitScale;
    const heightMm = (templateFrameConfig?.pageHeight ?? 95) * unitScale;
    const safeMm = (templateFrameConfig?.safeMargin ?? 3 / unitScale) * unitScale;
    return (
      <aside aria-label='재단선 속성' className='w-[207px] overflow-hidden rounded-lg border border-neutral-200 bg-white p-3'>
        <div className='flex flex-col gap-3'>
          <h2 className='text-xs font-semibold text-neutral-950'>재단선</h2>
          <div className='flex gap-2'>
            <NumericField
              label='X'
              ariaLabel='재단선 X 좌표'
              value={frame.x}
              min={0}
              max={canvasSize.width - frame.width}
              onCommit={(x) => updateTrimFrame({ ...frame, x })}
            />
            <NumericField
              label='Y'
              ariaLabel='재단선 Y 좌표'
              value={frame.y}
              min={0}
              max={canvasSize.height - frame.height}
              onCommit={(y) => updateTrimFrame({ ...frame, y })}
            />
          </div>
          <div className='flex gap-2'>
            <NumericField
              label='W'
              ariaLabel='재단선 너비'
              value={frame.width}
              min={Math.min(12, canvasSize.width)}
              max={canvasSize.width - frame.x}
              onCommit={(width) => updateTrimFrame({ ...frame, width })}
            />
            <NumericField
              label='H'
              ariaLabel='재단선 높이'
              value={frame.height}
              min={Math.min(12, canvasSize.height)}
              max={canvasSize.height - frame.y}
              onCommit={(height) => updateTrimFrame({ ...frame, height })}
            />
          </div>
          <p className='text-[10px] leading-4 text-neutral-400'>재단선 좌표와 크기는 캔버스 단위입니다.</p>
          <h3 className='text-xs font-semibold text-neutral-950'>실제 인쇄 크기</h3>
          <NumericField
            label='W'
            ariaLabel='인쇄 너비 (mm)'
            alwaysCommit
            value={widthMm}
            min={1}
            max={1000}
            unit='mm'
            onCommit={(width) => updateFreeEditFrame(width, heightMm, safeMm)}
          />
          <NumericField
            label='H'
            ariaLabel='인쇄 높이 (mm)'
            alwaysCommit
            value={heightMm}
            min={1}
            max={1000}
            unit='mm'
            onCommit={(height) => updateFreeEditFrame(widthMm, height, safeMm)}
          />
          <NumericField
            label='S'
            ariaLabel='안전 여백 (mm)'
            value={safeMm}
            min={0}
            max={Math.min(widthMm, heightMm) / 2}
            unit='mm'
            onCommit={(margin) => updateFreeEditFrame(widthMm, heightMm, margin, false)}
          />
          <p className='text-[10px] leading-4 text-neutral-400'>
            실제 크기와 재단선 크기가 함께 변경됩니다. 디자인과 배경 이미지는 비율을 유지합니다.
          </p>
        </div>
      </aside>
    );
  }
  if (!selectedObject) return null;

  const preview = inspectorPreview?.id === selectedObject.id ? inspectorPreview : null;
  const displayedPosition = preview?.position ?? selectedObject.position;
  const displayedSize = preview?.size ?? selectedObject.size;

  const updatePosition = (axis: 'x' | 'y', value: number) => {
    updateObject(selectedObject.id, {
      position: {
        ...displayedPosition,
        [axis]: value,
      },
    });
  };

  const updateSize = (dimension: 'width' | 'height', value: number) => {
    updateObject(selectedObject.id, {
      size: {
        ...displayedSize,
        [dimension]: value,
      },
    });
  };

  return (
    <aside aria-label='선택한 요소 속성' className='w-[207px] overflow-hidden rounded-lg border border-neutral-200 bg-white p-3'>
      <div className='flex flex-col gap-4'>
        <div className='flex flex-col gap-1.5'>
          <div className='flex gap-2'>
            <NumericField
              label='X'
              ariaLabel='X 좌표'
              value={displayedPosition.x}
              onCommit={(value) => updatePosition('x', value)}
            />
            <NumericField
              label='Y'
              ariaLabel='Y 좌표'
              value={displayedPosition.y}
              onCommit={(value) => updatePosition('y', value)}
            />
          </div>
          <div className='flex gap-2'>
            <NumericField
              label='W'
              ariaLabel='너비'
              value={displayedSize.width}
              min={5}
              onCommit={(value) => updateSize('width', value)}
            />
            <NumericField
              label='H'
              ariaLabel='높이'
              value={displayedSize.height}
              min={5}
              onCommit={(value) => updateSize('height', value)}
            />
          </div>
        </div>

        <section className='flex flex-col gap-2'>
          <h2 className='text-xs leading-[18px] font-semibold text-neutral-950'>투명도</h2>
          <NumericField
            label={<img src={opacityIcon} alt='' className='size-3' aria-hidden />}
            ariaLabel='투명도'
            value={selectedObject.opacity * 100}
            min={0}
            max={100}
            unit='%'
            alwaysCommit
            onCommit={(value) => updateObject(selectedObject.id, { opacity: value / 100 })}
          />
        </section>

        <section className='flex flex-col gap-2'>
          <h2 className='text-xs leading-[18px] font-semibold text-neutral-950'>스냅 설정</h2>
          <p className='text-[10px] leading-4 text-neutral-400'>요소를 드래그하면 가까운 기준선에 맞춰집니다.</p>
          <div className='flex flex-col gap-1'>
            <SnapSetting
              label='중앙 스냅'
              description='요소 중심 ↔ 캔버스 중심'
              checked={snapToCenter}
              onCheckedChange={toggleSnapToCenter}
            />
            <SnapSetting
              label='끝선 스냅'
              description='요소 끝선 ↔ 캔버스 외곽'
              checked={snapToEdges}
              onCheckedChange={toggleSnapToEdges}
            />
            <SnapSetting
              label='객체 간 스냅'
              description='요소의 끝선과 중심선'
              checked={snapToObjects}
              onCheckedChange={toggleSnapToObjects}
            />
            <SnapSetting
              label='안전선 스냅'
              description='요소 끝선 ↔ 주황색 안전선'
              checked={snapToSafeArea}
              onCheckedChange={toggleSnapToSafeArea}
            />
          </div>
          <p className='rounded-md bg-cyan-50 px-2 py-1 text-[10px] leading-4 text-cyan-700'>
            스냅 시 청록색 가이드가 표시됩니다.
          </p>
        </section>
      </div>
    </aside>
  );
}
