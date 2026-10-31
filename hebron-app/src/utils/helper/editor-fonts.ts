import manifest from '@/assets/fonts/editor/manifest.json';
import { parse, type Font } from 'opentype.js';

export interface EditorFontSource {
  family: string;
  weight?: number;
  style?: 'normal' | 'italic';
  url: string;
  licenseUrl?: string;
}
const files = import.meta.glob('/src/assets/fonts/editor/**/*.ttf', { eager: true, query: '?url', import: 'default' });
const licenses = import.meta.glob('/src/assets/fonts/editor/**/OFL.txt', {
  eager: true,
  query: '?url&no-inline',
  import: 'default',
});
export const EDITOR_FONTS: EditorFontSource[] = (
  manifest as { family: string; file: string; weight: number; style: 'normal' | 'italic' }[]
).map((face) => ({
  ...face,
  url: files[`/src/assets/fonts/editor/${face.file}`] as string,
  licenseUrl: licenses[`/src/assets/fonts/editor/${face.file.split('/')[0]}/OFL.txt`] as string,
}));
export const EDITOR_FONT_FAMILIES = [...new Set(EDITOR_FONTS.map((face) => face.family))];
const aliases: Record<string, string> = {
  arial: 'Arimo',
  helvetica: 'Arimo',
  'times new roman': 'Tinos',
  'courier new': 'Cousine',
  'lucida console': 'Cousine',
  georgia: 'Gelasio',
  verdana: 'PT Sans',
  'trebuchet ms': 'Cabin',
  impact: 'Oswald',
  'comic sans ms': 'Comic Neue',
  palatino: 'Crimson Text',
  garamond: 'EB Garamond',
  bookman: 'Libre Baskerville',
  tahoma: 'Source Sans 3',
  gungsuh: 'Nanum Myeongjo',
  inter: 'Pretendard',
};
export function resolveFontFamily(value = '') {
  const name = value.split(',')[0].replace(/["']/g, '').trim().toLowerCase();
  return EDITOR_FONT_FAMILIES.find((family) => family.toLowerCase() === name) || aliases[name] || 'Pretendard';
}
export function fontFallbackFamily(family: string) {
  const resolved = resolveFontFamily(family);
  if (['Tinos', 'Gelasio', 'Crimson Text', 'EB Garamond', 'Libre Baskerville', 'Nanum Myeongjo'].includes(resolved))
    return 'Nanum Myeongjo';
  if (['Cousine', 'Nanum Gothic Coding'].includes(resolved)) return 'Nanum Gothic Coding';
  return 'Nanum Gothic';
}
export const fontPreviewStack = (family: string) =>
  `"${resolveFontFamily(family)}", "${fontFallbackFamily(family)}", "Pretendard", "Source Sans 3"`;
export const fontWeights = (family: string) =>
  [...new Set(EDITOR_FONTS.filter((face) => face.family === resolveFontFamily(family)).map((face) => face.weight || 400))].sort(
    (a, b) => a - b,
  );
export function resolveFontWeight(family: string, value: string | number = 400) {
  const weight = ({ normal: 400, regular: 400, medium: 500, bold: 700 } as Record<string, number>)[value] || Number(value) || 400;
  return [...fontWeights(family)].sort((a, b) => Math.abs(a - weight) - Math.abs(b - weight) || a - b)[0] || 400;
}
export function resolveTextFont<T extends { fontFamily: string; fontWeight: string }>(object: T): T {
  const fontFamily = resolveFontFamily(object.fontFamily);
  return { ...object, fontFamily, fontWeight: String(resolveFontWeight(fontFamily, object.fontWeight)) };
}
const cache = new Map<string, Promise<Font>>();
export function loadEditorFont(source: EditorFontSource): Promise<Font> {
  if (!source?.url) return Promise.reject(new Error(`글꼴 '${source?.family}' 파일이 없습니다. 페이지를 새로고침해 주세요.`));
  if (!cache.has(source.url)) {
    const pending = fetch(source.url, { signal: AbortSignal.timeout(15000) }).then(async (response) => {
      if (!response.ok) throw new Error(`글꼴 '${source.family}'을 불러오지 못했습니다. 연결을 확인하고 다시 시도해 주세요.`);
      const font = parse(await response.arrayBuffer());
      if (font.tables.fvar) throw new Error(`글꼴 '${source.family}'의 정적 파일이 필요합니다.`);
      return font;
    });
    cache.set(source.url, pending);
    void pending.catch(() => cache.delete(source.url));
  }
  return cache.get(source.url)!;
}
export function selectFontSource(family: string, weight: string | number, style = 'normal', sources = EDITOR_FONTS) {
  const direct = sources.filter((source) => source.family.toLowerCase() === family.toLowerCase());
  const candidates = direct.length ? direct : sources.filter((source) => source.family === resolveFontFamily(family));
  const styled = candidates.filter((source) => (source.style || 'normal') === style);
  return [...(styled.length ? styled : candidates)].sort(
    (a, b) =>
      Math.abs((a.weight || 400) - Number(weight)) - Math.abs((b.weight || 400) - Number(weight)) ||
      (a.weight || 400) - (b.weight || 400),
  )[0];
}
