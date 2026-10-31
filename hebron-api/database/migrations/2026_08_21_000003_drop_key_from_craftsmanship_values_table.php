<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('craftsmanship_values', function (Blueprint $table): void {
            $table->dropUnique(['key']);
            $table->dropColumn('key');
        });
    }

    public function down(): void
    {
        Schema::table('craftsmanship_values', function (Blueprint $table): void {
            $table->string('key', 100)->nullable()->unique()->after('id');
        });
    }
};
