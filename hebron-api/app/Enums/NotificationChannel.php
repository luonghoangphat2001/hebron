<?php

namespace App\Enums;

enum NotificationChannel: string
{
    case EMAIL = 'email';
    case KAKAO = 'kakao';

    /** @return array<int, string> */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
