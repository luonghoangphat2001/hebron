<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /** @var array<string, int> */
    private const ORDER = [
        'hero_section' => 10,
        'client_logos' => 20,
        'brand_statement' => 30,
        'craftsmanship_values' => 40,
        'custom_process' => 50,
        'press_preview' => 60,
        'manufacturing_process' => 70,
        'portfolio_preview' => 80,
        'about_cta' => 90,
    ];

    public function up(): void
    {
        $pageId = DB::table('pages')
            ->where('site_type', 'BRAND_SITE')
            ->where('page_type', 'home_page')
            ->where('slug', 'home')
            ->whereNull('deleted_at')
            ->value('id');

        if ($pageId === null) {
            return;
        }

        foreach (self::ORDER as $sectionType => $sortOrder) {
            DB::table('page_sections')
                ->where('page_id', $pageId)
                ->where('section_type', $sectionType)
                ->whereNull('deleted_at')
                ->update([
                    'sort_order' => $sortOrder,
                    'updated_at' => now(),
                ]);
        }
    }

    public function down(): void
    {
        // The previous sort_order values are data-specific and cannot be restored safely.
    }
};
