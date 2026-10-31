<?php

namespace App\Enums;

enum CalligraphyType: string
{
    case CALLIGRAPHY = 'calligraphy';
    case SMOG_ONLY = 'smog_only';
    case WOOD_CASE_GOLD_ONLY = 'wood_case_gold_only';

    public function label(): string
    {
        return match ($this) {
            self::CALLIGRAPHY => '캘리그라피',
            self::SMOG_ONLY => '스모그전용',
            self::WOOD_CASE_GOLD_ONLY => '우드케이스 전용(골드컬러)',
        };
    }
}
