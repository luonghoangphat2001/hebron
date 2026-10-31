<?php

namespace App\Services\Admin;

use App\Models\DesignGroup;
use App\Models\Order;
use App\Models\OrderItem;
use App\Services\PrintPdfService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use setasign\Fpdi\Fpdi;
use setasign\Fpdi\PdfParser\StreamReader;
use Symfony\Component\HttpKernel\Exception\HttpException;

/** Builds production downloads exclusively from revision-bound print artifacts. */
class OrderPrintPdfService
{
    public function __construct(protected PrintPdfService $printPdfService) {}

    public function manifest(Order $order): array
    {
        $order->loadMissing('items.designGroup');
        $files = [];
        $totalPages = 0;
        $totalBytes = 0;

        foreach ($order->items->sortBy('id') as $item) {
            if ($item->design_group_id === null) {
                continue;
            }

            [$content, $pageCount] = $this->validatedArtifact($item);
            $totalBytes += strlen($content);
            $totalPages += $pageCount;
            unset($content);
            if (count($files) >= 200 || $totalBytes > 100 * 1024 * 1024) {
                throw new HttpException(422, 'Order print PDF exceeds the document limit (200 documents / 100 MiB).');
            }
            if ($totalPages > 200) {
                throw new HttpException(422, 'Order print PDF exceeds 200 pages.');
            }
            $files[] = [
                'order_item_id' => $item->id,
                'design_group_id' => $item->design_group_id,
                'filename' => $this->filename($order, $item),
                'download_url' => route('admin.orders.items.print-pdf', [
                    'orderNumber' => $order->order_number,
                    'orderItemId' => $item->id,
                ]),
            ];
        }

        if ($files === []) {
            throw new HttpException(409, 'This order has no designs to print. Add a design and generate its print PDF in the editor.');
        }

        return $files;
    }

    public function filename(Order $order, OrderItem $item): string
    {
        return 'order-'.preg_replace('/[^a-zA-Z0-9\-]/', '-', $order->order_number)
            .'-item-'.$item->id.'-design-'.$item->design_group_id.'-print.pdf';
    }

    public function content(OrderItem $item): string
    {
        return $this->validatedArtifact($item)[0];
    }

    /** Validate without rewriting or retaining other items' PDF bytes. */
    private function validatedArtifact(OrderItem $item): array
    {
        $failure = 'Order item '.$item->id.': print PDF is missing, stale or corrupt. Open its design in the editor, save and regenerate the print PDF.';
        if (! $item->designGroup instanceof DesignGroup) {
            throw new HttpException(409, 'Order item '.$item->id.': linked design is missing. Restore the design before generating its print PDF.');
        }

        try {
            $content = $this->printPdfService->content($item->designGroup);
        } catch (ModelNotFoundException $e) {
            throw new HttpException(409, $failure, $e);
        } catch (HttpException $e) {
            if ($e->getStatusCode() !== 409) {
                throw $e;
            }
            throw new HttpException(409, $failure, $e);
        }
        if ($content === null) {
            throw new HttpException(409, $failure);
        }

        // Parse every page to reject corrupt artifacts with item context.
        try {
            $pdf = new Fpdi;
            $count = $pdf->setSourceFile(StreamReader::createByString($content));
            if ($count < 1 || $count > 20) {
                throw new \RuntimeException('Invalid page count');
            }
            for ($page = 1; $page <= $count; $page++) {
                $size = $pdf->getTemplateSize($pdf->importPage($page));
                if ($size['width'] <= 0 || $size['height'] <= 0 || $size['width'] > 3000 || $size['height'] > 3000) {
                    throw new \RuntimeException('Invalid page size');
                }
            }
        } catch (\Throwable $e) {
            throw new HttpException(409, $failure, $e);
        }

        return [$content, $count];
    }
}
