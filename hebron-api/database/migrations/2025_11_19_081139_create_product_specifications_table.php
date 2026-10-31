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
        Schema::create('product_specifications', function (Blueprint $table) {
            $table->id();

            // Relationship: Link to products table (One-to-One)
            $table->foreignId('product_id')->unique()->constrained()->cascadeOnDelete();

            $table->string('size', 250)->nullable();
            $table->string('materials', 250)->nullable();
            $table->string('case', 250)->nullable();
            $table->string('product_period', 250)->nullable();
            $table->string('total_product_amount', 250)->nullable();
            $table->string('shipping_info', 250)->nullable();
            $table->string('weight', 250)->nullable();

            $table->text('notes')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_specifications');
    }
};
