<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private const DEMO_IMAGE = 'https://picsum.photos/seed/hebron-portfolio/1920/720';

    public function up(): void
    {
        if (! Schema::hasTable('pages') || ! Schema::hasTable('page_sections')) {
            return;
        }

        $portfolioPageId = $this->pageId('portfolio');

        if ($portfolioPageId !== null) {
            DB::table('pages')->where('id', $portfolioPageId)->update([
                'title' => '포트폴리오',
                'image' => self::DEMO_IMAGE,
                'updated_at' => now(),
            ]);

            DB::table('page_sections')->updateOrInsert(
                ['page_id' => $portfolioPageId, 'section_type' => 'portfolio_featured'],
                [
                    'title' => 'Featured Portfolio',
                    'content' => json_encode([]),
                    'sort_order' => 10,
                    'is_active' => true,
                    'deleted_at' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            );

            $this->updateSectionContent($portfolioPageId, 'portfolio_list', function (array $content): array {
                unset($content['items']);
                $content['list_endpoint'] = '/api/brand/portfolios';

                return $content;
            }, ['sort_order' => 20]);
        }

        $homePageId = $this->pageId('home');

        if ($homePageId !== null) {
            $this->updateSectionContent($homePageId, 'portfolio_preview', function (array $content): array {
                unset($content['portfolio_ids'], $content['items']);

                return $content;
            });
        }
    }

    public function down(): void
    {
        $pageId = $this->pageId('portfolio');

        if ($pageId === null) {
            return;
        }

        DB::table('pages')->where('id', $pageId)->update([
            'title' => 'Portfolio',
            'image' => null,
            'updated_at' => now(),
        ]);

        DB::table('page_sections')
            ->where('page_id', $pageId)
            ->where('section_type', 'portfolio_featured')
            ->delete();
    }

    private function pageId(string $slug): ?int
    {
        return DB::table('pages')
            ->where('site_type', 'BRAND_SITE')
            ->where('slug', $slug)
            ->value('id');
    }

    private function updateSectionContent(int $pageId, string $type, Closure $transform, array $extra = []): void
    {
        $section = DB::table('page_sections')
            ->where('page_id', $pageId)
            ->where('section_type', $type)
            ->first();

        if ($section === null) {
            return;
        }

        $content = json_decode($section->content ?? '[]', true);
        $content = $transform(is_array($content) ? $content : []);

        DB::table('page_sections')->where('id', $section->id)->update(array_merge([
            'content' => json_encode($content, JSON_UNESCAPED_UNICODE),
            'updated_at' => now(),
        ], $extra));
    }
};
