<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('design_groups', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->change();
            $table->string('guest_token_hash', 64)->nullable()->index()->after('user_id');
        });
    }

    public function down(): void
    {
        Schema::table('design_groups', function (Blueprint $table) {
            $table->dropColumn('guest_token_hash');
            $table->foreignId('user_id')->nullable(false)->change();
        });
    }
};
