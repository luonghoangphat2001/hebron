<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_design_contents', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('id')->constrained()->nullOnDelete();
            $table->string('guest_token_hash', 64)->nullable()->after('user_id');
            $table->string('ip_address', 45)->nullable()->after('guest_token_hash');
            $table->index(['guest_token_hash', 'ip_address'], 'order_design_contents_guest_identity_index');
        });
    }

    public function down(): void
    {
        Schema::table('order_design_contents', function (Blueprint $table) {
            $table->dropIndex('order_design_contents_guest_identity_index');
            $table->dropConstrainedForeignId('user_id');
            $table->dropColumn(['guest_token_hash', 'ip_address']);
        });
    }
};
