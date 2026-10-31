<?php

namespace App\Enums;

enum DesignModeCode: string
{
    case WEB_EDITOR = 'web_editor';

    public function label(): string
    {
        return match ($this) {
            self::WEB_EDITOR => 'web editor',
        };
    }
}
