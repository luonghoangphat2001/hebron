<?php

namespace App\Enums;

enum MesTriggerType: string
{
    case OrderCreated = 'order_created';
    case ConfirmDesign = 'confirm_design';
    case StockInfo = 'stock_info';
    case InventoryUpdated = 'inventory_updated';
    case OrderStatus = 'order_status';

    public function label(): string
    {
        return match ($this) {
            self::OrderCreated => 'Order Created',
            self::ConfirmDesign => 'Confirm Design',
            self::StockInfo => 'Stock Info',
            self::InventoryUpdated => 'Inventory Updated',
            self::OrderStatus => 'Order Status',
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