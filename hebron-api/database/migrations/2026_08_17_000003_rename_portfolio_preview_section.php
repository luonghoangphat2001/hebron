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
                ->where('section_type', 'portfolio_preview')
                ->update([
                    'section_type' => 'notices_preview',
                    'title' => DB::raw("CASE WHEN title = 'Portfolio Preview' THEN 'Notices Preview' ELSE title END"),
                ]);
        }

        if (Schema::hasTable('home_sections')) {
            DB::table('home_sections')
                ->where('type', 'portfolio_preview')
                ->update([
                    'type' => 'notices_preview',
                    'title' => DB::raw("CASE WHEN title LIKE '%Portfolio%' THEN REPLACE(title, 'Portfolio', 'Notices') ELSE title END"),
                    'link' => DB::raw("CASE WHEN link LIKE '%/portfolio%' THEN REPLACE(link, '/portfolio', '/notices') ELSE link END"),
                ]);
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('page_sections')) {
            DB::table('page_sections')
                ->where('section_type', 'notices_preview')
                ->update([
                    'section_type' => 'portfolio_preview',
                    'title' => DB::raw("CASE WHEN title = 'Notices Preview' THEN 'Portfolio Preview' ELSE title END"),
                ]);
        }

        if (Schema::hasTable('home_sections')) {
            DB::table('home_sections')
                ->where('type', 'notices_preview')
                ->update([
                    'type' => 'portfolio_preview',
                    'title' => DB::raw("CASE WHEN title LIKE '%Notices%' THEN REPLACE(title, 'Notices', 'Portfolio') ELSE title END"),
                    'link' => DB::raw("CASE WHEN link LIKE '%/notices%' THEN REPLACE(link, '/notices', '/portfolio') ELSE link END"),
                ]);
        }
    }
};
