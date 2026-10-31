<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $this->retireSections('BRAND_SITE', 'process', [
            'production_video',
            'equipment_gallery',
            'quality_control',
        ]);

        $this->retireSections('SHOPPING_MALL', 'home_page', [
            'client_logos',
        ]);
    }

    public function down(): void
    {
        $this->restoreSections('BRAND_SITE', 'process', [
            'production_video',
            'equipment_gallery',
            'quality_control',
        ]);

        $this->restoreSections('SHOPPING_MALL', 'home_page', [
            'client_logos',
        ]);
    }

    /** @param array<int, string> $sectionTypes */
    private function retireSections(string $siteType, string $pageType, array $sectionTypes): void
    {
        DB::table('page_sections')
            ->join('pages', 'pages.id', '=', 'page_sections.page_id')
            ->where('pages.site_type', $siteType)
            ->where('pages.page_type', $pageType)
            ->whereIn('page_sections.section_type', $sectionTypes)
            ->whereNull('page_sections.deleted_at')
            ->update(['page_sections.deleted_at' => now(), 'page_sections.updated_at' => now()]);
    }

    /** @param array<int, string> $sectionTypes */
    private function restoreSections(string $siteType, string $pageType, array $sectionTypes): void
    {
        DB::table('page_sections')
            ->join('pages', 'pages.id', '=', 'page_sections.page_id')
            ->where('pages.site_type', $siteType)
            ->where('pages.page_type', $pageType)
            ->whereIn('page_sections.section_type', $sectionTypes)
            ->update(['page_sections.deleted_at' => null, 'page_sections.updated_at' => now()]);
    }
};
