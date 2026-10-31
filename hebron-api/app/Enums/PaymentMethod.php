<?php

namespace App\Enums;

enum PaymentMethod: string
{
    case CARD = 'card';
    case TOSS = 'toss';
    case TRANSFER = 'transfer';

    public function label(): string
    {
        return match ($this) {
            self::CARD => '카드결제',
            self::TOSS => '토스페이먼츠',
            self::TRANSFER => '무통장입금',
        };
    }

    /**
     * Payment methods shown to the order form.
     */
    public static function allowedForDisplay(): array
    {
        return [
            self::CARD,
            self::TOSS,
            self::TRANSFER,
        ];
    }

    public function requiresImmediateVerification(): bool
    {
        return in_array($this, [self::CARD, self::TOSS], true);
    }

    /**
     * Parse from DB/API value (maps legacy 'credit_card' to CARD)
     */
    public static function fromStored(?string $value): ?self
    {
        if ($value === null || $value === '') {
            return null;
        }

        return self::tryFrom($value);
    }

    /**
     * Parse checkout / legacy string to enum (never returns PAY_LATER for unknown tax_invoice if mapped).
     */
    public static function forCheckoutString(?string $value): self
    {
        $fromStored = self::fromStored($value);
        if ($fromStored !== null) {
            return $fromStored;
        }

        return self::tryFrom($value);
    }
}
