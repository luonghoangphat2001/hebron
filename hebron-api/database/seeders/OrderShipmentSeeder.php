<?php

namespace Database\Seeders;

use App\Enums\OrderShipmentStatus;
use App\Enums\ShippingMethod;
use App\Models\Order;
use App\Models\OrderShipment;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OrderShipmentSeeder extends Seeder
{
    public function run()
    {
        $this->truncateShipmentTables();

        $orders = Order::all();

        foreach ($orders as $order) {
            $this->createShipmentForOrder($order);
        }

        $this->command->info('OrderShipment seeded successfully!');
    }

    private function createShipmentForOrder(Order $order): void
    {
        $statuses = [
            OrderShipmentStatus::PENDING,
            OrderShipmentStatus::IN_TRANSIT,
            OrderShipmentStatus::DELIVERED,
        ];
        $randomStatus = $statuses[array_rand($statuses)];

        $shippedAt = null;
        $deliveredAt = null;

        if (in_array($randomStatus, [OrderShipmentStatus::IN_TRANSIT, OrderShipmentStatus::DELIVERED], true)) {
            $shippedAt = now()->subDays(rand(1, 5));
        }

        if ($randomStatus === OrderShipmentStatus::DELIVERED) {
            $deliveredAt = $shippedAt->addDays(rand(1, 3));
        }

        OrderShipment::create([
            'order_id' => $order->id,
            'status' => $randomStatus,
            'tracking_number' => 'TRK' . strtoupper(uniqid()),
            'carrier_code' => 'KR_CJ',
            'carrier_name' => 'CJ대한통운',
            'shipping_method' => ShippingMethod::COURIER->value,
            'memo' => null,
            'shipping_fee' => 3000,
            'shipping_name' => $order->shipping_name,
            'shipping_phone' => $order->shipping_phone,
            'shipping_postcode' => $order->shipping_postcode,
            'shipping_address' => $order->shipping_address,
            'shipping_address_detail' => $order->shipping_address_detail,
            'shipped_at' => $shippedAt,
            'delivered_at' => $deliveredAt,
        ]);
    }

    private function truncateShipmentTables(): void
    {
        $driver = DB::getDriverName();
        if ($driver === 'mysql') {
            DB::statement('SET FOREIGN_KEY_CHECKS=0');
        }

        DB::table('order_shipments')->truncate();

        if ($driver === 'mysql') {
            DB::statement('SET FOREIGN_KEY_CHECKS=1');
        }
    }
}
