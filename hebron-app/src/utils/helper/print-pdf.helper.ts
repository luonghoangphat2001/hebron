import { getTransformedBackgroundGeometry } from './background-transform.helper';
import { jsPDF } from 'jspdf';
import { svg2pdf } from 'svg2pdf.js';
import type { SideFrameState } from '@/stores/useWebEditorStore';
import {
  ObjectType,
  type CanvasObject,
  type BackgroundObject,
  type CardSideData,
  type ImageObject,
  type ShapeObject,
  type TextObject,
} from '../types/canvas.types';
import { resolveCanvasAssetUrl } from './canvas.helper';
import { EDITOR_FONTS } from './editor-fonts';
import { layoutEditorText } from './editor-text-layout';

/** The print scene is independent of stage visibility, zoom, selection and previews. */
export interface PrintPdfState {
  frontData: CardSideData;
  backData: CardSideData;
  sideFrames: { front: SideFrameState; back: SideFrameState };
  sidedness: 'SINGLE' | 'DOUBLE';
}

export interface PrintFontSource {
  family: string;
  url: string;
  weight?: number;
  style?: 'normal' | 'italic';
}

export interface PrintPdfOptions {
  /** Exact print font binaries; unsupported families never silently fall back. */
  fonts?: PrintFontSource[];
  onProgress?: (message: string) => void;
}

export interface PrintPdfResult {
  blob: Blob;
  warnings: string[];
}

const defaultFonts = EDITOR_FONTS;
const escapeXml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char]!);
const color = (value?: string) => escapeXml(!value || value === 'transparent' ? 'none' : value);

async function withTimeout<T>(promise: Promise<T>, message: string, milliseconds = 15_000): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(message)), milliseconds);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

/** Physical dimensions define the trim ratio; never distort an uncalibrated legacy scene. */
export const getPrintPageGeometry = (frame: SideFrameState) => {
  const config = frame.templateFrameConfig;
  const mm = (value: number) => (config?.pageUnit === 'px' ? (value * 25.4) / 96 : value);
  const width = config?.pageWidth !== undefined ? mm(config.pageWidth) : (frame.contentSize.width * 25.4) / 96;
  const height = config?.pageHeight !== undefined ? mm(config.pageHeight) : (frame.contentSize.height * 25.4) / 96;
  if (![width, height, frame.contentSize.width, frame.contentSize.height].every((value) => Number.isFinite(value) && value > 0)) {
    throw new Error('인쇄 영역의 실제 크기가 올바르지 않습니다. 템플릿의 재단 크기를 확인해 주세요.');
  }
  if (!hasPhysicalPrintAspect(frame)) {
    throw new Error(
      '재단선 비율이 실제 인쇄 크기와 다릅니다. 재단선 크기 또는 실제 인쇄 크기를 조정하고 배치를 확인한 후 다시 인쇄해 주세요.',
    );
  }
  return { width, height, scale: width / frame.contentSize.width };
};

/** Allow sub-pixel rounding in saved frame sizes, never a visible aspect change. */
export const hasPhysicalPrintAspect = (frame: Pick<SideFrameState, 'contentSize' | 'templateFrameConfig'>) => {
  const config = frame.templateFrameConfig;
  if (!config?.pageWidth || !config.pageHeight) return true;
  const expectedHeight = (frame.contentSize.width * config.pageHeight) / config.pageWidth;
  return Math.abs(expectedHeight - frame.contentSize.height) <= 1;
};

/** Hydrate legacy frame metadata into one physical coordinate scale; artwork stays untouched. */
export const normalizePhysicalPrintFrame = (frame: SideFrameState): SideFrameState => {
  const config = frame.templateFrameConfig;
  if (!config?.pageWidth || !config.pageHeight || hasPhysicalPrintAspect(frame)) return frame;
  if (![config.pageWidth, config.pageHeight, frame.contentSize.width].every((value) => Number.isFinite(value) && value > 0))
    return frame;
  const height = (frame.contentSize.width * config.pageHeight) / config.pageWidth;
  if (!Number.isFinite(height) || height <= 0) return frame;
  const contentSize = { width: frame.contentSize.width, height };
  return {
    ...frame,
    contentSize,
    canvasSize: {
      width: Math.max(frame.canvasSize.width, frame.contentOffset.x + contentSize.width),
      height: Math.max(frame.canvasSize.height, frame.contentOffset.y + height),
    },
    templateFrameConfig: {
      ...config,
      cutWidth: contentSize.width,
      cutHeight: height,
      cutOffsetX: frame.contentOffset.x,
      cutOffsetY: frame.contentOffset.y,
    },
    contentSafeMargin: ((config.safeMargin ?? 0) / config.pageHeight) * height,
  };
};

async function textSvg(object: TextObject, fonts: PrintFontSource[]) {
  if (!object.content) return '';
  if (
    (object.shadowOpacity ?? 1) > 0 &&
    object.shadowColor &&
    (object.shadowBlur || object.shadowOffsetX || object.shadowOffsetY)
  ) {
    throw new Error('벡터 인쇄에서는 텍스트 그림자를 지원하지 않습니다. 그림자를 제거해 주세요.');
  }
  const layout = await layoutEditorText(object, fonts);
  return (
    `<path d="${layout.paths.join('')}" fill="${color(object.color)}" stroke="${color(object.stroke)}" stroke-width="${object.strokeWidth || 0}"/>` +
    layout.decorations
      .map(
        ({ x, y, width }) =>
          `<path d="M${x} ${y}h${width}" fill="none" stroke="${color(object.color)}" stroke-width="${object.fontSize / 15}"/>`,
      )
      .join('')
  );
}

const polygon = (width: number, height: number, count: number, star = false) =>
  Array.from({ length: star ? count * 2 : count }, (_, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / (star ? count * 2 : count);
    const radius = star && index % 2 ? 0.44 : 1;
    return `${width / 2 + ((Math.cos(angle) * width) / 2) * radius},${height / 2 + ((Math.sin(angle) * height) / 2) * radius}`;
  }).join(' ');

const shapeGeometry = (object: ShapeObject) => {
  const { width, height } = object.size;
  switch (object.shapeType) {
    case 'circle':
      return `<ellipse cx="${width / 2}" cy="${height / 2}" rx="${width / 2}" ry="${height / 2}"/>`;
    case 'triangle':
      return `<polygon points="${width / 2},0 ${width},${height} 0,${height}"/>`;
    case 'star':
      return `<polygon points="${polygon(width, height, 5, true)}"/>`;
    case 'polygon':
      return `<polygon points="${polygon(width, height, Math.max(3, Math.min(12, object.polygonSides || 5)))}"/>`;
    case 'line':
      return `<path d="M0 ${height / 2}h${width}" fill="none"/>`;
    default:
      return `<rect width="${width}" height="${height}" rx="${object.shapeType === 'roundedRectangle' ? object.cornerRadius || 12 : 0}"/>`;
  }
};

async function loadImage(source: string) {
  if (!source) throw new Error('비어 있는 이미지 프레임이 있습니다. 이미지를 추가한 후 인쇄해 주세요.');
  const response = await fetch(resolveCanvasAssetUrl(source), { signal: AbortSignal.timeout(15_000) });
  if (!response.ok)
    throw new Error(`인쇄 이미지를 불러오지 못했습니다 (${response.status}). 이미지 파일과 접근 권한을 확인해 주세요.`);
  const blob = await response.blob();
  let vector: string | undefined;
  if (blob.type.includes('svg') || /\.svg(?:[?#]|$)/i.test(source) || source.startsWith('data:image/svg+xml')) {
    const svg = new DOMParser().parseFromString(await blob.text(), 'image/svg+xml').documentElement;
    if (svg.nodeName !== 'svg') throw new Error('SVG 이미지 형식이 올바르지 않습니다.');
    if (svg.querySelector('text'))
      throw new Error('SVG 이미지의 텍스트를 먼저 아웃라인으로 변환해 주세요. SVG 안의 글꼴은 자동 대체하지 않습니다.');
    for (const node of [svg, ...svg.querySelectorAll('*')]) {
      if (['script', 'foreignobject', 'iframe', 'object', 'embed', 'animate', 'set'].includes(node.localName.toLowerCase())) {
        throw new Error('인쇄 SVG에 실행 가능한 콘텐츠가 포함되어 있습니다. 정적 SVG 파일을 사용해 주세요.');
      }
      for (const attribute of [...node.attributes]) {
        if (
          /^on/i.test(attribute.name) ||
          (attribute.localName === 'href' && !/^(#|data:image\/(png|jpeg|webp);base64,)/i.test(attribute.value))
        ) {
          throw new Error('인쇄 SVG는 외부 참조 또는 이벤트를 포함할 수 없습니다.');
        }
        for (const match of attribute.value.matchAll(/url\(([^)]*)\)/gi)) {
          if (!match[1].trim().replace(/["']/g, '').startsWith('#'))
            throw new Error('인쇄 SVG의 외부 리소스를 사용할 수 없습니다.');
        }
      }
      if (node.localName === 'style') {
        const css = node.textContent || '';
        if (/@import|url\(/i.test(css)) throw new Error('외부 스타일이 포함된 SVG는 인쇄할 수 없습니다.');
        if (css.match(/[^{}]+(?=\{)/g)?.some((selector) => selector.includes('#')))
          throw new Error('SVG의 ID 스타일을 인라인 스타일로 변환한 후 인쇄해 주세요.');
      }
    }
    vector = new XMLSerializer().serializeToString(svg);
  }
  const data = await withTimeout(
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    }),
    '이미지 파일을 읽는 시간이 초과되었습니다. 다시 시도해 주세요.',
  );
  const image = await withTimeout(
    new Promise<HTMLImageElement>((resolve, reject) => {
      const value = new Image();
      value.onload = () => resolve(value);
      value.onerror = () => reject(new Error('인쇄 이미지 파일을 해석할 수 없습니다.'));
      value.src = data;
    }),
    '인쇄 이미지를 해석하는 시간이 초과되었습니다. 이미지 파일을 확인해 주세요.',
  );
  return { data, image, vector };
}

const assetSvg = (
  asset: Awaited<ReturnType<typeof loadImage>>,
  x: number,
  y: number,
  width: number,
  height: number,
  prefix: string,
) => {
  if (asset.vector) {
    const svg = new DOMParser().parseFromString(asset.vector, 'image/svg+xml').documentElement;
    if (!svg.hasAttribute('viewBox')) svg.setAttribute('viewBox', `0 0 ${asset.image.naturalWidth} ${asset.image.naturalHeight}`);
    svg.setAttribute('x', '0');
    svg.setAttribute('y', '0');
    svg.setAttribute('width', String(asset.image.naturalWidth));
    svg.setAttribute('height', String(asset.image.naturalHeight));
    // Preserve the source's own letterboxing inside its natural image viewport;
    // scale that viewport as a whole, exactly like CanvasImage.
    for (const node of [svg, ...svg.querySelectorAll('*')]) {
      for (const attribute of [...node.attributes]) {
        if (attribute.name === 'id') node.setAttribute('id', `${prefix}-${attribute.value}`);
        else if (attribute.localName === 'href' && attribute.value.startsWith('#'))
          node.setAttribute(attribute.name, `#${prefix}-${attribute.value.slice(1)}`);
        else if (attribute.value.includes('url('))
          node.setAttribute(attribute.name, attribute.value.replace(/url\(["']?#([^"')]+)["']?\)/g, `url(#${prefix}-$1)`));
      }
    }
    return `<svg x="${x}" y="${y}" width="${width}" height="${height}" viewBox="0 0 ${asset.image.naturalWidth} ${asset.image.naturalHeight}" preserveAspectRatio="none">${new XMLSerializer().serializeToString(svg)}</svg>`;
  }
  return `<image href="${asset.data}" x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="none"/>`;
};

/** Backgrounds are fitted to the full canvas, before extracting the cut area. */
export const getPrintBackgroundGeometry = (
  frame: SideFrameState,
  image: { width: number; height: number },
  size: BackgroundObject['backgroundSize'] = 'cover',
  backingSize = frame.canvasSize,
  transform?: BackgroundObject['backgroundTransform'],
) => {
  const { width, height } = backingSize;
  if (![width, height, image.width, image.height].every((value) => Number.isFinite(value) && value > 0)) {
    throw new Error('배경 이미지와 캔버스 크기를 확인한 후 다시 인쇄해 주세요.');
  }
  const transformed = getTransformedBackgroundGeometry(image, transform);
  if (transformed) {
    return { ...transformed, x: transformed.x - frame.contentOffset.x, y: transformed.y - frame.contentOffset.y };
  }
  const scale = (size === 'contain' ? Math.min : Math.max)(width / image.width, height / image.height);
  const renderWidth = size === 'fill' ? width : image.width * scale;
  const renderHeight = size === 'fill' ? height : image.height * scale;
  return {
    x: (width - renderWidth) / 2 - frame.contentOffset.x,
    y: (height - renderHeight) / 2 - frame.contentOffset.y,
    width: renderWidth,
    height: renderHeight,
  };
};

async function backgroundSvg(
  background: BackgroundObject,
  frame: SideFrameState,
  backingSize = background.previewSize ?? frame.canvasSize,
) {
  const { width, height } = backingSize;
  const x = -frame.contentOffset.x;
  const y = -frame.contentOffset.y;
  let image = '';
  if (background.backgroundImage) {
    try {
      const asset = await loadImage(background.backgroundImage);
      const bounds = getPrintBackgroundGeometry(
        frame,
        { width: asset.image.naturalWidth, height: asset.image.naturalHeight },
        background.backgroundSize || 'cover',
        backingSize,
        background.backgroundTransform,
      );
      image = assetSvg(asset, bounds.x, bounds.y, bounds.width, bounds.height, 'background-asset');
    } catch (error) {
      throw new Error(
        `인쇄 배경 이미지를 불러오지 못했습니다. 배경 파일과 접근 권한을 확인해 주세요. ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
  if (background.backgroundTransform) {
    return `<rect width="${frame.contentSize.width}" height="${frame.contentSize.height}" fill="${color(background.backgroundColor)}"/>${image}`;
  }
  return `<rect width="${frame.contentSize.width}" height="${frame.contentSize.height}" fill="${color(background.backgroundColor)}"/><defs><clipPath id="background-canvas"><rect x="${x}" y="${y}" width="${width}" height="${height}"/></clipPath></defs><g clip-path="url(#background-canvas)"><rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${color(background.backgroundColor)}"/>${image}</g>`;
}

/** Rasterize only a bitmap asset with an alpha mask, never text or the page. */
async function customMaskedImage(object: ImageObject, image: HTMLImageElement) {
  if (!object.maskImageUrl) throw new Error('사용자 지정 마스크 파일이 없습니다.');
  const { image: mask } = await loadImage(object.maskImageUrl);
  const pixelScale = Math.max(
    1,
    Math.min(image.naturalWidth / object.size.width, 8192 / Math.max(object.size.width, object.size.height)),
  );
  const width = Math.max(1, Math.round(object.size.width * pixelScale));
  const height = Math.max(1, Math.round(object.size.height * pixelScale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  const raw = document.createElement('canvas');
  raw.width = width;
  raw.height = height;
  const rawContext = raw.getContext('2d');
  const normalized = document.createElement('canvas');
  normalized.width = width;
  normalized.height = height;
  const maskContext = normalized.getContext('2d');
  if (!context || !rawContext || !maskContext) throw new Error('이미지 마스크를 처리할 수 없습니다.');
  const imageHeight = (width * image.naturalHeight) / image.naturalWidth;
  context.drawImage(image, 0, (height - imageHeight) / 2, width, imageHeight);
  rawContext.drawImage(mask, 0, 0, width, height);
  const imageData = rawContext.getImageData(0, 0, width, height);
  const pixels = imageData.data;
  const corners = [0, (width - 1) * 4, width * (height - 1) * 4, (width * height - 1) * 4];
  const alpha = corners.reduce((sum, index) => sum + pixels[index + 3], 0) / 4;
  const luminance = corners.reduce((sum, index) => sum + (pixels[index] + pixels[index + 1] + pixels[index + 2]) / 3, 0) / 4;
  let minX = width,
    minY = height,
    maxX = -1,
    maxY = -1;
  for (let index = 0; index < pixels.length; index += 4) {
    const brightness = (pixels[index] + pixels[index + 1] + pixels[index + 2]) / 3;
    const coverage =
      alpha < 32
        ? pixels[index + 3]
        : Math.abs(brightness - luminance) < 18
          ? 0
          : luminance > 160
            ? 255 - brightness
            : brightness;
    if (coverage > 24) {
      const pixel = index / 4;
      minX = Math.min(minX, pixel % width);
      minY = Math.min(minY, Math.floor(pixel / width));
      maxX = Math.max(maxX, pixel % width);
      maxY = Math.max(maxY, Math.floor(pixel / width));
    }
    pixels[index] = pixels[index + 1] = pixels[index + 2] = 255;
    pixels[index + 3] = Math.max(0, Math.min(255, coverage));
  }
  rawContext.putImageData(imageData, 0, 0);
  if (maxX >= minX && maxY >= minY) {
    const sourceX = Math.max(0, minX - 2),
      sourceY = Math.max(0, minY - 2);
    maskContext.drawImage(
      raw,
      sourceX,
      sourceY,
      Math.min(width - sourceX, maxX - minX + 5),
      Math.min(height - sourceY, maxY - minY + 5),
      0,
      0,
      width,
      height,
    );
  } else maskContext.drawImage(raw, 0, 0);
  context.globalCompositeOperation = 'destination-in';
  context.drawImage(normalized, 0, 0);
  return canvas.toDataURL('image/png');
}

async function imageSvg(object: ImageObject, id: string) {
  const asset = await loadImage(object.src);
  const { image } = asset;
  const { width, height } = object.size;
  if (object.maskShape === 'custom')
    return `<image href="${await customMaskedImage(object, image)}" width="${width}" height="${height}"/>`;
  if (object.filters && Object.values(object.filters).some(Boolean))
    throw new Error('이미지 필터가 적용된 개체는 인쇄할 수 없습니다. 필터를 제거해 주세요.');
  const renderHeight = (width * image.naturalHeight) / image.naturalWidth;
  const crop = object.cropWidth > 0 && object.cropHeight > 0;
  const content = crop
    ? `<svg x="0" y="${(height - renderHeight) / 2}" width="${width}" height="${renderHeight}" viewBox="${object.cropX} ${object.cropY} ${object.cropWidth} ${object.cropHeight}" preserveAspectRatio="none">${assetSvg(asset, 0, 0, image.naturalWidth, image.naturalHeight, id)}</svg>`
    : assetSvg(asset, 0, (height - renderHeight) / 2, width, renderHeight, id);
  if (!object.maskShape || object.maskShape === 'none') return content;
  const clip =
    object.maskShape === 'circle'
      ? `<ellipse cx="${width / 2}" cy="${height / 2}" rx="${width / 2}" ry="${height / 2}"/>`
      : `<rect width="${width}" height="${height}"/>`;
  return `<defs><clipPath id="${id}">${clip}</clipPath></defs><g clip-path="url(#${id})">${content}</g>`;
}

async function objectSvg(object: CanvasObject, index: number, fonts: PrintFontSource[]) {
  let content: string;
  if (object.type === ObjectType.TEXT) content = await textSvg(object, fonts);
  else if (object.type === ObjectType.IMAGE) content = await imageSvg(object, `image-${index}`);
  else {
    const geometry = shapeGeometry(object);
    const fillImage = object.fillImageUrl ? await loadImage(object.fillImageUrl) : null;
    const fill = fillImage
      ? `<defs><clipPath id="shape-${index}">${geometry}</clipPath></defs><g clip-path="url(#shape-${index})">${assetSvg(fillImage, 0, 0, object.size.width, object.size.height, `fill-${index}`)}</g>`
      : '';
    const inner =
      object.shapeType === 'doubleRectangle'
        ? `<rect x="3" y="3" width="${Math.max(0, object.size.width - 6)}" height="${Math.max(0, object.size.height - 6)}" fill="none"/>`
        : '';
    content = `${fill}<g fill="${fillImage ? 'none' : color(object.fill)}" stroke="${color(object.stroke)}" stroke-width="${object.strokeWidth}" stroke-linejoin="round">${geometry}${inner}</g>`;
  }
  return `<g transform="translate(${object.position.x} ${object.position.y}) rotate(${object.rotation})" opacity="${object.opacity}">${content}</g>`;
}

/** Genuine vector print PDF: text is outlined, shapes are paths, only source images remain bitmap. */
export async function buildPrintPdf(state: PrintPdfState, options: PrintPdfOptions = {}): Promise<PrintPdfResult> {
  const fonts = options.fonts || defaultFonts;
  const warnings = new Set<string>();
  const sides = state.sidedness === 'DOUBLE' ? (['front', 'back'] as const) : (['front'] as const);
  let pdf: jsPDF | undefined;
  for (const side of sides) {
    options.onProgress?.(`${side}: preparing page`);
    const frame = normalizePhysicalPrintFrame(state.sideFrames[side]);
    const page = getPrintPageGeometry(frame);
    const orientation = page.width >= page.height ? 'landscape' : 'portrait';
    if (!pdf) pdf = new jsPDF({ unit: 'mm', format: [page.width, page.height], orientation, compress: true });
    else pdf.addPage([page.width, page.height], orientation);
    pdf.setProperties({
      title: 'Hebron print artwork',
      creator: 'Hebron',
      subject: `Vector artwork; local font sources: ${new URL('../../assets/fonts/editor/sources.json', import.meta.url).href}`,
    });
    const data = side === 'front' ? state.frontData : state.backData;
    const objects = data.objects.filter((object) => object.visible).toSorted((a, b) => a.zIndex - b.zIndex);
    const content = await Promise.all(
      objects.map(async (object, index) => {
        options.onProgress?.(`${side}: loading ${object.type} ${object.id}`);
        const result = await objectSvg(object, index, fonts);
        options.onProgress?.(`${side}: ready ${object.type} ${object.id}`);
        return result;
      }),
    );
    options.onProgress?.(`${side}: loading background`);
    const background = await backgroundSvg(
      data.background,
      frame,
      data.background.previewSize ?? state.sideFrames[side].canvasSize,
    );
    const svg = new DOMParser().parseFromString(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${page.width}mm" height="${page.height}mm" viewBox="0 0 ${page.width} ${page.height}"><defs><clipPath id="print-area"><rect width="${frame.contentSize.width}" height="${frame.contentSize.height}"/></clipPath></defs><g transform="scale(${page.scale})" clip-path="url(#print-area)">${background}${content.join('')}</g></svg>`,
      'image/svg+xml',
    ).documentElement;
    if (svg.nodeName !== 'svg') throw new Error('인쇄 문서를 생성할 수 없습니다.');
    options.onProgress?.(`${side}: converting SVG to PDF`);
    await withTimeout(
      svg2pdf(svg, pdf, { x: 0, y: 0, width: page.width, height: page.height }),
      '인쇄 PDF 변환 시간이 초과되었습니다. 이미지 파일을 확인하고 다시 시도해 주세요.',
      30_000,
    );
    options.onProgress?.(`${side}: page complete`);
  }
  return { blob: pdf!.output('blob'), warnings: [...warnings] };
}

export const downloadPrintPdf = (blob: Blob, fileName = 'hebron-design.pdf') => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
};
