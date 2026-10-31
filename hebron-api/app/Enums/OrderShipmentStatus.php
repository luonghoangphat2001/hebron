<?php

namespace App\Enums;

enum OrderShipmentStatus: string
{
    case PENDING    = 'pending';
    case IN_TRANSIT = 'in_transit';
    case DELIVERED  = 'delivered';

    public function label(string $locale = 'en'): string
    {
        return match($locale) {
            'ko' => match($this) {
                self::PENDING   => '대기',
                self::IN_TRANSIT => '배송중',
                self::DELIVERED  => '배송완료',
            },
            'ja' => match($this) {
                self::PENDING   => '保留中',
                self::IN_TRANSIT => '配送中',
                self::DELIVERED  => '配達完了',
            },
            default => match($this) {
                self::PENDING   => 'Pending',
                self::IN_TRANSIT => 'In transit',
                self::DELIVERED  => 'Delivered',
            },
        };
    }
}
