import {
  EDITOR_FONTS,
  fontFallbackFamily,
  loadEditorFont,
  resolveFontWeight,
  selectFontSource,
  type EditorFontSource,
} from './editor-fonts';
import type { Font } from 'opentype.js';

export interface EditorTextInput {
  content: string;
  fontFamily: string;
  fontWeight: string;
  fontStyle: string;
  fontSize: number;
  size: { width: number };
  lineHeight: number;
  letterSpacing: number;
  align: string;
  textDecoration: string;
}
export interface EditorTextLayout {
  paths: string[];
  decorations: { x: number; y: number; width: number }[];
  height: number;
}

/** Both Konva and the vector PDF consume these exact glyph outlines and positions. */
export async function layoutEditorText(
  object: EditorTextInput,
  sources: EditorFontSource[] = EDITOR_FONTS,
): Promise<EditorTextLayout> {
  const size = object.fontSize;
  const weight = resolveFontWeight(object.fontFamily, object.fontWeight);
  const primarySource = selectFontSource(object.fontFamily, weight, object.fontStyle, sources);
  if (!primarySource) throw new Error(`글꼴 '${object.fontFamily}'을 찾을 수 없습니다.`);
  const primary = await loadEditorFont(primarySource);
  const glyphFonts = new Map<string, Font>();
  const content = object.content.normalize('NFC').replace(/\r\n?/g, '\n').replace(/\t/g, '    ');
  for (const character of new Set(Array.from(content.replace(/\n/g, '')))) {
    let font = primary;
    if (!font.charToGlyphIndex(character)) {
      // Use the same explicit fallback order on every OS, never browser/system fonts.
      for (const family of [fontFallbackFamily(object.fontFamily), 'Pretendard', 'Source Sans 3']) {
        const source = selectFontSource(family, weight, object.fontStyle, sources);
        if (!source) continue;
        const candidate = await loadEditorFont(source);
        if (candidate.charToGlyphIndex(character)) {
          font = candidate;
          break;
        }
      }
    }
    if (!font.charToGlyphIndex(character))
      throw new Error(`글꼴에 '${character}' 글자가 없습니다. 지원되는 문자나 다른 글꼴을 사용해 주세요.`);
    glyphFonts.set(character, font);
  }
  const glyphFont = (character: string) => glyphFonts.get(character) || primary;
  const advance = (character: string) =>
    glyphFont(character).getAdvanceWidth(character, size, { kerning: false }) + object.letterSpacing;
  const measure = (text: string) => Array.from(text).reduce((sum, character) => sum + advance(character), 0);
  const lines: { text: string; last: boolean }[] = [];
  for (const paragraph of content.split('\n')) {
    let remaining = Array.from(paragraph);
    if (!remaining.length) lines.push({ text: '', last: true });
    while (remaining.length) {
      let count = 0,
        width = 0;
      while (count < remaining.length && width + advance(remaining[count]) <= object.size.width)
        width += advance(remaining[count++]);
      // Still render an oversized glyph; narrow boxes must not silently lose text.
      count = Math.max(1, count);
      if (count < remaining.length && remaining[count] !== ' ' && remaining[count] !== '-') {
        const boundary = Math.max(remaining.slice(0, count).lastIndexOf(' '), remaining.slice(0, count).lastIndexOf('-'));
        if (boundary >= 0) count = boundary + 1;
      }
      const line = remaining.slice(0, count).join('');
      remaining = remaining.slice(count);
      if (remaining.length) while (remaining[0] === ' ') remaining.shift();
      lines.push({ text: object.align === 'justify' ? line.trim() : line.trimEnd(), last: !remaining.length });
    }
  }
  const paths: string[] = [],
    decorations: EditorTextLayout['decorations'] = [];
  lines.forEach(({ text, last }, index) => {
    const width = measure(text);
    let cursor =
      object.align === 'center' ? (object.size.width - width) / 2 : object.align === 'right' ? object.size.width - width : 0;
    const start = cursor;
    const baseline =
      index * size * object.lineHeight +
      (size * object.lineHeight) / 2 +
      (((primary.ascender + primary.descender) / primary.unitsPerEm) * size) / 2;
    const spaces = Array.from(text).filter((character) => character === ' ').length;
    const justify = object.align === 'justify' && !last && spaces > 0;
    const extra = justify ? Math.max(0, object.size.width - width) / spaces : 0;
    for (const character of text) {
      const path = glyphFont(character).getPath(character, cursor, baseline, size, { kerning: false });
      if (object.fontStyle === 'italic' && primarySource.style !== 'italic') {
        for (const command of path.commands) {
          if ('x' in command && 'y' in command) command.x += (baseline - command.y) * 0.2126;
          if ('x1' in command && 'y1' in command) command.x1 += (baseline - command.y1) * 0.2126;
          if ('x2' in command && 'y2' in command) command.x2 += (baseline - command.y2) * 0.2126;
        }
      }
      paths.push(path.toPathData(4));
      cursor += advance(character) + (character === ' ' ? extra : 0);
    }
    if (object.textDecoration !== 'none')
      decorations.push({
        x: start,
        y: baseline + (object.textDecoration === 'underline' ? 1 : -1) * Math.round(size / 4),
        width: justify ? object.size.width : width,
      });
  });
  return { paths, decorations, height: Math.max(1, lines.length) * size * object.lineHeight };
}
