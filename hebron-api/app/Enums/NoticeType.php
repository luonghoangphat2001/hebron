<?php

namespace App\Enums;

enum NoticeType: string
{
    case GENERAL = 'general';         // 공통
    case IMPORTANT = 'important';     // 중요
    case MAINTENANCE = 'maintenance'; // 유지보수

    public function label(): string
    {
        return match ($this) {
            self::GENERAL => '공통',
            self::IMPORTANT => '중요',
            self::MAINTENANCE => '유지보수',
        };
    }

    public function labelEn(): string
    {
        return match ($this) {
            self::GENERAL => 'General',
            self::IMPORTANT => 'Important',
            self::MAINTENANCE => 'Maintenance',
        };
    }
}
