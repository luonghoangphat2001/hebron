# Editor font catalog and physical PDF export

## Rendering contract

The physical width and height define the print frame aspect ratio. The exporter
uses one uniform scale for the complete cut-local scene: text, shapes and images
retain their proportions. Artwork objects and text outlines stay vector where
supported. Background color and `backgroundImage` print below the artwork. Image objects
remain printable as well. Background `cover`, `contain` and `fill` placement uses
`background.previewSize` when present, otherwise the original canvas bounds. The
background is translated into cut-local coordinates and clipped to its backing
rectangle and the print area. Expanding the physical print surface does not
stretch the background photo. SVG backgrounds retain vector content; bitmap
backgrounds remain bitmap assets. Missing or invalid backgrounds stop export
with an actionable error rather than silently omitting the image.

The drawn trim and physical dimensions update in both directions using one
stable pixels-per-mm value. Entering a physical width/height resizes the trim;
dragging any of the four corners or editing canvas width/height updates both
physical dimensions. Corner resizing keeps its opposite corner fixed. Artwork
coordinates and proportions stay unchanged.

Legacy frames normalize at runtime on template import and saved-design loading,
before the editor is ready or the first export. Configured physical dimensions
are authoritative. Width establishes the existing pixels-per-mm; height follows the physical
width/height ratio. Layer coordinates, sizes and glyph pixel outlines stay
unchanged. Template text conversion uses the original saved frame scale before
frame normalization, so fonts are not enlarged by the legacy correction.
Persisted pixel designs normalize each side without mutating the saved input.
The exporter defensively normalizes a local frame copy if a caller supplies legacy
state, without mutating the current canvas or requiring a preliminary size edit.

There is no calibration step or database migration. Shrinking the print area may
put artwork beyond the visible trim. Mockups retain their original preview bounds
when the backing surface expands. Existing saved PDFs require regeneration.

The user and admin editors use the same static font catalog and outline layout.
Legacy family names resolve silently; the inspector shows the resolved name.
Resolved values persist only through the normal save flow. Existing production
templates and stored PDFs are not migrated or rewritten by this change.

## Sources and reproducibility

Run `scripts/build-editor-fonts.py` with FontTools and Brotli installed. Optional
`--copy-to ../hebron-console` synchronizes generated assets to the admin app.

- Google Fonts source revision: `ddf386ba1b9fbc6b2c818f1ddcd9148f54ced94b`.
- Tinos' license is obtained from its official upstream repository at
  `3b4482a99b80ea5fc75f187b1be3120a3f5905b3`, because the Google Fonts directory
  at the pinned revision omits the license file.
- Pretendard uses the already bundled source `Version 1.301;FEAKit 1.0`.
- `src/assets/fonts/editor/manifest.json` records each generated static face,
  supported codepoint ranges and SHA-256 digest.
- `src/assets/fonts/editor/sources.json` records source URLs, source digests,
  revisions and license URLs/digests. Each family directory contains its license.
- Variable fonts are instantiated into static integer weights and derived
  internal names are prefixed with Hebron. FontTools is a build-time dependency.
- All runtime files are local. No Google CDN connection is needed by the editor.

The generated catalog contains 105 static faces in 16 families. Original Nanum
and Pretendard families are retained. Proprietary/system-only names use the
approved replacement table below. A font installed on a workstation is not a
redistribution license; see the official [Microsoft font redistribution FAQ](https://learn.microsoft.com/en-us/typography/fonts/font-faq).

| Legacy name | Local family |
| --- | --- |
| Arial, Helvetica | Arimo |
| Times New Roman | Tinos |
| Courier New, Lucida Console | Cousine |
| Georgia | Gelasio |
| Verdana | PT Sans |
| Trebuchet MS | Cabin |
| Impact | Oswald |
| Comic Sans MS | Comic Neue |
| Palatino | Crimson Text |
| Garamond | EB Garamond |
| Bookman | Libre Baskerville |
| Tahoma | Source Sans 3 |
| Gungsuh | Nanum Myeongjo |
| Inter, unrecognized legacy family | Pretendard |

The 2026-10-28 read-only production template inventory found Arial (4 layers)
and Nanum Gothic (1 layer). No production data was changed by this inventory.

## Weights and mixed scripts

Weight controls list actual bundled weights. Legacy values resolve to the
nearest available weight; ties choose the lower weight. Pretendard supports
100–900. Nanum Gothic/Myeongjo support 400/700/800, so their legacy 500 resolves
to 400 consistently on screen and in PDF.

Missing glyphs resolve using the same family-category fallback on canvas and
PDF: Nanum Gothic for sans, Nanum Myeongjo for serif, Nanum Gothic Coding for
mono, followed by bundled general coverage. Unsupported glyphs or failed font
loads produce actionable errors rather than .notdef outlines. Conversion of
supported legacy names/weights does not produce notifications.

## Verification entry point

Run Vite with `tests/print-pdf.vite.config.ts` and open
`/tests/print-pdf-fixture.html`. The fixture exercises production modules and
provides buttons for registry/layout checks, 85 × 170 mm uniform export, immediate
legacy template/persisted-design export and direct geometry/mm synchronization,
all local families with Korean/Vietnamese/Latin content, vector shapes, masks,
single/double-sided export and input-state invariance.

Previously stored PDFs retain the prior layout until regenerated in the editor
and uploaded through the existing revision-bound PDF endpoint.
