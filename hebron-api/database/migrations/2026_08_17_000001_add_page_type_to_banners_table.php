<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('banners', function (Blueprint $table) {
            $table->string('page_type', 80)->default('home_page')->after('site_type');
            $table->index(['site_type', 'page_type', 'exposure_location', 'is_active'], 'banners_page_scope_index');
        });
    }

    public function down(): void
    {
        Schema::table('banners', function (Blueprint $table) {
            $table->dropIndex('banners_page_scope_index');
            $table->dropColumn('page_type');
        });
    }
};
