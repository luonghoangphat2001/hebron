<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $duplicateGuestTokens = DB::table('carts')
            ->select('guest_token_hash')
            ->whereNotNull('guest_token_hash')
            ->groupBy('guest_token_hash')
            ->havingRaw('COUNT(*) > 1')
            ->pluck('guest_token_hash');

        foreach ($duplicateGuestTokens as $guestTokenHash) {
            DB::transaction(function () use ($guestTokenHash): void {
                $cartIds = DB::table('carts')
                    ->where('guest_token_hash', $guestTokenHash)
                    ->orderByDesc('updated_at')
                    ->orderByDesc('id')
                    ->lockForUpdate()
                    ->pluck('id');

                $primaryCartId = $cartIds->shift();
                if ($primaryCartId === null || $cartIds->isEmpty()) {
                    return;
                }

                DB::table('cart_items')
                    ->whereIn('cart_id', $cartIds)
                    ->update([
                        'cart_id' => $primaryCartId,
                        'updated_at' => now(),
                    ]);

                DB::table('carts')->whereIn('id', $cartIds)->delete();
            });
        }

        if (Schema::hasIndex('carts', 'carts_guest_identity_unique', 'unique')) {
            Schema::table('carts', function (Blueprint $table) {
                $table->dropUnique('carts_guest_identity_unique');
            });
        }

        if (! Schema::hasIndex('carts', ['guest_token_hash'], 'unique')) {
            Schema::table('carts', function (Blueprint $table) {
                $table->unique('guest_token_hash');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasIndex('carts', ['guest_token_hash'], 'unique')) {
            Schema::table('carts', function (Blueprint $table) {
                $table->dropUnique(['guest_token_hash']);
            });
        }

        if (! Schema::hasIndex('carts', 'carts_guest_identity_unique', 'unique')) {
            Schema::table('carts', function (Blueprint $table) {
                $table->unique(['guest_token_hash', 'ip_address'], 'carts_guest_identity_unique');
            });
        }
    }
};
