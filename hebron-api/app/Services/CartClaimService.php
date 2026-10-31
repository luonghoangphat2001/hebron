<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\DesignGroup;
use App\Models\OrderDesignContent;
use App\Models\User;
use App\Support\GuestCommerceToken;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CartClaimService
{
    public function claim(User $user, ?string $guestToken): void
    {
        if (! is_string($guestToken) || ! preg_match('/^[A-Za-z0-9_-]{32,255}$/', $guestToken)) {
            Log::channel('daily')->warning('Commerce guest claim skipped: missing guest token', [
                'event' => 'commerce_claim.skipped',
                'user_id' => $user->id,
                'guest_token_present' => is_string($guestToken) && $guestToken !== '',
            ]);

            return;
        }

        $guestTokenHash = GuestCommerceToken::hash($guestToken);
        $tokenFingerprint = GuestCommerceToken::fingerprint($guestToken);

        $result = DB::transaction(function () use ($user, $guestTokenHash): array {
            $guestDesignGroupIds = DesignGroup::query()
                ->whereNull('user_id')
                ->where('guest_token_hash', $guestTokenHash)
                ->lockForUpdate()
                ->pluck('id');

            $guestDesignContentIds = OrderDesignContent::query()
                ->whereNull('user_id')
                ->where('guest_token_hash', $guestTokenHash)
                ->lockForUpdate()
                ->pluck('id');

            // Merge legacy duplicate carts that may have been created before
            // the guest token became the sole identity.
            $guestCarts = Cart::query()
                ->whereNull('user_id')
                ->where('guest_token_hash', $guestTokenHash)
                ->lockForUpdate()
                ->get();

            if ($guestDesignGroupIds->isNotEmpty()) {
                DesignGroup::query()
                    ->whereIn('id', $guestDesignGroupIds)
                    ->update([
                        'user_id' => $user->id,
                        'guest_token_hash' => null,
                    ]);
            }

            if ($guestDesignContentIds->isNotEmpty()) {
                OrderDesignContent::query()
                    ->whereIn('id', $guestDesignContentIds)
                    ->update([
                        'user_id' => $user->id,
                        'guest_token_hash' => null,
                    ]);
            }

            if ($guestCarts->isEmpty()) {
                return [
                    'design_group_ids' => $guestDesignGroupIds->values()->all(),
                    'design_content_ids' => $guestDesignContentIds->values()->all(),
                    'cart_action' => 'none',
                    'guest_cart_ids' => [],
                    'user_cart_id' => null,
                ];
            }

            $userCart = Cart::query()->where('user_id', $user->id)->lockForUpdate()->first();
            $guestCartIds = $guestCarts->pluck('id')->values()->all();

            if ($userCart) {
                foreach ($guestCarts as $guestCart) {
                    $guestCart->items()->update(['cart_id' => $userCart->id]);
                    $guestCart->delete();
                }

                return [
                    'design_group_ids' => $guestDesignGroupIds->values()->all(),
                    'design_content_ids' => $guestDesignContentIds->values()->all(),
                    'cart_action' => 'merged',
                    'guest_cart_ids' => $guestCartIds,
                    'user_cart_id' => $userCart->id,
                ];
            }

            $userCart = $guestCarts->shift();
            $userCart->update([
                'user_id' => $user->id,
                'guest_token_hash' => null,
            ]);

            foreach ($guestCarts as $guestCart) {
                $guestCart->items()->update(['cart_id' => $userCart->id]);
                $guestCart->delete();
            }

            return [
                'design_group_ids' => $guestDesignGroupIds->values()->all(),
                'design_content_ids' => $guestDesignContentIds->values()->all(),
                'cart_action' => 'claimed',
                'guest_cart_ids' => $guestCartIds,
                'user_cart_id' => $userCart->id,
            ];
        });

        Log::channel('daily')->info('Commerce guest identity claim completed', [
            'event' => 'commerce_claim.completed',
            'user_id' => $user->id,
            'guest_token_fingerprint' => $tokenFingerprint,
            'claimed_design_group_ids' => $result['design_group_ids'],
            'claimed_design_content_ids' => $result['design_content_ids'],
            'cart_action' => $result['cart_action'],
            'guest_cart_ids' => $result['guest_cart_ids'],
            'user_cart_id' => $result['user_cart_id'],
        ]);
    }
}
