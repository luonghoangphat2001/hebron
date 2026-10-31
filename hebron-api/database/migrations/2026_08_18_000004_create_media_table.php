<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('media', function (Blueprint $table) {
            $table->id();
            $table->string('site_type', 50)->default('BRAND_SITE');
            $table->unsignedBigInteger('category_id')->nullable();
            $table->string('title', 255);
            $table->text('description')->nullable();
            $table->string('file_path', 500)->nullable();
            $table->string('thumbnail_path', 500)->nullable();
            $table->string('url', 500)->nullable();
            $table->string('link_url', 500)->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['site_type', 'category_id', 'is_active', 'sort_order'], 'media_public_scope_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('media');
    }
};
