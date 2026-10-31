<?php

namespace App\Support;

use App\Models\Order;

class OrderNumberGenerator
{
    public static function generate(): string
    {
        do {
            $orderNumber = 'PRINTLY' . now()->format('Ymd') . '-' . str_pad((string) random_int(0, 99999), 5, '0', STR_PAD_LEFT);
        } while (Order::where('order_number', $orderNumber)->exists());

        return $orderNumber;
    }
}