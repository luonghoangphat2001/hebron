<?php

namespace App\Services\Admin;

use App\Models\DesignGroup;
use App\Models\Order;
use App\Services\DesignPdfService;
use App\Services\DesignService;
use App\Services\PrintPdfService;
use Dompdf\Dompdf;
use Dompdf\Options;
use Symfony\Component\HttpKernel\Exception\HttpException;

/**
 * Builds a PDF containing front and back design previews for an order.
 * Used from order list: button to view design as PDF (mặt trước + mặt sau).
 */
class OrderDesignPdfService
{
    public function __construct(
        protected DesignService $designService,
        protected DesignPdfService $designPdfService,
        protected PrintPdfService $printPdfService,
    ) {}

    /**
     * Generate PDF binary content for the order's designs (one page per side: front, back).
     *
     * @return string PDF binary content
     */
    public function buildPdf(Order $order): string
    {
        // Designs are linked through order_items.design_group_id.
        // Do not load the non-existent Order::artworks relationship.
        $order->loadMissing(['items.designGroup']);

        $documents = [];
        $totalBytes = 0;
        foreach ($order->items as $item) {
            $designGroup = $item->designGroup;
            if ($designGroup instanceof DesignGroup) {
                $content = $this->designPdfService->buildPdf($designGroup);
                $totalBytes += strlen($content);
                if (count($documents) >= 200 || $totalBytes > 100 * 1024 * 1024) {
                    throw new HttpException(422, 'Order print PDF exceeds the document limit.');
                }
                $documents[] = $content;
            }
        }

        if (empty($documents)) {
            return $this->buildEmptyPdf($order->order_number);
        }

        return $this->printPdfService->merge($documents);
    }

    protected function getImageDataUri(DesignGroup $designGroup): ?string
    {
        $content = $this->designService->getPreviewContent($designGroup);
        if ($content === null || $content === '') {
            return null;
        }

        $path = $designGroup->preview_image_path ?? '';
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
    protected function renderPdf(string $orderNumber, array $pages): string
    {
        $body = '';
        foreach ($pages as $index => $page) {
            $label = $page['side'] === 'back' ? 'Back Side' : 'Front Side';
            $body .= '<div class="page" style="page-break-after: '.($index < count($pages) - 1 ? 'always' : 'auto').'; text-align:center;">';
            $body .= '<p style="font-size:12px;color:#666;margin-bottom:8px;">'.e($page['label']).' — '.$label.'</p>';
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

    protected function buildPage(Order $order, string $itemLabel, DesignGroup $designGroup): array
    {
        $imageData = $this->getImageDataUri($designGroup);
        if ($imageData === null) {
            $imageData = $this->getPlaceholderImageDataUri();
        }

        return [
            'label' => $order->order_number.' — '.$itemLabel,
            'side' => 'front',
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
