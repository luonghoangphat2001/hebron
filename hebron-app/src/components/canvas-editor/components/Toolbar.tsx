import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useWebEditorStore } from '@/stores/useWebEditorStore';
import { MAX_ZOOM, ZOOM_LEVELS } from '@/utils/constants/canvas-editor.constant';
import {
  ArrowUUpLeftIcon,
  ArrowUUpRightIcon,
  CaretDownIcon,
  CopyIcon,
  CornersOutIcon,
  FileTextIcon,
  MinusIcon,
  PlusIcon,
  ScissorsIcon,
  SelectionBackgroundIcon,
} from '@phosphor-icons/react';

const toolButtonClass =
  'size-10 rounded-full border-neutral-200 bg-white p-0 text-neutral-950 shadow-none hover:bg-neutral-100 disabled:bg-white';

interface ToolbarProps {
  viewportSize: {
    width: number;
    height: number;
  };
  rightOffset?: number;
}

export default function Toolbar({ viewportSize, rightOffset = 8 }: ToolbarProps) {
  const {
    activeSide,
    sidedness,
    past,
    future,
    selectedId,
    zoom,
    fitZoom,
    undo,
    redo,
    setZoom,
    deleteObject,
    duplicateObject,
    addText,
    toggleGrid,
    switchSide,
    fitView,
  } = useWebEditorStore();

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;
  const relativeZoom = zoom / Math.max(fitZoom, 0.01);

  const handleZoomIn = () => {
    const nextZoom = ZOOM_LEVELS.find((level) => level > relativeZoom + 0.001) ?? MAX_ZOOM;
    setZoom(nextZoom * fitZoom);
  };

  const handleZoomOut = () => {
    const previousZoom = [...ZOOM_LEVELS].reverse().find((level) => level < relativeZoom - 0.001) ?? ZOOM_LEVELS[0];
    setZoom(previousZoom * fitZoom);
  };

  const handleFitScreen = () => {
    fitView(viewportSize);
  };

  const iconButton = (label: string, icon: React.ReactNode, onClick: () => void, disabled = false) => (
    <Button
      variant='outline'
      size='icon-lg'
      className={toolButtonClass}
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}>
      {icon}
    </Button>
  );

  return (
    <div
      className='absolute bottom-6 z-10 flex items-center gap-6 transition-[right] duration-200'
      style={{ right: rightOffset }}>
      <div className='flex items-center gap-3'>
        <div className='flex items-center gap-3'>
          {iconButton('실행 취소', <ArrowUUpLeftIcon className='size-5' aria-hidden />, undo, !canUndo)}
          {iconButton('다시 실행', <ArrowUUpRightIcon className='size-5' aria-hidden />, redo, !canRedo)}
        </div>

        <div className='h-4 w-px bg-neutral-200' aria-hidden />

        <div className='flex items-center gap-3'>
          {iconButton(
            '잘라내기',
            <ScissorsIcon className='size-5' aria-hidden />,
            () => selectedId && deleteObject(selectedId),
            !selectedId,
          )}
          {iconButton(
            '복제',
            <CopyIcon className='size-5' aria-hidden />,
            () => selectedId && duplicateObject(selectedId),
            !selectedId,
          )}
          {iconButton('텍스트 추가', <FileTextIcon className='size-5' aria-hidden />, () => addText())}
        </div>

        <div className='h-4 w-px bg-neutral-200' aria-hidden />

        <div className='flex items-center gap-3'>
          {iconButton('그리드 표시', <SelectionBackgroundIcon className='size-5' aria-hidden />, toggleGrid)}
        </div>
      </div>

      {sidedness === 'DOUBLE' && (
        <div className='flex h-10 items-center rounded-[28px] border border-neutral-200 bg-white p-1'>
          {(['front', 'back'] as const).map((side) => (
            <button
              key={side}
              type='button'
              aria-pressed={activeSide === side}
              className={`h-8 min-w-14 cursor-pointer rounded-[24px] px-3 text-sm font-medium transition-colors ${
                activeSide === side ? 'bg-neutral-950 text-white' : 'text-neutral-600 hover:bg-neutral-100'
              }`}
              onClick={() => switchSide(side)}>
              {side === 'front' ? '앞면' : '뒷면'}
            </button>
          ))}
        </div>
      )}

      <div className='flex h-10 items-center gap-2 rounded-[28px] border border-neutral-200 bg-white px-4'>
        <div className='flex items-center gap-1.5'>
          <button
            type='button'
            className='flex size-6 cursor-pointer items-center justify-center rounded-full hover:bg-neutral-100'
            aria-label='확대'
            onClick={handleZoomIn}>
            <PlusIcon className='size-5' aria-hidden />
          </button>
          <button
            type='button'
            className='flex size-6 cursor-pointer items-center justify-center rounded-full hover:bg-neutral-100'
            aria-label='축소'
            onClick={handleZoomOut}>
            <MinusIcon className='size-5' aria-hidden />
          </button>
        </div>

        <div className='h-[18px] w-px bg-neutral-200' aria-hidden />

        <button
          type='button'
          className='flex size-6 cursor-pointer items-center justify-center rounded-full hover:bg-neutral-100'
          aria-label='화면에 맞추기'
          title='화면에 맞추기'
          onClick={handleFitScreen}>
          <CornersOutIcon className='size-5' aria-hidden />
        </button>

        <div className='h-[18px] w-px bg-neutral-200' aria-hidden />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type='button'
              className='flex cursor-pointer items-center gap-2 text-sm font-medium text-neutral-950'
              aria-label='확대 비율 선택'>
              <span>{Math.round(relativeZoom * 100)}%</span>
              <CaretDownIcon className='size-4' weight='fill' aria-hidden />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side='top' align='end' sideOffset={8} className='min-w-24'>
            <DropdownMenuRadioGroup
              value={String(ZOOM_LEVELS.find((level) => Math.abs(level - relativeZoom) < 0.001) ?? '')}
              onValueChange={(value) => setZoom(Number(value) * fitZoom)}>
              {ZOOM_LEVELS.map((level) => (
                <DropdownMenuRadioItem key={level} value={String(level)} className='cursor-pointer'>
                  {Math.round(level * 100)}%
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
