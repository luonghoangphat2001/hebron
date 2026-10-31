<?php

namespace App\Services\Admin;

use App\Models\PaymentTransaction;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Support\Facades\Storage;

class PaymentReceiptPdfService
{
    private string $dir  = 'payment-receipts';

    public function generate(string $transactionId): string
    {
        $transaction = PaymentTransaction::with(['order.items.product', 'order.user'])
            ->where(function ($query) use ($transactionId) {
                if (ctype_digit($transactionId)) {
                    $query->whereKey((int) $transactionId)
                        ->orWhere('transaction_id', $transactionId);
                } else {
                    $query->where('transaction_id', $transactionId);
                }
            })
            ->firstOrFail();

        $order    = $transaction->order;
        $items = ($order?->items ?? collect())->map(fn ($item) => [
            'product_name' => $item->product?->name ?? $item->product_name ?? '-',
            'quantity'     => $item->quantity,
            'price'        => $item->price,
        ])->toArray();

        $html = view('admin.pdf.payment-receipt', [
            'transaction'  => $transaction,
            'order'        => $order,
            'items'        => $items,
            'fontPath'     => storage_path('fonts/NanumGothic.ttf'),
            'fontPathBold' => storage_path('fonts/NanumGothic-Bold.ttf'),
        ])->render();

        $pdf = $this->renderPdf($html);

        $filename = $this->dir . '/receipt-' . ($order?->order_number ?? $transactionId) . '-' . now()->format('Ymd_His') . '.pdf';
        $disk = Storage::disk(config('filesystems.public_disk'));
        $disk->put($filename, $pdf);

        return $disk->url($filename);
    }

    private function renderPdf(string $html): string
    {
        $options = new Options();
        $options->set('defaultFont', 'NanumGothic');
        $options->set('isRemoteEnabled', true);
        $options->setChroot('/');
        $options->set('fontDir', storage_path('fonts'));
        $options->set('fontCache', storage_path('fonts'));

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html, 'UTF-8');
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        return $dompdf->output();
    }
}
