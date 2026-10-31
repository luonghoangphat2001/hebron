import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWebEditorStore } from '@/stores/useWebEditorStore';
import { getEditableBackgroundTransform } from '@/utils/helper/background-transform.helper';
import { useEffect, useRef, useState, type ChangeEvent } from 'react';

export default function BackgroundTabContent() {
  const side = useWebEditorStore((state) => state.activeSide);
  const background = useWebEditorStore((state) =>
    state.activeSide === 'front' ? state.frontData.background : state.backData.background,
  );
  const selected = useWebEditorStore((state) => state.backgroundSelected);
  const updateBackground = useWebEditorStore((state) => state.updateBackground);
  const selectBackground = useWebEditorStore((state) => state.selectBackground);
  const [loadedImage, setLoadedImage] = useState<{ source: string; width: number; height: number }>();
  const size = loadedImage?.source === background.backgroundImage ? loadedImage : undefined;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const uploadVersion = useRef({ version: 0 });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const source = background.backgroundImage;
    if (!source) return;
    const image = new Image();
    image.onload = () => setLoadedImage({ source, width: image.naturalWidth, height: image.naturalHeight });
    image.src = source;
    return () => {
      image.onload = null;
    };
  }, [background.backgroundImage]);

  useEffect(() => {
    const pendingUpload = uploadVersion.current;
    const unsubscribe = useWebEditorStore.subscribe((state, previous) => {
      const current = state.activeSide === 'front' ? state.frontData.background : state.backData.background;
      const old = previous.activeSide === 'front' ? previous.frontData.background : previous.backData.background;
      if (state.activeSide !== previous.activeSide || current.id !== old.id) {
        uploadVersion.current.version++;
        setLoading(false);
      }
    });
    return () => {
      unsubscribe();
      pendingUpload.version++;
      useWebEditorStore.getState().selectBackground(false);
    };
  }, []);

  const bounds = background.previewSize ?? useWebEditorStore.getState().canvasSize;
  const transform = size
    ? getEditableBackgroundTransform(size, bounds, background.backgroundSize, background.backgroundTransform)
    : undefined;
  const fit = () => {
    if (!size) return;
    const state = useWebEditorStore.getState();
    const scale = Math.max(state.contentSize.width / size.width, state.contentSize.height / size.height);
    updateBackground({
      backgroundTransform: {
        x: state.contentOffset.x + (state.contentSize.width - size.width * scale) / 2,
        y: state.contentOffset.y + (state.contentSize.height - size.height * scale) / 2,
        scale,
      },
    });
  };
  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 20 * 1024 * 1024) {
      setError('PNG, JPG, WebP 이미지 (최대 20MB)를 선택해 주세요.');
      return;
    }
    const version = ++uploadVersion.current.version;
    const initial = useWebEditorStore.getState();
    const initialBackground = initial.getCurrentBackground();
    setLoading(true);
    setError('');
    try {
      const source = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => (typeof reader.result === 'string' ? resolve(reader.result) : reject());
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => (image.naturalWidth && image.naturalHeight ? resolve(image) : reject());
        image.onerror = reject;
        image.src = source;
      });
      const current = useWebEditorStore.getState();
      if (
        version !== uploadVersion.current.version ||
        current.activeSide !== side ||
        current.getCurrentBackground() !== initialBackground
      )
        return;
      const scale = Math.max(current.contentSize.width / image.naturalWidth, current.contentSize.height / image.naturalHeight);
      updateBackground({
        backgroundImage: source,
        preserveFrameOnImageLoad: true,
        backgroundSize: 'contain',
        previewSize: { ...current.canvasSize },
        backgroundTransform: {
          x: current.contentOffset.x + (current.contentSize.width - image.naturalWidth * scale) / 2,
          y: current.contentOffset.y + (current.contentSize.height - image.naturalHeight * scale) / 2,
          scale,
        },
      });
      selectBackground(true);
    } catch {
      if (version === uploadVersion.current.version) setError('이미지를 불러오지 못했습니다. 다른 파일을 선택해 주세요.');
    } finally {
      if (version === uploadVersion.current.version) setLoading(false);
    }
  };

  return (
    <div className='space-y-4 p-3'>
      <p className='text-xs text-neutral-500'>
        {side === 'front' ? '앞면' : '뒷면'} 배경을 편집합니다. 재단선과 다른 요소는 유지됩니다.
      </p>
      <input ref={inputRef} type='file' accept='image/png,image/jpeg,image/webp' onChange={upload} className='hidden' />
      <Button className='w-full' variant='outline' disabled={loading} onClick={() => inputRef.current?.click()}>
        {loading ? '불러오는 중…' : background.backgroundImage ? '배경 이미지 변경' : '배경 이미지 업로드'}
      </Button>
      <p className='text-xs text-neutral-500'>PNG, JPG, WebP · 최대 20MB</p>
      {error && (
        <p role='alert' className='text-xs text-red-600'>
          {error}
        </p>
      )}
      {background.backgroundImage && transform && (
        <>
          <Button
            className='w-full'
            variant={selected ? 'default' : 'outline'}
            aria-pressed={selected}
            disabled={loading}
            onClick={() => selectBackground(!selected)}>
            {selected ? '배경 이동 완료' : '배경 이동 / 크기 조절'}
          </Button>
          <p className='text-xs text-neutral-500'>
            배경을 드래그하여 이동하고 모서리를 드래그하여 비율을 유지하며 크기를 조절하세요.
          </p>
          {(['x', 'y', 'scale'] as const).map((key) => (
            <label key={key} className='flex items-center justify-between gap-3 text-xs'>
              {key === 'scale' ? '배율 (%)' : `${key.toUpperCase()} (px)`}
              <Input
                aria-label={key === 'scale' ? '배경 배율 (%)' : `배경 ${key.toUpperCase()} (px)`}
                className='w-28'
                type='number'
                step={key === 'scale' ? 1 : 0.1}
                min={key === 'scale' ? 1 : undefined}
                key={`${side}-${background.id}-${key}-${transform[key]}`}
                defaultValue={Math.round(transform[key] * (key === 'scale' ? 100 : 1) * 100) / 100}
                disabled={loading}
                onBlur={(event) => {
                  const raw = event.target.value;
                  const parsed = raw ? Number(raw) / (key === 'scale' ? 100 : 1) : NaN;
                  if (!Number.isFinite(parsed)) {
                    event.target.value = String(transform[key] * (key === 'scale' ? 100 : 1));
                    return;
                  }
                  const value = key === 'scale' ? Math.max(0.01, parsed) : parsed;
                  event.target.value = String(value * (key === 'scale' ? 100 : 1));
                  if (value !== transform[key]) updateBackground({ backgroundTransform: { ...transform, [key]: value } });
                }}
              />
            </label>
          ))}
          <div className='flex gap-2'>
            <Button variant='outline' disabled={loading} onClick={fit}>
              재단선에 맞추기
            </Button>
            <Button variant='outline' disabled={loading} onClick={() => updateBackground({ backgroundTransform: undefined })}>
              초기화
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
