<?php

namespace Database\Seeders;

use App\Models\Banner;
use App\Enums\SiteType;
use Illuminate\Database\Seeder;

class BannerSeeder extends Seeder
{
    public function run(): void
    {
        self::seedShoppingMallUtilityBanners();
        self::seedHomeBanners();
    }

    public static function seedHomeBanners(): void
    {
        $banners = [
            [
                'site_type' => SiteType::BRAND_SITE->value,
                'name' => 'Brand Home Hero',
                'image_path' => 'https://picsum.photos/seed/hebron-brand-home/1600/700',
                'image_path_mobile' => 'https://picsum.photos/seed/hebron-brand-home-mobile/800/900',
                'link_url' => '/products',
            ],
            [
                'site_type' => SiteType::SHOPPING_MALL->value,
                'name' => 'Shopping Mall Home Hero',
                'image_path' => 'https://picsum.photos/seed/hebron-mall-home/1600/700',
                'image_path_mobile' => 'https://picsum.photos/seed/hebron-mall-home-mobile/800/900',
                'link_url' => '/mall/products',
            ],
            [
                'site_type' => SiteType::PLAIN_SITE->value,
                'name' => 'Vendor Home Hero',
                'image_path' => 'https://picsum.photos/seed/hebron-vendor-home/1600/700',
                'image_path_mobile' => 'https://picsum.photos/seed/hebron-vendor-home-mobile/800/900',
                'link_url' => '/vendor/products',
            ],
        ];

        foreach ($banners as $banner) {
            Banner::updateOrCreate(
                [
                    'site_type' => $banner['site_type'],
                    'page_type' => 'home_page',
                    'name' => $banner['name'],
                ],
                [
                    'image_path' => $banner['image_path'],
                    'image_path_mobile' => $banner['image_path_mobile'],
                    'link_url' => $banner['link_url'],
                    'exposure_target' => 'all',
                    'exposure_location' => 'main_hero',
                    'is_active' => true,
                    'sort_order' => 10,
                    'created_by' => null,
                ]
            );
        }
    }

    public static function seedShoppingMallUtilityBanners(): void
    {
        $banners = [
            [
                'key' => 'order-lookup',
                'name' => '주문조회 Hero',
                'page_type' => 'order_lookup',
                'image_path' => 'https://picsum.photos/seed/hebron-order-lookup/1600/500',
                'image_path_mobile' => 'https://picsum.photos/seed/hebron-order-lookup-mobile/800/700',
                'link_url' => '/mall/order-lookup',
                'sort_order' => 10,
            ],
            [
                'key' => 'terms',
                'name' => '이용약관 Hero',
                'page_type' => 'terms',
                'image_path' => 'https://picsum.photos/seed/hebron-terms/1600/500',
                'image_path_mobile' => 'https://picsum.photos/seed/hebron-terms-mobile/800/700',
                'link_url' => '/mall/terms',
                'sort_order' => 10,
            ],
            [
                'key' => 'privacy',
                'name' => '개인정보처리방침 Hero',
                'page_type' => 'privacy',
                'image_path' => 'https://picsum.photos/seed/hebron-privacy/1600/500',
                'image_path_mobile' => 'https://picsum.photos/seed/hebron-privacy-mobile/800/700',
                'link_url' => '/mall/privacy',
                'sort_order' => 10,
            ],
        ];

        foreach ($banners as $banner) {
            unset($banner['key']);

            Banner::updateOrCreate(
                [
                    'site_type' => SiteType::SHOPPING_MALL->value,
                    'page_type' => $banner['page_type'],
                    'name' => $banner['name'],
                ],
                [
                    ...$banner,
                    'exposure_target' => 'all',
                    'exposure_location' => 'main_hero',
                    'is_active' => true,
                    'created_by' => null,
                ]
            );
        }
    }
}
