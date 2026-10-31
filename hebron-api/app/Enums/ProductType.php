<?php

namespace App\Enums;

enum ProductType: string
{
    case TROPHIES = 'trophies';
    case PLAQUES = 'plaques';
    case MEDALS_BADGES = 'medals_badges';
    case SIGNBOARDS_NAMEPLATES = 'signboards_nameplates';
    case OTHERS = 'others';

    public function label(): string
    {
        return match ($this) {
            self::TROPHIES => 'Trophies',
            self::PLAQUES => 'Plaques',
            self::MEDALS_BADGES => 'Medals / Badges',
            self::SIGNBOARDS_NAMEPLATES => 'Signboards / Nameplates',
            self::OTHERS => 'Others',
        };
    }

    public function labelEn(): string
    {
        return match ($this) {
            self::TROPHIES => 'TROPHIES',
            self::PLAQUES => 'PLAQUES',
            self::MEDALS_BADGES => 'MEDALS / BADGES',
            self::SIGNBOARDS_NAMEPLATES => 'SIGNBOARDS / NAMEPLATES',
            self::OTHERS => 'OTHERS',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
