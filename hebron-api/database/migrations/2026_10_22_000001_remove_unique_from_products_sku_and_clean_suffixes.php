<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropUnique(['sku']);
            $table->index('sku');
        });

        // Strip _1, _2, etc. suffixes appended due to legacy unique constraint
        DB::table('products')
            ->whereNotNull('sku')
            ->where('sku', 'like', '%\_%')
            ->orderBy('id')
            ->chunk(100, function ($products) {
                foreach ($products as $product) {
                    if (preg_match('/_[0-9]+$/', $product->sku)) {
                        $cleanSku = preg_replace('/_[0-9]+$/', '', $product->sku);
                        DB::table('products')
                            ->where('id', $product->id)
                            ->update(['sku' => $cleanSku]);
                    }
                }
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['sku']);
            $table->unique('sku');
        });
    }
};

