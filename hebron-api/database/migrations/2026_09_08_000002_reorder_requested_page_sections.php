<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /** @var array<string, array<int, string>> */
    private const REQUIRED_ORDER = [
        'SHOPPING_MALL|home_page|home' => [
            'hero_section',
            'category_shortcuts',
            'product_preview',
            'notices_preview',
            'steady_seller',
            'category_product_showcase',
            'faq_section',
            'customer_center',
        ],
        'BRAND_SITE|home_page|home' => [
            'hero_section',
            'client_logos',
            'brand_statement',
            'craftsmanship_values',
            'custom_process',
            'press_preview',
            'manufacturing_process',
            'portfolio_preview',
            'about_cta',
        ],
        'BRAND_SITE|brand_story|brand-story' => [
            'hero_section',
            'certificates',
            'brand_identity',
            'company_history',
        ],
        'BRAND_SITE|process|process' => [
            'hero_section',
            'process_steps',
            'about_cta',
        ],
        'BRAND_SITE|contact_us|contact_us' => [
            'hero_section',
            'contact_information',
            'about_cta',
        ],
        'BRAND_SITE|production_inquiry|production-inquiry' => [
            'hero_section',
            'inquiry_form',
            'about_cta',
        ],
        'PLAIN_SITE|home_page|home' => [
            'hero_section',
        ],
    ];

    public function up(): void
    {
        foreach (self::REQUIRED_ORDER as $pageKey => $requiredOrder) {
            [$siteType, $pageType, $slug] = explode('|', $pageKey);

            $pageId = DB::table('pages')
                ->where('site_type', $siteType)
                ->where('page_type', $pageType)
                ->where('slug', $slug)
                ->whereNull('deleted_at')
                ->value('id');

            if ($pageId === null) {
                continue;
            }

            $sections = DB::table('page_sections')
                ->where('page_id', $pageId)
                ->whereNull('deleted_at')
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get();

            $ordered = collect();

            foreach ($requiredOrder as $sectionType) {
                $section = $sections->firstWhere('section_type', $sectionType);

                if ($section !== null) {
                    $ordered->push($section);
                }
            }

            $remaining = $sections->reject(
                fn (object $section): bool => $ordered->contains('id', $section->id),
            );

            $this->applyOrder($ordered->concat($remaining));
        }
    }

    public function down(): void
    {
        // The previous sort_order values are data-specific and cannot be restored safely.
    }

    private function applyOrder(Collection $sections): void
    {
        foreach ($sections->values() as $index => $section) {
            DB::table('page_sections')
                ->where('id', $section->id)
                ->update([
                    'sort_order' => ($index + 1) * 10,
                    'updated_at' => now(),
                ]);
        }
    }
};
