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
        Schema::create('categories', function (Blueprint $table) {
            // 1. Identification & Hierarchy
            $table->id();
            $table->foreignId('parent_id')->nullable()->constrained('categories')->onDelete('cascade');
            $table->string('slug', 100)->unique();
            $table->string('name', 100);
            $table->string('name_en', 100)->nullable();

            // 2. Media & Display
            $table->string('image')->nullable();
            $table->string('icon')->nullable(); // Icon for display
            $table->string('banner_image')->nullable()->comment('Banner image for exposure');
            $table->text('description')->nullable();

            // 3. Exposure & Sorting
            $table->integer('sort_order')->default(0);
            $table->integer('exposure_order')->nullable()->comment('Exposure order (rank)');
            $table->dateTime('exposure_start_date')->nullable()->comment('Exposure start date');
            $table->dateTime('exposure_end_date')->nullable()->comment('Exposure end date');

            // 4. Status & Ownership
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete()->comment('Registrant');

            // 5. Timestamps & Soft Deletes
            $table->timestamps();
            $table->softDeletes();

            // 6. Indexing
            $table->index(['parent_id', 'is_active']);

            $table->index('exposure_order');
            $table->index('created_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
