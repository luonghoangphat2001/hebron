<?php

namespace App\Enums;

enum MesIntegrationStatus: string
{
    case Success = 'success';
    case Failed = 'failed';

    public function label(): string
    {
        return match ($this) {
            self::Success => 'Success',
            self::Failed => 'Failed',
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