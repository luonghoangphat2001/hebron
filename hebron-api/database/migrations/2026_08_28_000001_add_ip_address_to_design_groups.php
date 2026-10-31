<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('design_groups', function (Blueprint $table) {
            $table->string('ip_address', 45)->nullable()->after('guest_token_hash');
            $table->index(['guest_token_hash', 'ip_address'], 'design_groups_guest_identity_index');
        });
    }

    public function down(): void
    {
        Schema::table('design_groups', function (Blueprint $table) {
            $table->dropIndex('design_groups_guest_identity_index');
            $table->dropColumn('ip_address');
        });
    }
};
