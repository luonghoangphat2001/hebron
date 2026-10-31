import { Input } from '@/components/ui/input';
import { useWebEditorStore } from '@/stores/useWebEditorStore';
import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

type MeasurementInputProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  onCommit: (value: number) => void;
};

const MeasurementInput = ({ label, value, min, max, onCommit }: MeasurementInputProps) => {
  const [draft, setDraft] = useState(String(Math.round(value * 100) / 100));
  const commit = () => {
    const parsed = Number(draft);
    if (!draft.trim() || !Number.isFinite(parsed)) {
      setDraft(String(Math.round(value * 100) / 100));
      return;
    }
    const next = Math.min(max, Math.max(min, parsed));
    setDraft(String(next));
    onCommit(next);
  };

  return (
    <label className='flex min-w-0 flex-col gap-1.5 text-xs font-medium text-neutral-700'>
      {label}
      <Input
        type='number'
        aria-label={label}
        min={min}
        max={max}
        step='0.1'
        value={draft}
        onChange={(event) => setDraft(event.currentTarget.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') event.currentTarget.blur();
        }}
      />
    </label>
  );
};

export default function FreeEditSettings() {
  const { activeSide, templateFrameConfig, updateFreeEditFrame } = useWebEditorStore(
    useShallow((state) => ({
      activeSide: state.activeSide,
      templateFrameConfig: state.templateFrameConfig,
      updateFreeEditFrame: state.updateFreeEditFrame,
    })),
  );
  const unitScale = templateFrameConfig?.pageUnit === 'px' ? 25.4 / 96 : 1;
  const widthMm = (templateFrameConfig?.pageWidth ?? 140 / unitScale) * unitScale;
  const heightMm = (templateFrameConfig?.pageHeight ?? 95 / unitScale) * unitScale;
  const safeMarginMm = (templateFrameConfig?.safeMargin ?? 3 / unitScale) * unitScale;

  return (
    <section className='col-span-2 flex flex-col gap-3 rounded-lg bg-neutral-50 p-3' aria-label='자유 편집 설정'>
      <div>
        <h3 className='text-sm font-semibold text-neutral-950'>자유 편집</h3>
        <p className='mt-1 text-xs leading-5 text-neutral-500'>빈 캔버스에 텍스트와 이미지를 추가해 디자인하세요.</p>
      </div>
      <div className='grid grid-cols-2 gap-2'>
        <MeasurementInput
          key={`${activeSide}-width-${widthMm}`}
          label='너비 (mm)'
          value={widthMm}
          min={1}
          max={1000}
          onCommit={(value) => updateFreeEditFrame(value, heightMm, safeMarginMm)}
        />
        <MeasurementInput
          key={`${activeSide}-height-${heightMm}`}
          label='높이 (mm)'
          value={heightMm}
          min={1}
          max={1000}
          onCommit={(value) => updateFreeEditFrame(widthMm, value, safeMarginMm)}
        />
      </div>
      <MeasurementInput
        key={`${activeSide}-safe-${safeMarginMm}`}
        label='안전 여백 (mm)'
        value={safeMarginMm}
        min={0}
        max={Math.min(widthMm, heightMm) / 2}
        onCommit={(value) => updateFreeEditFrame(widthMm, heightMm, value, false)}
      />
    </section>
  );
}
