<?php

use App\Enums\PageType;
use App\Enums\SiteType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $pageId = DB::table('pages')
            ->where('site_type', SiteType::SHOPPING_MALL->value)
            ->where('page_type', PageType::HOME_PAGE->value)
            ->where('slug', 'home')
            ->whereNull('deleted_at')
            ->value('id');

        if ($pageId === null) {
            return;
        }

        $sections = DB::table('page_sections')
            ->where('page_id', $pageId)
            ->whereIn('section_type', ['category_product_showcase', 'steady_seller'])
            ->whereNull('deleted_at')
            ->get(['id', 'section_type', 'sort_order']);

        $categoryShowcase = $sections->firstWhere('section_type', 'category_product_showcase');
        $steadySeller = $sections->firstWhere('section_type', 'steady_seller');

        if ($categoryShowcase === null || $steadySeller === null) {
            return;
        }

        DB::transaction(function () use ($categoryShowcase, $steadySeller): void {
            DB::table('page_sections')
                ->where('id', $categoryShowcase->id)
                ->update([
                    'sort_order' => $steadySeller->sort_order,
                    'updated_at' => now(),
                ]);

            DB::table('page_sections')
                ->where('id', $steadySeller->id)
                ->update([
                    'sort_order' => $categoryShowcase->sort_order,
                    'updated_at' => now(),
                ]);
        });
    }

    public function down(): void
    {
        $this->up();
    }
};
