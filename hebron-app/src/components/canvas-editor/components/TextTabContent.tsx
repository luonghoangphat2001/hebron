import { fontPreviewStack, fontWeights, resolveFontFamily, resolveFontWeight } from '@/utils/helper/editor-fonts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useWebEditorStore } from '@/stores/useWebEditorStore';
import { FONT_FAMILIES } from '@/utils/constants/canvas-editor.constant';
import type { TextAlign, TextObject } from '@/utils/types/canvas.types';
import {
  LockIcon,
  LockOpenIcon,
  TextAlignCenterIcon,
  TextAlignJustifyIcon,
  TextAlignLeftIcon,
  TextAlignRightIcon,
} from '@phosphor-icons/react';

type TextTabContentProps = {
  object: TextObject;
};

const labelClass = 'mb-1 block text-xs font-medium text-neutral-700';
const inputClass = 'h-8 rounded-md border-neutral-200 text-xs shadow-none';
const fontFamilyLabel = (fontFamily: string) =>
  fontFamily
    .split(',')[0]
    .trim()
    .replace(/^['"]|['"]$/g, '');

export default function TextTabContent({ object }: TextTabContentProps) {
  const updateText = useWebEditorStore((state) => state.updateText);
  const updateObject = useWebEditorStore((state) => state.updateObject);
  const fontFactor = (96 / 72) * (object.fontRenderScale || 1);
  const pointFontSize = Math.round((object.fontSize / fontFactor) * 10) / 10;
  const fonts = FONT_FAMILIES.map((value) => ({ value, label: value }));

  const updateNumber = (key: keyof TextObject, value: string, min?: number, max?: number) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return;
    updateText(object.id, { [key]: Math.min(max ?? Infinity, Math.max(min ?? -Infinity, parsed)) });
  };

  return (
    <div className='flex min-h-0 flex-1 flex-col overflow-y-auto px-3 pb-4'>
      <div className='mb-3 flex items-center justify-between rounded-md bg-neutral-50 px-2 py-1.5'>
        <span className='truncate text-xs font-semibold text-neutral-950'>{object.label || 'Text'}</span>
        <div className='flex items-center gap-2'>
          <label className='flex items-center gap-1 text-[10px] text-neutral-500'>
            표시
            <Switch
              checked={object.visible}
              onCheckedChange={(visible) => updateObject(object.id, { visible })}
              aria-label='텍스트 표시'
              className='data-checked:bg-blue-brand scale-75'
            />
          </label>
          <Button
            type='button'
            variant='ghost'
            size='icon-xs'
            aria-label={object.locked ? '잠금 해제' : '잠금'}
            onClick={() => updateObject(object.id, { locked: !object.locked })}>
            {object.locked ? <LockIcon className='size-4' /> : <LockOpenIcon className='size-4' />}
          </Button>
        </div>
      </div>

      <div className='space-y-3'>
        <div>
          <label className={labelClass} htmlFor={`text-content-${object.id}`}>
            내용
          </label>
          <Textarea
            id={`text-content-${object.id}`}
            value={object.content}
            onChange={(event) => updateText(object.id, { content: event.target.value })}
            className='min-h-20 resize-y border-neutral-200 text-xs shadow-none'
          />
        </div>

        <div className='grid grid-cols-2 gap-2'>
          <div className='min-w-0'>
            <span className={labelClass}>폰트</span>
            <Select
              value={resolveFontFamily(object.fontFamily)}
              onValueChange={(fontFamily) => updateText(object.id, { fontFamily })}>
              <SelectTrigger
                className={`${inputClass} w-full min-w-0`}
                style={{ fontFamily: fontPreviewStack(object.fontFamily) }}>
                <SelectValue className='min-w-0 flex-1'>
                  <span className='truncate'>{fontFamilyLabel(object.fontFamily)}</span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className='max-h-72'>
                {fonts.map((font) => (
                  <SelectItem key={font.value} value={font.value} style={{ fontFamily: fontPreviewStack(font.value) }}>
                    {font.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className={labelClass} htmlFor={`font-size-${object.id}`}>
              폰트 크기
            </label>
            <Input
              id={`font-size-${object.id}`}
              type='number'
              min={1}
              step={0.1}
              value={pointFontSize}
              onChange={(event) => {
                const value = Number(event.target.value);
                if (Number.isFinite(value)) updateText(object.id, { fontSize: Math.max(1, value) * fontFactor });
              }}
              className={inputClass}
            />
          </div>
        </div>

        <div className='grid grid-cols-2 gap-2'>
          <div>
            <span className={labelClass}>굵기</span>
            <Select
              value={String(resolveFontWeight(object.fontFamily, object.fontWeight))}
              onValueChange={(fontWeight) => updateText(object.id, { fontWeight: fontWeight as TextObject['fontWeight'] })}>
              <SelectTrigger className={inputClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fontWeights(object.fontFamily).map((weight) => (
                  <SelectItem key={weight} value={String(weight)}>
                    {weight}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className={labelClass} htmlFor={`line-height-${object.id}`}>
              줄 높이
            </label>
            <Input
              id={`line-height-${object.id}`}
              type='number'
              min={0}
              step={0.1}
              value={object.lineHeight}
              onChange={(event) => updateNumber('lineHeight', event.target.value, 0)}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <span className={labelClass}>정렬</span>
          <div className='flex gap-1'>
            {(
              [
                ['left', TextAlignLeftIcon, '왼쪽 정렬'],
                ['center', TextAlignCenterIcon, '가운데 정렬'],
                ['right', TextAlignRightIcon, '오른쪽 정렬'],
                ['justify', TextAlignJustifyIcon, '양쪽 정렬'],
              ] as const
            ).map(([align, Icon, label]) => (
              <Button
                key={align}
                type='button'
                variant={object.align === align ? 'default' : 'outline'}
                size='icon-sm'
                aria-label={label}
                aria-pressed={object.align === align}
                onClick={() => updateText(object.id, { align: align as TextAlign })}>
                <Icon className='size-4' />
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        <div className='grid grid-cols-2 gap-2'>
          <div>
            <label className={labelClass} htmlFor={`text-width-${object.id}`}>
              너비
            </label>
            <Input
              id={`text-width-${object.id}`}
              type='number'
              min={5}
              step={0.1}
              value={object.size.width}
              onChange={(event) =>
                updateObject(object.id, { size: { ...object.size, width: Math.max(5, Number(event.target.value) || 5) } })
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor={`text-height-${object.id}`}>
              높이
            </label>
            <Input id={`text-height-${object.id}`} type='number' value={object.size.height} disabled className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor={`text-rotation-${object.id}`}>
              회전
            </label>
            <Input
              id={`text-rotation-${object.id}`}
              type='number'
              step={0.1}
              value={object.rotation}
              onChange={(event) => updateNumber('rotation', event.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor={`text-opacity-${object.id}`}>
              투명도
            </label>
            <Input
              id={`text-opacity-${object.id}`}
              type='number'
              min={0}
              max={1}
              step={0.05}
              value={object.opacity}
              onChange={(event) => updateNumber('opacity', event.target.value, 0, 1)}
              className={inputClass}
            />
          </div>
        </div>

        <div className='grid grid-cols-2 gap-2'>
          <div>
            <label className={labelClass} htmlFor={`text-color-${object.id}`}>
              글자색
            </label>
            <Input
              id={`text-color-${object.id}`}
              type='color'
              value={object.color}
              onChange={(event) => updateText(object.id, { color: event.target.value })}
              className='h-8 cursor-pointer p-1'
            />
          </div>
          <div>
            <label className={labelClass} htmlFor={`stroke-color-${object.id}`}>
              외곽선
            </label>
            <Input
              id={`stroke-color-${object.id}`}
              type='color'
              value={object.stroke || '#111827'}
              onChange={(event) => updateText(object.id, { stroke: event.target.value, strokeWidth: object.strokeWidth || 1 })}
              className='h-8 cursor-pointer p-1'
            />
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor={`stroke-width-${object.id}`}>
            외곽선 두께
          </label>
          <Input
            id={`stroke-width-${object.id}`}
            type='number'
            min={0}
            step={0.1}
            value={object.strokeWidth || 0}
            onChange={(event) => updateNumber('strokeWidth', event.target.value, 0)}
            className={inputClass}
          />
        </div>

        <Separator />
        <p className='text-xs font-semibold text-neutral-950'>그림자</p>
        <div className='grid grid-cols-2 gap-2'>
          <div>
            <label className={labelClass} htmlFor={`shadow-blur-${object.id}`}>
              블러
            </label>
            <Input
              id={`shadow-blur-${object.id}`}
              type='number'
              min={0}
              value={object.shadowBlur || 0}
              onChange={(event) => updateNumber('shadowBlur', event.target.value, 0)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor={`shadow-opacity-${object.id}`}>
              투명도
            </label>
            <Input
              id={`shadow-opacity-${object.id}`}
              type='number'
              min={0}
              max={1}
              step={0.05}
              value={object.shadowOpacity || 0}
              onChange={(event) => updateNumber('shadowOpacity', event.target.value, 0, 1)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor={`shadow-x-${object.id}`}>
              오프셋 X
            </label>
            <Input
              id={`shadow-x-${object.id}`}
              type='number'
              value={object.shadowOffsetX || 0}
              onChange={(event) => updateNumber('shadowOffsetX', event.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor={`shadow-y-${object.id}`}>
              오프셋 Y
            </label>
            <Input
              id={`shadow-y-${object.id}`}
              type='number'
              value={object.shadowOffsetY || 0}
              onChange={(event) => updateNumber('shadowOffsetY', event.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
