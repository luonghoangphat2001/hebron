<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('page_sections')
            ->join('pages', 'pages.id', '=', 'page_sections.page_id')
            ->where('pages.site_type', 'BRAND_SITE')
            ->where('pages.page_type', 'media')
            ->whereIn('page_sections.section_type', ['brand_videos', 'sns_links'])
            ->whereNull('page_sections.deleted_at')
            ->update([
                'page_sections.deleted_at' => now(),
                'page_sections.updated_at' => now(),
            ]);
    }

    public function down(): void
    {
        DB::table('page_sections')
            ->join('pages', 'pages.id', '=', 'page_sections.page_id')
            ->where('pages.site_type', 'BRAND_SITE')
            ->where('pages.page_type', 'media')
            ->whereIn('page_sections.section_type', ['brand_videos', 'sns_links'])
            ->update([
                'page_sections.deleted_at' => null,
                'page_sections.updated_at' => now(),
            ]);
    }
};
