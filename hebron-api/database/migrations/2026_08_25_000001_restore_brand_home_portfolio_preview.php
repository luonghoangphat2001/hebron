<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $this->convertBrandHomeSection('notices_preview', 'portfolio_preview', true);
    }

    public function down(): void
    {
        $this->convertBrandHomeSection('portfolio_preview', 'notices_preview', false);
    }

    private function convertBrandHomeSection(string $from, string $to, bool $toPortfolio): void
    {
        if (! Schema::hasTable('pages') || ! Schema::hasTable('page_sections')) {
            return;
        }

        $sections = DB::table('page_sections')
            ->join('pages', 'pages.id', '=', 'page_sections.page_id')
            ->where('pages.site_type', 'BRAND_SITE')
            ->where('pages.page_type', 'home_page')
            ->where('page_sections.section_type', $from)
            ->select(['page_sections.id', 'page_sections.title', 'page_sections.content'])
            ->get();

        foreach ($sections as $section) {
            $content = json_decode($section->content ?? '[]', true);
            $content = is_array($content) ? $content : [];
            unset($content['items'], $content[$toPortfolio ? 'notice_ids' : 'portfolio_ids']);
            $content['view_all_link'] = $toPortfolio ? '/portfolio' : '/notices';

            $title = $section->title;
            if ($toPortfolio && $title === 'Notices Preview') {
                $title = 'Portfolio Preview';
            } elseif (! $toPortfolio && $title === 'Portfolio Preview') {
                $title = 'Notices Preview';
            }

            DB::table('page_sections')->where('id', $section->id)->update([
                'section_type' => $to,
                'title' => $title,
                'content' => json_encode($content, JSON_UNESCAPED_UNICODE),
                'link' => $toPortfolio ? '/portfolio' : '/notices',
                'updated_at' => now(),
            ]);
        }
    }
};
