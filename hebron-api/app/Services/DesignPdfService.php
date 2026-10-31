<?php

namespace App\Services;

use App\Models\DesignGroup;
use Dompdf\Dompdf;
use Dompdf\Options;
use Symfony\Component\HttpKernel\Exception\HttpException;

/**
 * Builds a PDF containing front and back design previews for an order.
 * Used from order list: button to view design as PDF (mặt trước + mặt sau).
 */
class DesignPdfService
{
    public function __construct(
        protected DesignService $designService,
        protected PrintPdfService $printPdfService,
    ) {}

    /**
     * Generate PDF binary content for the order's designs (one page per side: front, back).
     *
     * @return string PDF binary content
     */
    public function buildPdf(DesignGroup $designGroup): string
    {
        $content = $this->printPdfService->content($designGroup);
        if ($content !== null) {
            return $content;
        }
        // New editor designs must never silently turn into a raster preview.
        $metadata = $designGroup->metadata ?? [];
        if ($designGroup->print_pdf_revision !== null || ($metadata['schema'] ?? null) === 'hebron-product-design-v1') {
            throw new HttpException(409, 'Print PDF is missing or stale. Regenerate it in the editor.');
        }

        $pages[] = $this->buildPage($designGroup);

        if (empty($pages)) {
            return $this->buildEmptyPdf($designGroup->order_number);
        }

        return $this->renderPdf($pages);
    }

    protected function getImageDataUri(DesignGroup $designGroup): ?string
    {
        $path = $designGroup->preview_image_path;
        if ($path === null || $path === '') {
            return null;
        }

        $content = $this->designService->getPreviewContent($designGroup);
        if ($content === null) {
            return null;
        }

        $mime = $this->mimeFromPath($path);

        return 'data:'.$mime.';base64,'.base64_encode($content);
    }

    /** Minimal 1x1 transparent PNG as data URI (placeholder when no preview file). */
    protected function getPlaceholderImageDataUri(): string
    {
        $base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

        return 'data:image/png;base64,'.$base64;
    }

    protected function mimeFromPath(string $path): string
    {
        $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));

        return match ($ext) {
            'png' => 'image/png',
            'gif' => 'image/gif',
            'webp' => 'image/webp',
            default => 'image/jpeg',
        };
    }

    protected function buildEmptyPdf(string $orderNumber): string
    {
        $html = $this->wrapPage(
            '<p style="text-align:center;color:#666;">No design preview available for order '.e($orderNumber).'.</p>'
        );

        return $this->renderHtmlToPdf($html);
    }

    /**
     * @param  array<int, array{label: string, side: string, data_uri: string}>  $pages
     */
    protected function renderPdf(array $pages): string
    {
        $body = '';
        foreach ($pages as $index => $page) {
            $body .= '<div class="page" style="page-break-after: '.($index < count($pages) - 1 ? 'always' : 'auto').'; text-align:center;">';
            $body .= '<p style="font-size:12px;color:#666;margin-bottom:8px;">'.e($page['label']).'</p>';
            $body .= '<img src="'.$page['data_uri'].'" style="max-width:100%; height:auto; max-height:90vh;" />';
            $body .= '</div>';
        }

        $html = $this->wrapPage($body);

        return $this->renderHtmlToPdf($html);
    }

    protected function wrapPage(string $body): string
    {
        return '<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:DejaVu Sans,sans-serif;margin:20px;} .page{min-height:80vh;}</style></head><body>'.$body.'</body></html>';
    }

    protected function buildPage(DesignGroup $designGroup): array
    {
        $imageData = $this->getImageDataUri($designGroup);
        if ($imageData === null) {
            $imageData = $this->getPlaceholderImageDataUri();
        }

        return [
            'label' => 'Preview',
            'data_uri' => $imageData,
        ];
    }

    protected function renderHtmlToPdf(string $html): string
    {
        $options = new Options;
        $options->set('isRemoteEnabled', false);
        $options->set('isHtml5ParserEnabled', true);

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        return (string) $dompdf->output();
    }
}
