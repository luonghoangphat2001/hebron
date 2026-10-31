<?php

namespace Database\Seeders;

use App\Enums\SiteType;
use App\Models\Page;
use Illuminate\Database\Seeder;

class ShoppingMallHomeSectionSeeder extends Seeder
{
    public function run(): void
    {
        self::seed();
    }

    public static function seed(): void
    {
        $page = Page::query()
            ->where('site_type', SiteType::SHOPPING_MALL->value)
            ->where('page_type', 'home_page')
            ->where('slug', 'home')
            ->first();

        if ($page === null) {
            return;
        }

        foreach ([
            ['secondary_banner', 'Secondary Banner', ['items' => [
                ['name' => 'Secondary Banner 01', 'image' => 'https://picsum.photos/seed/hebron-secondary-banner-01/1600/500'],
                ['name' => 'Secondary Banner 02', 'image' => 'https://picsum.photos/seed/hebron-secondary-banner-02/1600/500'],
            ]], 40, null],
            ['steady_seller', 'Steady Seller', ['limit' => 6, 'items' => []], 50, '/mall/products'],
            ['footer_quick_links', 'Footer Quick Links', ['items' => [
                ['field_name' => 'order_method', 'image' => 'https://picsum.photos/seed/hebron-order-method/800/500'],
                ['field_name' => 'order_shipping', 'image' => 'https://picsum.photos/seed/hebron-order-shipping/800/500'],
                ['field_name' => 'one_to_one_inquiry', 'image' => 'https://picsum.photos/seed/hebron-one-to-one-inquiry/800/500'],
            ]], 90, null],
        ] as [$type, $title, $content, $sortOrder, $link]) {
            $page->sections()->firstOrCreate(
                ['section_type' => $type],
                [
                    'title' => $title,
                    'content' => $content,
                    'sort_order' => $sortOrder,
                    'link' => $link,
                    'is_active' => true,
                ],
            );
        }
    }
}
