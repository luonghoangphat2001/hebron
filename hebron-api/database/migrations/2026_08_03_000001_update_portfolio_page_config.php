<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $pageId = DB::table('pages')
            ->where('site_type', 'BRAND_SITE')
            ->where('slug', 'portfolio')
            ->value('id');

        if ($pageId === null) {
            return;
        }

        DB::table('page_sections')
            ->where('page_id', $pageId)
            ->where('section_type', 'portfolio_list')
            ->update([
                'content' => json_encode([
                    'view_modes' => ['grid', 'list'],
                    'filters' => ['all', 'major_project'],
                    'badges' => ['new', 'featured'],
                    'source' => 'portfolio_api',
                    'list_endpoint' => '/api/brand/portfolios',
                    'detail_endpoint' => '/api/brand/portfolios/{id}',
                    'item_fields' => [
                        'id',
                        'title',
                        'category',
                        'year',
                        'cover_image',
                        'is_featured',
                    ],
                ], JSON_UNESCAPED_UNICODE),
                'updated_at' => now(),
            ]);

        $detailPageId = DB::table('pages')
            ->where('site_type', 'BRAND_SITE')
            ->where('slug', 'portfolio-detail')
            ->value('id');

        if ($detailPageId === null) {
            return;
        }

        DB::table('page_sections')
            ->where('page_id', $detailPageId)
            ->where('section_type', 'project_overview')
            ->update([
                'content' => json_encode([
                    'fields' => ['title', 'client', 'category', 'year', 'description'],
                    'gallery' => true,
                    'display' => 'overlay_or_page',
                    'source' => 'portfolio_api',
                    'detail_endpoint' => '/api/brand/portfolios/{id}',
                ], JSON_UNESCAPED_UNICODE),
                'updated_at' => now(),
            ]);
    }

    public function down(): void
    {
        // The previous page configuration was seed data and is intentionally not restored.
    }
};
