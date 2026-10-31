<?php

namespace App\Enums;

enum ShippingMethod: string
{
    case COURIER = 'courier';      // Standard delivery (택배)

    /**
     * Get Korean label for shipping method
     */
    public function label(): string
    {
        return match ($this) {
            self::COURIER => '택배',
        };
    }

    /**
     * Check if shipping requires address
     */
    public function requiresAddress(): bool
    {
        return in_array($this, [self::COURIER]);
    }
}
