<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('category_product', function (Blueprint $table) {
            $table->id();

            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('category_id')->constrained()->onDelete('cascade');

            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_primary')->default(false);
            $table->boolean('recommend')->default(false);
            $table->boolean('new')->default(false);

            $table->timestamps();
            $table->timestamp('deleted_at')->nullable();

            $table->unique(['product_id', 'category_id']);
            $table->index(['product_id', 'sort_order']);
            $table->index(['category_id', 'is_primary']);
            $table->index(['category_id', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('category_product');
    }
};
