<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('products', 'file_ai')) {
            Schema::table('products', function (Blueprint $table): void {
                $table->json('file_ai')->nullable()->after('images');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('products', 'file_ai')) {
            Schema::table('products', function (Blueprint $table): void {
                $table->dropColumn('file_ai');
            });
        }
    }
};
