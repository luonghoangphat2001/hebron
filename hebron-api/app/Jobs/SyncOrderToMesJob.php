<?php

namespace App\Jobs;

use App\Integrations\Mes\MESOrderIntegration;
use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SyncOrderToMesJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(protected Order $order) {}

    /**
     * Execute the job.
     */
    public function handle(MESOrderIntegration $mesIntegration): void
    {
        $this->order->loadMissing('items.product');

        $orderData = [
            'sid' => 'withaward', // Adjust as needed
            'order_id' => (string) $this->order->order_number,
            'send_name' => $this->order->contact_name,
            'send_hphone' => $this->order->contact_phone,
            'order_date' => $this->order->placed_at->format('Y-m-d H:i:s'),
            'total_price' => (int) $this->order->total_amount,
            'productInfo' => $this->order->items->map(function ($item) {
                $sku = $item->product?->sku ?? data_get($item->configuration, 'product_snapshot.sku') ?? $item->title ?? $item->product?->name;

                if (! is_string($sku) || trim($sku) === '') {
                    throw new \RuntimeException(
                        "Cannot sync order {$this->order->order_number}: product SKU is missing."
                    );
                }

                return [
                    'prdname' => $sku,
                    'amount' => (int) $item->quantity,
                    'sellPrice' => (int) $item->selling_price,
                ];
            })->toArray(),
        ];

        $response = $mesIntegration->registerOrderFromMall($orderData, $this->order->id);

        if (($response['code'] ?? '') === 'success') {
            Log::info('Order synced to MES successfully', ['order_number' => $this->order->order_number]);
        } else {
            Log::error('Order sync to MES failed', [
                'order_number' => $this->order->order_number,
                'response' => $response,
            ]);
        }
    }
}