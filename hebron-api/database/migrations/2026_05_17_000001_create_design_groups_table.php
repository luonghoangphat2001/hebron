<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('design_groups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();

            $table->string('title');

            // Content & Editor Data
            $table->json('layout_data')->nullable()->comment('Web editor serialized layout data (JSON)');
            $table->string('layout_s3_path')->nullable()->comment('S3 path for KonvaJS layout JSON/SVG file');

            // Assets & Previews
            $table->string('logo_path')->nullable()->comment('Path to uploaded logo file');
            $table->string('preview_image_path')->nullable()->comment('Rendered preview thumbnail path');
            $table->json('metadata')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('design_groups');
    }
};