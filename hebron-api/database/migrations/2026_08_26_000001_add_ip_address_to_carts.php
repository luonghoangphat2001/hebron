<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('carts', function (Blueprint $table) {
            $table->string('ip_address', 45)->nullable()->after('guest_token_hash');
            $table->dropUnique(['guest_token_hash']);
            $table->unique(['guest_token_hash', 'ip_address'], 'carts_guest_identity_unique');
        });
    }

    public function down(): void
    {
        Schema::table('carts', function (Blueprint $table) {
            $table->dropUnique('carts_guest_identity_unique');
            $table->unique('guest_token_hash');
            $table->dropColumn('ip_address');
        });
    }
};
