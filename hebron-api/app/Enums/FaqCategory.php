<?php

namespace App\Enums;

enum FaqCategory: string
{
    case RETURNS_EXCHANGES = 'returns_exchanges';
    case SHIPPING = 'shipping';
    case MEMBER_INFORMATION = 'member_information';
    case ETC = 'etc';
    case CANCELLATION_REFUND = 'cancellation_refund';
    case ORDER_PAYMENT = 'order_payment';

    public function label(): string
    {
        return match ($this) {
            self::RETURNS_EXCHANGES => 'Returns/Exchanges',
            self::SHIPPING => 'Shipping',
            self::MEMBER_INFORMATION => 'Member Information',
            self::ETC => 'etc',
            self::CANCELLATION_REFUND => 'Cancellation/Refund',
            self::ORDER_PAYMENT => 'Order/Payment',
        };
    }

    /**
     * Cafe24 board_category value
     */
    public function boardCategory(): int
    {
        return match ($this) {
            self::RETURNS_EXCHANGES => 1,
            self::SHIPPING => 2,
            self::MEMBER_INFORMATION => 3,
            self::ETC => 4,
            self::CANCELLATION_REFUND => 5,
            self::ORDER_PAYMENT => 6,
        };
    }

    public static function fromBoardCategory(int $category): ?self
    {
        return match ($category) {
            1 => self::RETURNS_EXCHANGES,
            2 => self::SHIPPING,
            3 => self::MEMBER_INFORMATION,
            4 => self::ETC,
            5 => self::CANCELLATION_REFUND,
            6 => self::ORDER_PAYMENT,
            default => null,
        };
    }
}
