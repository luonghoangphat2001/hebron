<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('templates', function (Blueprint $table) {
            if (! Schema::hasColumn('templates', 'front_preview_url')) {
                $table->string('front_preview_url', 500)->nullable()->after('preview_images');
            }

            if (! Schema::hasColumn('templates', 'back_preview_url')) {
                $table->string('back_preview_url', 500)->nullable()->after('front_preview_url');
            }
        });
    }

    public function down(): void
    {
        Schema::table('templates', function (Blueprint $table) {
            if (Schema::hasColumn('templates', 'back_preview_url')) {
                $table->dropColumn('back_preview_url');
            }

            if (Schema::hasColumn('templates', 'front_preview_url')) {
                $table->dropColumn('front_preview_url');
            }
        });
    }
};
