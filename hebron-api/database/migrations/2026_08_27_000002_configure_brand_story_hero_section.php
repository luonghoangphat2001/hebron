<?php

use App\Services\Cache as PageCache;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('pages') || ! Schema::hasTable('page_sections')) {
            return;
        }

        $pageId = DB::table('pages')
            ->where('site_type', 'BRAND_SITE')
            ->where('page_type', 'brand_story')
            ->value('id');

        if ($pageId === null) {
            return;
        }

        $hero = DB::table('page_sections')
            ->where('page_id', $pageId)
            ->where('section_type', 'hero_section')
            ->orderByDesc('id')
            ->first();

        if ($hero === null) {
            DB::table('page_sections')
                ->where('page_id', $pageId)
                ->whereNull('deleted_at')
                ->increment('sort_order', 10, ['updated_at' => now()]);

            DB::table('page_sections')->insert([
                'page_id' => $pageId,
                'section_type' => 'hero_section',
                'title' => 'Hero',
                'content' => json_encode(['items' => []]),
                'sort_order' => 10,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            app(PageCache::class)->invalidate('pages');

            return;
        }

        $content = json_decode($hero->content ?? '[]', true);
        $content = is_array($content) ? $content : [];
        $content['items'] = is_array($content['items'] ?? null) ? $content['items'] : [];

        DB::table('page_sections')->where('id', $hero->id)->update([
            'content' => json_encode($content, JSON_UNESCAPED_UNICODE),
            'is_active' => true,
            'deleted_at' => null,
            'updated_at' => now(),
        ]);

        app(PageCache::class)->invalidate('pages');
    }

    public function down(): void
    {
        // Keep manually managed hero items intact on rollback.
    }
};
