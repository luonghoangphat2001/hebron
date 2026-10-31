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
        Schema::create('templates', function (Blueprint $table) {
            // 1. Identification & Relationships
            $table->id();
            $table->string('name', 255)->comment('Template name');
            $table->foreignId('product_id')->nullable()->constrained('products')->nullOnDelete()->comment('Associated product link');

            // 2. Production Files & Specifications
            $table->json('specifications')->nullable()->comment('Detailed template specifications in JSON format');

            // 3. Technical Print Settings (Lines & Colors)
            $table->json('font_set')->nullable()->comment('Predefined font configurations');
            $table->json('color_set')->nullable()->comment('Predefined color palette');
            $table->json('spot_color')->nullable()->comment('Spot color/Special ink settings');

            // 4. Editor Configuration
            $table->json('layout_config')->nullable()->comment('Field mapping for Simple Text and Web Editors');
            $table->json('editor_permission')->nullable()->comment('Permission settings for template editing');

            // 5. Previews & Media
            $table->json('preview_images')->nullable()->comment('Additional gallery of preview images');

            // 6. Status & Ownership
            $table->boolean('is_active')->default(true)->comment('Active status for visibility');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete()->comment('Administrator who created this template');

            // 7. System Timestamps
            $table->timestamps();
            $table->softDeletes();

            // 8. Query Optimization (Indexes)
            $table->index(['product_id', 'is_active']);
            $table->index('is_active');
            $table->index('created_by');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('templates');
    }
};
