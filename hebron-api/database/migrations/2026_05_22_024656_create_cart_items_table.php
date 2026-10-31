<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Create cart_items with the correct column types from the start
        Schema::create('cart_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cart_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('design_group_id')
                ->nullable()
                ->constrained('design_groups')
                ->nullOnDelete();

            $table->integer('quantity')->default(1);
            $table->integer('original_price');
            $table->integer('sale_price');
            $table->json('selected_options')->nullable()->comment('Product options/configuration');
            $table->integer('option_price');

            $table->timestamp('storage_date')
                ->nullable()
                ->comment('Cart item preview/storage expiration date');

            $table->timestamps();

            // Indexes
            $table->index('cart_id');
            $table->index('product_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cart_items');
    }
};
