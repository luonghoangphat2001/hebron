<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->unsignedBigInteger('legacy_category_id')
                ->nullable()
                ->after('id')
                ->comment('Cafe24 / legacy system category id');
            $table->index('legacy_category_id');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->unsignedBigInteger('legacy_product_id')
                ->nullable()
                ->after('id')
                ->comment('Cafe24 / legacy system product id');
            $table->string('legacy_product_code', 100)
                ->nullable()
                ->after('legacy_product_id')
                ->comment('Cafe24 / legacy system product code');
            $table->index('legacy_product_id');
            $table->index('legacy_product_code');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['legacy_product_id']);
            $table->dropIndex(['legacy_product_code']);
            $table->dropColumn(['legacy_product_id', 'legacy_product_code']);
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->dropIndex(['legacy_category_id']);
            $table->dropColumn('legacy_category_id');
        });
    }
};
