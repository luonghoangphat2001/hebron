<?php

namespace App\Enums;

enum DesignRevisionStatus: string
{
    case Pending = 'pending';
    case Modify = 'modify';
    case Approve = 'approve';

    public function label(): string
    {
        return match ($this) {
            self::Pending => '대기',
            self::Modify => '수정 요청',
            self::Approve => '승인',
        };
    }

    public function labelEn(): string
    {
        return match ($this) {
            self::Pending => 'Pending',
            self::Modify => 'Modify',
            self::Approve => 'Approve',
        };
    }

    public static function values(): array
    {
        return array_map(
            fn(self $status) => $status->value,
            self::cases()
        );
    }
}
