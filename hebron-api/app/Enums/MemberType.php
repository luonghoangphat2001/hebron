<?php

namespace App\Enums;

enum MemberType: string
{
    case INDIVIDUAL = 'individual';
    case BUSINESS = 'business';

    public static function values(): array
    {
        return array_map(
            fn (self $item) => $item->value,
            self::cases()
        );
    }

    public function getLabel(): string
    {
        return match ($this) {
            self::INDIVIDUAL => '개인',
            self::BUSINESS => '사업자',
        };
    }
}
