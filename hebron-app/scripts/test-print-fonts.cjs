const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { parse } = require('opentype.js');

const fonts = [400, 700].map((weight) => {
  const bytes = fs.readFileSync(path.join(__dirname, `../src/assets/fonts/print/HebronPrintSans-${weight}.woff`));
  const font = parse(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
  assert.equal(font.tables.fvar, undefined, 'Print fonts must be statically instantiated');
  assert.equal(font.names.windows.fontFamily.en, 'Hebron Print Sans', 'Derived font primary name must not reuse Reserved Font Name');
  assert.match(font.names.windows.license.en, /SIL Open Font License/);
  for (const character of '한글벡터인쇄대한민국RegularBold0123456789') {
    assert.notEqual(font.charToGlyphIndex(character), 0, `Missing ${character} at ${weight}`);
  }
  const outline = font.getPath('한글 Vector', 0, 0, 20).toPathData(4);
  assert.match(outline, /[ML]/, 'Korean glyphs must expose actual outline commands');
  assert.ok(outline.length > 1000);
  return { font, outline };
});
assert.notEqual(fonts[0].outline, fonts[1].outline, 'Bold must not reuse the regular outline');
// The first Hangul vertical stem got inverted by the variable-font JS parser.
const stemWidth = ({ font }) => {
  const commands = font.getPath('한', 0, 30, 20).commands;
  return commands[0].x - commands[2].x;
};
assert.ok(stemWidth(fonts[1]) > stemWidth(fonts[0]), 'Static bold Hangul stem must be thicker, not corrupted');
console.log('PASS: static 400/700 fonts, Korean/Latin coverage, vector outlines, genuine bold weight');
