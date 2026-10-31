<?php

namespace App\Enums;

enum NotificationDeliveryStatus: string
{
    case PENDING = 'pending';
    case SENDING = 'sending';
    case ACCEPTED = 'accepted';
    case DELIVERED = 'delivered';
    case FAILED = 'failed';

    /** @return array<int, string> */
    public static function dispatchableValues(): array
    {
        return [self::PENDING->value, self::FAILED->value];
    }

    public function isAcceptedByProvider(): bool
    {
        return match ($this) {
            self::ACCEPTED, self::DELIVERED => true,
            self::PENDING, self::SENDING, self::FAILED => false,
        };
    }
}
