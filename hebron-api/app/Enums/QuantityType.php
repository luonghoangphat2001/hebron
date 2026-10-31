<?php

namespace App\Enums;

enum QuantityType: string
{
    case ONE_TO_TEN = 'one_to_ten'; // 1~10개
    case TEN_TO_FIFTY = 'ten_to_fifty'; // 10~50개
    case FIFTY_TO_ONE_HUNDRED = 'fifty_to_one_hundred'; // 50~100개
    case ONE_HUNDRED_PLUS = 'one_hundred_plus'; // 100개 이상
    case UNDETERMINED = 'undetermined'; // 미정

    public function label(): string
    {
        return match ($this) {
            self::ONE_TO_TEN => '1~10개',
            self::TEN_TO_FIFTY => '10~50개',
            self::FIFTY_TO_ONE_HUNDRED => '50~100개',
            self::ONE_HUNDRED_PLUS => '100개 이상',
            self::UNDETERMINED => '미정',
        };
    }

    public function labelEn(): string
    {
        return match ($this) {
            self::ONE_TO_TEN => '1~10',
            self::TEN_TO_FIFTY => '10~50',
            self::FIFTY_TO_ONE_HUNDRED => '50~100',
            self::ONE_HUNDRED_PLUS => '100+',
            self::UNDETERMINED => 'Undetermined',
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
