<?php

namespace App\Enums;

enum ProductVisibleRole: string
{
    case ALL = 'ALL';
    case MEMBER = 'MEMBER';
    case MANAGER = 'MANAGER';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
