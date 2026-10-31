<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Database\Seeders\HomeSectionSeeder;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasTable('home_sections')) {
            Schema::create('home_sections', function (Blueprint $table) {
                $table->id();
                $table->string('site_type', 50)->default('BRAND_SITE');
                $table->string('type', 50);
                $table->string('title', 255)->nullable();
                $table->string('subtitle', 255)->nullable();
                $table->json('content')->nullable();
                $table->string('image', 500)->nullable();
                $table->string('link', 500)->nullable();
                $table->unsignedInteger('sort_order')->default(0);
                $table->boolean('is_active')->default(true);
                $table->timestamp('starts_at')->nullable();
                $table->timestamp('ends_at')->nullable();
                $table->json('metadata')->nullable();
                $table->timestamps();
                $table->softDeletes();

                $table->unique(['site_type', 'type']);
                $table->index(['site_type', 'type', 'is_active']);
                $table->index('sort_order');
                $table->index(['starts_at', 'ends_at']);
            });
        } elseif (! Schema::hasColumn('home_sections', 'site_type')) {
            Schema::table('home_sections', function (Blueprint $table) {
                $table->string('site_type', 50)->default('BRAND_SITE')->after('id');
                $table->index(['site_type', 'type', 'is_active']);
            });
        }

        HomeSectionSeeder::seed();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('home_sections');
    }

};
