import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import ts from 'typescript';

// Run the real mapper without introducing a browser or test-framework dependency.
const moduleUrl = (source) =>
  `data:text/javascript;base64,${Buffer.from(
    ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    }).outputText,
  ).toString('base64')}`;
const storage = moduleUrl(await readFile(new URL('../src/utils/helper/storage-url.helper.ts', import.meta.url), 'utf8'));
const source = await readFile(new URL('../src/pages/product/templates/templateMapper.ts', import.meta.url), 'utf8');
const { DEFAULT_TEMPLATE_FORM, templateToPayload, templateToForm, createLayer, getInvalidTemplateCutSide } = await import(
  moduleUrl(source.replace('@/utils/helper/storage-url.helper', storage))
);
const single = () => ({ ...DEFAULT_TEMPLATE_FORM, name: 'Test', page_width: 115, page_height: 75 });

test('S3 background and layer URLs survive details load and save without losing host or query', () => {
  const url = 'https://cdn.example.test/storage/templates/image.png?v=123';
  const form = {
    ...single(),
    background_front: url,
    layers: [{ ...createLayer('image', 'front'), image_url: url, mask_image_url: url, fill_image_url: url }],
  };
  const loaded = templateToForm(templateToPayload(form));
  assert.equal(loaded.background_front, url);
  assert.equal(loaded.layers[0].image_url, url);
  assert.equal(loaded.layers[0].mask_image_url, url);
  assert.equal(loaded.layers[0].fill_image_url, url);
});

test('template asset resolver keeps external CDN URLs safe', async () => {
  const assetSource = await readFile(new URL('../src/pages/product/templates/templateAssetUrl.ts', import.meta.url), 'utf8');
  const { templateAssetUrl } = await import(moduleUrl(assetSource.replace('@/utils/helper/storage-url.helper', storage)));
  // Node has no Vite API endpoint; the resolver safely falls back to the original S3 URL.
  const s3 = 'https://bucket.s3.amazonaws.com/templates/a.png?v=1';
  assert.equal(templateAssetUrl(s3), s3);
  for (const url of ['https://cdn.test/storage/a.png?signature=abc', '//cdn.test/a.png'])
    assert.equal(templateAssetUrl(url), url);
});

test('save/load preserves null geometry and does not copy Front into unused Back', () => {
  const loaded = templateToForm(templateToPayload({ ...single(), safe_margin: 3 }));
  for (const field of ['cut_offset_x', 'cut_offset_y', 'cut_frame_width', 'cut_frame_height']) {
    assert.equal(loaded[field], null);
    assert.equal(loaded[`back_${field}`], null);
  }
  assert.equal(loaded.back_page_width, 0);
  assert.equal(loaded.back_safe_margin, 0);
  assert.equal(loaded.safe_margin, 3);
});

test('save/load preserves independent Front and Back geometry and layers', () => {
  const form = {
    ...single(),
    side: 'double',
    cut_offset_x: 0,
    cut_offset_y: 30,
    cut_frame_width: 600,
    cut_frame_height: 400,
    safe_margin: 2,
    back_page_width: 90,
    back_page_height: 50,
    back_cut_offset_x: 80,
    back_cut_offset_y: 40,
    back_cut_frame_width: 450,
    back_cut_frame_height: 250,
    back_safe_margin: 4,
    layers: [createLayer('text', 'front'), createLayer('text', 'back')],
  };
  const loaded = templateToForm(templateToPayload(form));
  for (const field of [
    'side',
    'page_width',
    'page_height',
    'safe_margin',
    'cut_offset_x',
    'cut_offset_y',
    'cut_frame_width',
    'cut_frame_height',
  ]) {
    assert.equal(loaded[field], form[field]);
    if (field !== 'side') assert.equal(loaded[`back_${field}`], form[`back_${field}`]);
  }
  assert.deepEqual(loaded.layers, form.layers);
});

test('legacy background coordinates use each side offset; missing layer side defaults to Front', () => {
  const payload = templateToPayload({
    ...single(),
    side: 'double',
    layers: [createLayer('text', 'front'), createLayer('text', 'back')],
  });
  Object.assign(payload.layout_config.guides.front, { layer_coordinate_space: 'background', cut_offset_x: 5, cut_offset_y: 10 });
  Object.assign(payload.layout_config.guides.back, { layer_coordinate_space: 'background', cut_offset_x: 15, cut_offset_y: 18 });
  delete payload.layout_config.layers[0].side;
  const loaded = templateToForm(payload);
  assert.equal(loaded.layers[0].side, 'front');
  assert.deepEqual(
    loaded.layers.map(({ position_x, position_y }) => [position_x, position_y]),
    [
      [15, 10],
      [5, 2],
    ],
  );
});

test('single-side creation omits unused back guides with default zero dimensions', () => {
  const form = single();
  assert.equal(getInvalidTemplateCutSide(form), undefined);
  const payload = templateToPayload(form);
  assert.equal(Object.hasOwn(payload.layout_config.guides, 'back'), false);
  assert.equal(payload.layout_config.guides.front.cut_width, 115);
  assert.equal(payload.layout_config.background.back_image_url, null);
});

test('double-side payload keeps independent cut dimensions, position and safety margin', () => {
  const form = {
    ...single(),
    side: 'double',
    safe_margin: 2,
    cut_offset_x: 10,
    back_page_width: 90,
    back_page_height: 50,
    back_safe_margin: 3,
    back_cut_offset_x: 20,
  };
  assert.equal(getInvalidTemplateCutSide(form), undefined);
  const { front, back } = templateToPayload(form).layout_config.guides;
  assert.deepEqual([front.cut_width, front.cut_height, front.safe_margin, front.cut_offset_x], [115, 75, 2, 10]);
  assert.deepEqual([back.cut_width, back.cut_height, back.safe_margin, back.cut_offset_x], [90, 50, 3, 20]);
  assert.equal(Object.hasOwn(templateToPayload({ ...form, side: 'single' }).layout_config.guides, 'back'), false);
  assert.equal(form.back_page_width, 90);
});

test('validate only used sides and reject zero, sub-minimum and non-finite dimensions', () => {
  for (const value of [0, -1, 0.5, NaN, Infinity]) {
    assert.equal(getInvalidTemplateCutSide({ ...single(), page_width: value }), 'front');
    assert.equal(getInvalidTemplateCutSide({ ...single(), page_height: value }), 'front');
    assert.equal(
      getInvalidTemplateCutSide({ ...single(), side: 'double', back_page_width: value, back_page_height: 75 }),
      'back',
    );
    assert.equal(
      getInvalidTemplateCutSide({ ...single(), side: 'double', back_page_width: 115, back_page_height: value }),
      'back',
    );
  }
  assert.equal(getInvalidTemplateCutSide({ ...single(), page_width: 1, page_height: 1 }), undefined);
});
