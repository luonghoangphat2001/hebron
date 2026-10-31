<?php

namespace App\Console\Commands;

use App\Enums\OrderShipmentStatus;
use App\Enums\OrderStatus;
use App\Jobs\SyncShipmentTrackingJob;
use App\Models\OrderShipment;
use Illuminate\Console\Command;

class SyncActiveShipmentTracking extends Command
{
    protected $signature = 'sweettracker:sync-active';

    protected $description = 'Queue tracking refreshes for active shipments';

    public function handle(): int
    {
        $cutoff = now()->subMinutes(max(1, (int) config('services.sweettracker.poll_interval_minutes', 30)));
        $count = 0;
        OrderShipment::query()->whereNotNull('invoice_number')->whereNotNull('carrier_code')
            ->where('status', '!=', OrderShipmentStatus::DELIVERED->value)
            ->where(fn ($query) => $query->whereNull('tracking_last_synced_at')->orWhere('tracking_last_synced_at', '<=', $cutoff))
            ->whereHas('order', fn ($query) => $query->whereNotIn('status', [
                OrderStatus::Completed->value, OrderStatus::DeliveryCompleted->value,
                OrderStatus::Cancelled->value, OrderStatus::RefundRequested->value, OrderStatus::RefundCompleted->value,
            ]))
            ->select('id')->chunkById(100, function ($shipments) use (&$count): void {
                foreach ($shipments as $shipment) {
                    SyncShipmentTrackingJob::dispatch($shipment->id);
                    $count++;
                }
            });
        $this->info("Queued {$count} shipment tracking refresh(es).");

        return self::SUCCESS;
    }
}
