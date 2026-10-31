<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('page_sections')) {
            DB::table('page_sections')
                ->where('section_type', 'popular_categories')
                ->update(['section_type' => 'category_product_showcase']);
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('page_sections')) {
            DB::table('page_sections')
                ->where('section_type', 'category_product_showcase')
                ->update(['section_type' => 'popular_categories']);
        }
    }
};
