<?php

namespace App\Enums;

enum MesIntegrationDirection: string
{
    case MallToMes = 'mall_to_mes';
    case MesToMall = 'mes_to_mall';

    public function label(): string
    {
        return match ($this) {
            self::MallToMes => 'Mall to MES',
            self::MesToMall => 'MES to Mall',
        };
    }

    public static function values(): array
    {
        return array_map(
            fn(self $direction) => $direction->value,
            self::cases()
        );
    }
}