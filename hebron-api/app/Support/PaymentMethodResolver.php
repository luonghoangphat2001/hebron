<?php

namespace App\Support;

use App\Enums\PaymentMethod;

final class PaymentMethodResolver
{
    public static function resolve(?string $paymentMethod = null): PaymentMethod
    {
        return PaymentMethod::forCheckoutString($paymentMethod ?? PaymentMethod::TOSS->value)
            ?? PaymentMethod::TOSS;
    }
}
