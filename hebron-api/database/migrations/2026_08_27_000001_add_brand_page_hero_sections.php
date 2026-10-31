<?php

use App\Services\Cache as PageCache;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private const PAGE_TYPES = ['portfolio', 'portfolio_detail', 'process', 'media', 'faqs', 'contact_us', 'production_inquiry'];

    public function up(): void
    {
        if (! Schema::hasTable('pages') || ! Schema::hasTable('page_sections')) {
            return;
        }

        $this->ensurePage('faqs', 'faqs', 'FAQs');
        $this->ensurePage('contact-us', 'contact_us', 'Contact Us');

        foreach (self::PAGE_TYPES as $pageType) {
            $pageId = $this->pageId($pageType);

            if ($pageId === null) {
                continue;
            }

            if ($pageType === 'contact_us') {
                $standardHeroExists = DB::table('page_sections')
                    ->where('page_id', $pageId)
                    ->where('section_type', 'hero_section')
                    ->exists();

                if ($standardHeroExists) {
                    DB::table('page_sections')
                        ->where('page_id', $pageId)
                        ->where('section_type', 'contact_hero')
                        ->delete();
                } else {
                    DB::table('page_sections')
                        ->where('page_id', $pageId)
                        ->where('section_type', 'contact_hero')
                        ->update([
                            'section_type' => 'hero_section',
                            'updated_at' => now(),
                        ]);
                }
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
                    'content' => json_encode(['items' => null]),
                    'sort_order' => 10,
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                continue;
            }

            $content = json_decode($hero->content ?? '[]', true);
            $content = is_array($content) ? $content : [];
            $content['items'] = null;

            DB::table('page_sections')->where('id', $hero->id)->update([
                'content' => json_encode($content, JSON_UNESCAPED_UNICODE),
                'is_active' => true,
                'deleted_at' => null,
                'updated_at' => now(),
            ]);
        }

        app(PageCache::class)->invalidate('pages');
    }

    public function down(): void
    {
        if (! Schema::hasTable('pages') || ! Schema::hasTable('page_sections')) {
            return;
        }

        foreach (self::PAGE_TYPES as $pageType) {
            $pageId = $this->pageId($pageType);

            if ($pageId === null) {
                continue;
            }

            if ($pageType === 'contact_us') {
                DB::table('page_sections')
                    ->where('page_id', $pageId)
                    ->where('section_type', 'hero_section')
                    ->update([
                        'section_type' => 'contact_hero',
                        'updated_at' => now(),
                    ]);

                continue;
            }

            DB::table('page_sections')
                ->where('page_id', $pageId)
                ->where('section_type', 'hero_section')
                ->delete();
        }

        $faqsPageId = $this->pageId('faqs');
        if ($faqsPageId !== null) {
            DB::table('pages')->where('id', $faqsPageId)->delete();
        }

        app(PageCache::class)->invalidate('pages');
    }

    private function ensurePage(string $slug, string $pageType, string $title): void
    {
        if ($this->pageId($pageType) !== null) {
            return;
        }

        DB::table('pages')->insert([
            'site_type' => 'BRAND_SITE',
            'page_type' => $pageType,
            'slug' => $slug,
            'title' => $title,
            'sort_order' => ((int) DB::table('pages')->where('site_type', 'BRAND_SITE')->max('sort_order')) + 1,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    private function pageId(string $pageType): ?int
    {
        $id = DB::table('pages')
            ->where('site_type', 'BRAND_SITE')
            ->where('page_type', $pageType)
            ->value('id');

        return $id === null ? null : (int) $id;
    }
};
