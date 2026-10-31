<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->index(
                ['is_active', 'deleted_at', 'sort_order', 'id'],
                'products_listing_status_sort_index'
            );
        });

        Schema::table('category_product', function (Blueprint $table) {
            $table->index(
                ['category_id', 'deleted_at', 'product_id'],
                'category_product_listing_filter_index'
            );
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex('products_listing_status_sort_index');
        });

        Schema::table('category_product', function (Blueprint $table) {
            $table->dropIndex('category_product_listing_filter_index');
        });
    }
};
