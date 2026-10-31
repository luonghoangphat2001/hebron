<?php

namespace App\Support;

use Illuminate\Http\Request;

final class GuestCommerceToken
{
    public const ATTRIBUTE = 'guest_commerce_token';

    public const HEADER = 'X-Guest-Token';

    public static function fromRequest(Request $request): ?string
    {
        $token = $request->attributes->get(self::ATTRIBUTE);

        return is_string($token) && $token !== '' ? $token : null;
    }

    public static function hash(?string $token): ?string
    {
        return $token === null ? null : hash('sha256', $token);
    }

    /**
     * Safe identifier for diagnostic logs. Never log the raw guest token.
     */
    public static function fingerprint(?string $token): ?string
    {
        $hash = self::hash($token);

        return $hash === null ? null : substr($hash, 0, 12);
    }
}
