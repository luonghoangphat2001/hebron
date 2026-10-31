<?php

namespace Database\Seeders;

use App\Enums\DeliveryStatus;
use App\Models\DeliveryTracking;
use App\Models\Order;
use Illuminate\Database\Seeder;

class DeliveryTrackingSeeder extends Seeder
{
    public function run(): void
    {
        $order = Order::query()->orderBy('id')->first();

        if (! $order) {
            $this->command?->warn('Delivery tracking sample skipped: no order exists.');

            return;
        }

        DeliveryTracking::updateOrCreate(
            ['invoice_number' => 'SAMPLE-TRACKING-001'],
            [
                'order_id' => $order->id,
                'waybill_registered_at' => now()->subDays(2)->toDateString(),
                'delivery_status' => DeliveryStatus::InTransit,
                'courier_name' => 'CJ Logistics',
                'tracking_info' => [
                    'location' => 'Seoul Distribution Center',
                    'last_updated_at' => now()->subMinutes(10)->toIso8601String(),
                    'estimated_delivery_at' => now()->addDay()->toDateString(),
                    'events' => [
                        [
                            'status' => 'pickup',
                            'location' => 'Seoul Pickup Center',
                            'occurred_at' => now()->subDays(2)->toIso8601String(),
                        ],
                        [
                            'status' => 'in_transit',
                            'location' => 'Seoul Distribution Center',
                            'occurred_at' => now()->subMinutes(10)->toIso8601String(),
                        ],
                    ],
                ],
            ]
        );

        $this->command?->info('Sample delivery tracking created: SAMPLE-TRACKING-001');
    }
}
