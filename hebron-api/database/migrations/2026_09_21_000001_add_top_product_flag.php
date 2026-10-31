<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('products', 'is_top_product')) {
            Schema::table('products', function (Blueprint $table): void {
                $table->boolean('is_top_product')->default(false)->after('is_featured');
                $table->index(['is_top_product', 'is_active']);
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('products', 'is_top_product')) {
            Schema::table('products', function (Blueprint $table): void {
                $table->dropIndex(['is_top_product', 'is_active']);
                $table->dropColumn('is_top_product');
            });
        }
    }
};
