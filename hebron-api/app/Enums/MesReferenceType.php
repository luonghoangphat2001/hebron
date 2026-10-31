<?php

namespace App\Enums;

enum MesReferenceType: string
{
    case Order = 'Order';
    case Inventory = 'Inventory';
    case Shipment = 'Shipment';

    public function label(): string
    {
        return match ($this) {
            self::Order => 'Order',
            self::Inventory => 'Inventory',
            self::Shipment => 'Shipment',
        };
    }

    public static function values(): array
    {
        return array_map(
            fn(self $type) => $type->value,
            self::cases()
        );
    }
}