<?php

namespace App\Enums;

enum SiteType: string
{
    case SHOPPING_MALL = 'SHOPPING_MALL'; // Shopping mall site (/mall)
    case BRAND_SITE = 'BRAND_SITE'; // Public brand site
    case PLAIN_SITE = 'PLAIN_SITE'; // Vendor site

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
