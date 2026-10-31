<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OrderShipmentStatusSeeder extends Seeder
{
    public function run(): void
    {
        $inTransitCount = DB::table('order_shipments')
            ->where('status', 'shipped')
            ->update(['status' => 'in_transit']);

        $deliveredCount = DB::table('order_shipments')
            ->where('status', 'completed')
            ->update(['status' => 'delivered']);

        $this->command?->info(sprintf(
            'Shipment statuses normalized: %d shipped -> in_transit, %d completed -> delivered.',
            $inTransitCount,
            $deliveredCount
        ));
    }
}
