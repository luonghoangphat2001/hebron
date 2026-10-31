<?php

namespace App\Enums;

enum BudgetType: string
{
    case UP_TO_FIVE_HUNDRED = 'up_to_five_hundred'; // ~50만원
    case FIVE_HUNDRED_TO_ONE_MILLION = 'five_hundred_to_one_million'; // 50~100만원
    case ONE_MILLION_TO_THREE_MILLION = 'one_million_to_three_million'; // 100~300만원
    case THREE_MILLION_PLUS = 'three_million_plus'; // 300만원 이상
    case TO_BE_DISCUSSED = 'to_be_discussed'; // 추후 협의

    public function label(): string
    {
        return match ($this) {
            self::UP_TO_FIVE_HUNDRED => '~50만원',
            self::FIVE_HUNDRED_TO_ONE_MILLION => '50~100만원',
            self::ONE_MILLION_TO_THREE_MILLION => '100~300만원',
            self::THREE_MILLION_PLUS => '300만원 이상',
            self::TO_BE_DISCUSSED => '추후 협의',
        };
    }

    public function labelEn(): string
    {
        return match ($this) {
            self::UP_TO_FIVE_HUNDRED => 'Under 500K KRW',
            self::FIVE_HUNDRED_TO_ONE_MILLION => '500K ~ 1M KRW',
            self::ONE_MILLION_TO_THREE_MILLION => '1M ~ 3M KRW',
            self::THREE_MILLION_PLUS => 'Over 3M KRW',
            self::TO_BE_DISCUSSED => 'To be discussed',
        };
    }

    public static function values(): array
    {
        return array_map(
            fn(self $item) => $item->value,
            self::cases()
        );
    }
}
