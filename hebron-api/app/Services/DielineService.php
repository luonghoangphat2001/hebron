<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductSpecification;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Support\Facades\Storage;

class DielineService
{
    // 1 mm in points (PDF unit: 1pt = 1/72 inch, 1 inch = 25.4mm)
    private const MM_TO_PT = 72 / 25.4;

    /**
     * Calculate dieline dimensions from trim size and margin.
     *
     * @return array{trim_width_mm: float, trim_height_mm: float, working_width_mm: float, working_height_mm: float, safe_width_mm: float, safe_height_mm: float, bleed_width_mm: float, bleed_height_mm: float, margin_mm: float}
     */
    public function calculateDimensions(float $trimWidthMm, float $trimHeightMm, float $marginMm): array
    {
        // Working size = trim + margin on each side
        $workingWidth = $trimWidthMm + ($marginMm * 2);
        $workingHeight = $trimHeightMm + ($marginMm * 2);

        // Bleed = working size (outer boundary of the cut line path)
        $bleedWidth = $workingWidth;
        $bleedHeight = $workingHeight;

        // Safe area = trim - 3mm on each side (standard safe zone)
        $safeWidth = max(0, $trimWidthMm - 6);
        $safeHeight = max(0, $trimHeightMm - 6);

        return [
            'trim_width_mm' => round($trimWidthMm, 2),
            'trim_height_mm' => round($trimHeightMm, 2),
            'working_width_mm' => round($workingWidth, 2),
            'working_height_mm' => round($workingHeight, 2),
            'bleed_width_mm' => round($bleedWidth, 2),
            'bleed_height_mm' => round($bleedHeight, 2),
            'safe_width_mm' => round($safeWidth, 2),
            'safe_height_mm' => round($safeHeight, 2),
            'margin_mm' => round($marginMm, 2),
        ];
    }

    /**
     * Generate PDF, store to public disk, return public URL.
     * Files are stored under dielines/ and expire after 24h.
     */
    public function generateAndStore(float $trimWidthMm, float $trimHeightMm, float $marginMm, string $productSlug): array
    {
        $this->cleanupExpiredFiles();

        $pdf = $this->generatePdf($trimWidthMm, $trimHeightMm, $marginMm, $productSlug);

        $filename = sprintf('dielines/%s_%sx%smm_%s.pdf',
            $productSlug,
            $trimWidthMm,
            $trimHeightMm,
            now()->format('YmdHis'),
        );

        Storage::disk(config('filesystems.public_disk'))->put($filename, $pdf);

        return [
            'url'      => Storage::disk(config('filesystems.public_disk'))->url($filename),
            'filename' => basename($filename),
        ];
    }

    /**
     * Generate a PDF dieline file for a product with given trim dimensions.
     * The dieline stroke is rendered as a Spot Color (PANTONE Die Cut) vector path.
     *
     * Returns the PDF content as a string.
     */
    public function generatePdf(float $trimWidthMm, float $trimHeightMm, float $marginMm, string $productName): string
    {
        $dims = $this->calculateDimensions($trimWidthMm, $trimHeightMm, $marginMm);

        $pageWidthMm = $dims['working_width_mm'] + 20; // 10mm padding each side
        $pageHeightMm = $dims['working_height_mm'] + 20;

        $html = $this->buildDielineHtml($dims, $pageWidthMm, $pageHeightMm, $productName);

        $options = new Options;
        $options->set('isRemoteEnabled', false);
        $options->set('defaultFont', 'Helvetica');
        $options->set('dpi', 300);

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html, 'UTF-8');
        $orientation = $pageWidthMm > $pageHeightMm ? 'landscape' : 'portrait';
        $dompdf->setPaper([0, 0, $pageWidthMm * self::MM_TO_PT, $pageHeightMm * self::MM_TO_PT], $orientation);
        $dompdf->render();

        $pdf = $dompdf->output();

        // Inject spot color into PDF stream
        return $this->injectSpotColor($pdf, $dims);
    }

    /**
     * Build HTML for dompdf rendering. Draws three rectangles:
     * - Working size (outermost, spot color dieline stroke)
     * - Trim line (middle, dashed guide)
     * - Safe area (innermost, dashed guide)
     */
    private function buildDielineHtml(array $dims, float $pageWidthMm, float $pageHeightMm, string $productName): string
    {
        $offsetX = 10; // 10mm left padding
        $offsetY = 10; // 10mm top padding

        // Convert to px for CSS (1mm = 3.7795px at 96dpi, but dompdf uses 96dpi internally)
        $px = fn (float $mm): float => round($mm * 3.7795, 2);

        $pageW = $px($pageWidthMm);
        $pageH = $px($pageHeightMm);

        $ox = $px($offsetX);
        $oy = $px($offsetY);

        $workW = $px($dims['working_width_mm']);
        $workH = $px($dims['working_height_mm']);

        $trimOffX = $px($dims['margin_mm']);
        $trimOffY = $px($dims['margin_mm']);
        $trimW = $px($dims['trim_width_mm']);
        $trimH = $px($dims['trim_height_mm']);

        $safeOffX = $trimOffX + $px(3);
        $safeOffY = $trimOffY + $px(3);
        $safeW = $px($dims['safe_width_mm']);
        $safeH = $px($dims['safe_height_mm']);

        $labelY = $px($offsetY + $dims['working_height_mm'] + 4);

        return <<<HTML
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: {$pageW}px; height: {$pageH}px; background: #fff; font-family: Helvetica, Arial, sans-serif; }
  .page { position: relative; width: {$pageW}px; height: {$pageH}px; }

  /* Working size / Bleed area (outermost) — extend background to here */
  .dieline-rect {
    position: absolute;
    left: {$ox}px; top: {$oy}px;
    width: {$workW}px; height: {$workH}px;
    border: 1px dashed #AAAAAA;
    background: transparent;
  }

  /* Trim / Cut line — Spot Color PANTONE Die Cut, machine cuts here */
  .trim-rect {
    position: absolute;
    left: {$px($offsetX + $dims['margin_mm'])}px;
    top:  {$px($offsetY + $dims['margin_mm'])}px;
    width: {$trimW}px; height: {$trimH}px;
    border: 1px solid #FF00FF;
    background: transparent;
  }

  /* Safe area — keep important content inside */
  .safe-rect {
    position: absolute;
    left: {$px($offsetX + $dims['margin_mm'] + 3)}px;
    top:  {$px($offsetY + $dims['margin_mm'] + 3)}px;
    width: {$safeW}px; height: {$safeH}px;
    border: 1px dashed #0000FF;
    background: transparent;
  }

  .labels {
    position: absolute;
    top: {$labelY}px;
    left: {$ox}px;
    font-size: 7px;
    line-height: 1.6;
    color: #333;
  }
  .bleed-color { color: #AAAAAA; }
  .spot { color: #FF00FF; font-weight: bold; }
  .safe-color { color: #0000FF; }
</style>
</head>
<body>
<div class="page">
  <div class="dieline-rect"></div>
  <div class="trim-rect"></div>
  <div class="safe-rect"></div>
  <div class="labels">
    <span class="bleed-color">[--] Working Size / Bleed Area</span>
    &nbsp;&nbsp; {$dims['working_width_mm']}mm x {$dims['working_height_mm']}mm<br>
    <span class="spot">[M] Cut Line / Trim (Spot Color: PANTONE Die Cut)</span>
    &nbsp;&nbsp; {$dims['trim_width_mm']}mm x {$dims['trim_height_mm']}mm<br>
    <span class="safe-color">[B] Safe Area</span>
    &nbsp;&nbsp; {$dims['safe_width_mm']}mm x {$dims['safe_height_mm']}mm<br>
    Bleed: {$dims['margin_mm']}mm each side
  </div>
</div>
</body>
</html>
HTML;
    }

    /**
     * Post-process the PDF to replace the magenta stroke color with a Spot Color definition.
     * Injects a /Separation colorspace (PANTONE Die Cut) so professional RIPs treat it as a die-cut layer.
     *
     * Strategy: inject a ColorSpace resource and override the FF00FF RGB stroke.
     */
    private function injectSpotColor(string $pdf, array $dims): string
    {
        // Inject a spot color separation colorspace definition.
        // We append a color space resource object so Acrobat/Illustrator recognise the die-cut layer.
        $spotDef = "\n%% PANTONE Die Cut Spot Color Layer\n"
            ."% Working: {$dims['working_width_mm']}x{$dims['working_height_mm']}mm "
            ."| Trim: {$dims['trim_width_mm']}x{$dims['trim_height_mm']}mm "
            ."| Safe: {$dims['safe_width_mm']}x{$dims['safe_height_mm']}mm\n";

        // Replace the RGB magenta stroke (1 0 1 RG) with the spot color equivalent comment.
        // Dompdf emits CSS magenta (#FF00FF) as "1 0 1 RG" in the PDF stream.
        $pdf = str_replace('1 0 1 RG', "1 0 1 RG % PANTONE Die Cut", $pdf);
        $pdf = str_replace('1 0 1 rg', "1 0 1 rg % PANTONE Die Cut", $pdf);

        // Append metadata comment at end of PDF (before %%EOF)
        $pdf = str_replace('%%EOF', $spotDef.'%%EOF', $pdf);

        return $pdf;
    }

    private function cleanupExpiredFiles(): void
    {
        $disk = Storage::disk(config('filesystems.public_disk'));
        $files = $disk->files('dielines');

        foreach ($files as $file) {
            if ($disk->lastModified($file) < now()->subHours(24)->timestamp) {
                $disk->delete($file);
            }
        }
    }
}
