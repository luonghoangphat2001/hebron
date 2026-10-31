<?php

namespace App\Jobs;

use App\Enums\OrderShipmentStatus;
use App\Enums\OrderStatus;
use App\Models\OrderShipment;
use App\Services\SweetTrackerService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SyncShipmentTrackingJob implements ShouldBeUnique, ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public array $backoff = [60, 300];

    public int $uniqueFor = 600;

    public function __construct(public int $shipmentId) {}

    public function uniqueId(): string
    {
        return (string) $this->shipmentId;
    }

    public function handle(SweetTrackerService $service): void
    {
        $shipment = OrderShipment::query()->with('order')->find($this->shipmentId);
        if (! $shipment || ! $shipment->invoice_number || ! $shipment->carrier_code || $shipment->status === OrderShipmentStatus::DELIVERED) {
            return;
        }
        if (! $shipment->order || in_array($shipment->order->status, [OrderStatus::Completed->value, OrderStatus::DeliveryCompleted->value, OrderStatus::Cancelled->value, OrderStatus::RefundRequested->value, OrderStatus::RefundCompleted->value], true)) {
            return;
        }

        try {
            $response = $service->trackingInfo($shipment->carrier_code, $shipment->invoice_number);
            $events = $service->normalizeTrackingResponse($response);
            $service->persist($shipment, $events, $service->trackingLevel($response));
            $shipment->forceFill(['tracking_last_synced_at' => now()])->save();

        } catch (\Throwable $exception) {
            Log::error('SweetTracker tracking sync failed', [
                'shipment_id' => $shipment->id,
                'carrier_code' => $shipment->carrier_code,
                'exception' => $exception::class,
            ]);

            throw $exception;
        }
    }
}
