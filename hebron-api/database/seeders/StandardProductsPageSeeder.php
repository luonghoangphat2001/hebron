<?php

namespace Database\Seeders;

use App\Enums\PageType;
use App\Enums\SectionType;
use App\Enums\SiteType;
use App\Models\Page;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class StandardProductsPageSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            $page = Page::query()->updateOrCreate(
                [
                    'site_type' => SiteType::BRAND_SITE->value,
                    'slug' => 'products-standard',
                ],
                [
                    'page_type' => PageType::STANDARD_PRODUCTS->value,
                    'title' => 'Standard Products',
                    'sort_order' => 0,
                    'is_active' => true,
                ],
            );

            $sections = [
                SectionType::HERO_SECTION->value => [
                    'title' => 'Hero',
                    'content' => ['items' => null],
                    'link' => null,
                    'sort_order' => 10,
                ],
                SectionType::PRODUCT_LIST->value => [
                    'title' => 'Standard Products',
                    'content' => [
                        'category_endpoint' => '/api/categories',
                        'product_endpoint' => '/api/brand/products',
                        'category_product_endpoint' => '/api/categories/{slug}/products',
                    ],
                    'link' => '/products',
                    'sort_order' => 20,
                ],
                SectionType::ABOUT_CTA->value => [
                    'title' => '제작 문의',
                    'content' => null,
                    'link' => '/inquiry',
                    'sort_order' => 30,
                ],
            ];

            $page->sections()
                ->whereNotIn('section_type', array_keys($sections))
                ->delete();

            foreach ($sections as $sectionType => $attributes) {
                $page->sections()->updateOrCreate(
                    ['section_type' => $sectionType],
                    [
                        ...$attributes,
                        'is_active' => true,
                    ],
                );
            }
        });
    }
}
