<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $now = now();
        $pages = DB::table('pages')
            ->where('site_type', 'BRAND_SITE')
            ->whereIn('slug', ['portfolio', 'faqs'])
            ->whereNull('deleted_at')
            ->get(['id']);

        foreach ($pages as $page) {
            if (DB::table('page_sections')
                ->where('page_id', $page->id)
                ->where('section_type', 'about_cta')
                ->whereNull('deleted_at')
                ->exists()) {
                continue;
            }

            DB::table('page_sections')->insert([
                'page_id' => $page->id,
                'section_type' => 'about_cta',
                'sort_order' => ((int) DB::table('page_sections')
                    ->where('page_id', $page->id)
                    ->whereNull('deleted_at')
                    ->max('sort_order')) + 10,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }

    public function down(): void
    {
        $pageIds = DB::table('pages')
            ->where('site_type', 'BRAND_SITE')
            ->whereIn('slug', ['portfolio', 'faqs'])
            ->pluck('id');

        DB::table('page_sections')
            ->whereIn('page_id', $pageIds)
            ->where('section_type', 'about_cta')
            ->delete();
    }
};
