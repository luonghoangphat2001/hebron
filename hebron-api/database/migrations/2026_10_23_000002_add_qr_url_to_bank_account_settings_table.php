<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bank_account_settings', function (Blueprint $table): void {
            $table->string('qr_url', 500)->nullable()->after('account_holder');
        });
    }

    public function down(): void
    {
        Schema::table('bank_account_settings', function (Blueprint $table): void {
            $table->dropColumn('qr_url');
        });
    }
};
