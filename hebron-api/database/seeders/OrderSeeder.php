<?php

namespace Database\Seeders;

use App\Enums\OrderStatus;
use App\Enums\ShippingMethod;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OrderSeeder extends Seeder
{
    public function run()
    {
        $this->truncateOrderTables();

        $user = User::first() ?? User::factory()->create();
        $product = Product::first() ?? Product::factory()->create();

        $orders = [
            [
                'order_number' => 'PRINTLY20260708-55515',
                'user_id' => $user->id,
                'status' => 'awaiting_payment',
                'payment_status' => 'pending',
                'currency' => 'KRW',
                'subtotal_amount' => 150000,
                'discount_amount' => 0,
                'tax_amount' => 15000,
                'shipping_fee' => 5000,
                'total_amount' => 170000,
                'payment_method' => 'toss',
                'contact_name' => '홍길동',
                'contact_phone' => '010-1234-5678',
                'contact_phone2' => '010-8765-4321',
                'contact_email' => 'user@example.com',
                'company_name' => '(주)서문프린팅',
                'shipping_name' => '홍길동',
                'shipping_phone' => '010-1234-5678',
                'shipping_postcode' => '06234',
                'shipping_address' => '서울 마포구 동교로 171',
                'shipping_address_detail' => '1층 경비실',
                'shipping_method' => ShippingMethod::COURIER,
                'estimated_production_days' => 0,
                'placed_at' => '2026-07-08 09:15:18',
                'customer_note' => 'Please call before delivery.',
                'metadata' => [],
            ],
            [
                'order_number' => 'PRINTLY20260708-03947',
                'user_id' => $user->id,
                'status' => 'confirmed',
                'payment_status' => 'pending',
                'currency' => 'KRW',
                'subtotal_amount' => 150000,
                'discount_amount' => 0,
                'tax_amount' => 15000,
                'shipping_fee' => 5000,
                'total_amount' => 170000,
                'payment_method' => 'toss',
                'contact_name' => '홍길동',
                'contact_phone' => '010-1234-5678',
                'contact_phone2' => '010-8765-4321',
                'contact_email' => 'user@example.com',
                'company_name' => '(주)서문프린팅',
                'shipping_name' => '홍길동',
                'shipping_phone' => '010-1234-5678',
                'shipping_postcode' => '06234',
                'shipping_address' => '서울 마포구 동교로 171',
                'shipping_address_detail' => '1층 경비실',
                'shipping_method' => ShippingMethod::COURIER,
                'estimated_production_days' => 0,
                'placed_at' => '2026-07-08 09:15:34',
                'customer_note' => 'Please call before delivery.',
                'metadata' => [],
            ],
        ];

        foreach ($orders as $data) {
            $order = Order::create($data);
            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $product->id,
                'title' => 'Sample Product Order Item',
                'quantity' => 1,
                'supply_price' => 100000,
                'selling_price' => 150000,
                'total_amount' => 150000,
                'configuration' => [],
            ]);
        }

        $this->command->info("Orders seeded successfully!");
    }

    private function truncateOrderTables(): void
    {
        $driver = DB::getDriverName();
        if ($driver === 'mysql') {
            DB::statement('SET FOREIGN_KEY_CHECKS=0');
        }

        DB::table('order_items')->truncate();
        DB::table('orders')->truncate();

        if ($driver === 'mysql') {
            DB::statement('SET FOREIGN_KEY_CHECKS=1');
        }
    }
}
