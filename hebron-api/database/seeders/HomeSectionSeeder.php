<?php

namespace Database\Seeders;

use App\Enums\SiteType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class HomeSectionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        self::seed();
    }

    public static function seed(): void
    {
        foreach (self::sampleSections() as $section) {
            DB::table('home_sections')->updateOrInsert(
                [
                    'site_type' => $section['site_type'],
                    'type' => $section['type'],
                ],
                $section
            );
        }
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private static function sampleSections(): array
    {
        $now = now();
        $sites = [
            SiteType::BRAND_SITE->value => ['prefix' => 'Brand', 'link_prefix' => ''],
            SiteType::SHOPPING_MALL->value => ['prefix' => 'Shopping Mall', 'link_prefix' => '/mall'],
            SiteType::PLAIN_SITE->value => ['prefix' => 'Plain Site', 'link_prefix' => '/plain'],
        ];

        $sections = [];

        foreach ($sites as $siteType => $site) {
            $sections[] = [
                'site_type' => $siteType,
                'type' => 'hero_section',
                'title' => "{$site['prefix']} Hero",
                'subtitle' => 'Full-screen video or image slider with brand keywords',
                'content' => json_encode([
                    'media_type' => 'banner_slider',
                    'keywords' => ['Plaque', 'Trophy', 'Medal'],
                    'animation' => 'scroll_driven',
                    'reference' => 'Thomas Lyte',
                    'items' => [],
                ], JSON_UNESCAPED_UNICODE),
                'image' => null,
                'link' => "{$site['link_prefix']}/products",
                'sort_order' => 10,
                'is_active' => true,
                'starts_at' => null,
                'ends_at' => null,
                'metadata' => json_encode(['review_seed' => true], JSON_UNESCAPED_UNICODE),
                'created_at' => $now,
                'updated_at' => $now,
            ];

            $sections[] = [
                'site_type' => $siteType,
                'type' => 'brand_statement',
                'title' => "{$site['prefix']} Hebron Core Values",
                'subtitle' => 'Luxurious and substantial tone',
                'content' => json_encode([
                    'slogan' => 'Crafting distinction for every achievement.',
                    'core_values' => [
                        ['title' => 'Craft', 'description' => '정교한 마감과 균형 잡힌 소재감'],
                        ['title' => 'Trust', 'description' => '기관과 기업 행사를 위한 안정적인 제작 경험'],
                        ['title' => 'Presence', 'description' => '수상 순간을 돋보이게 하는 중량감 있는 디자인'],
                    ],
                    'visual' => ['image_url' => null, 'alt' => 'Hebron crafted awards detail'],
                ], JSON_UNESCAPED_UNICODE),
                'image' => null,
                'link' => null,
                'sort_order' => 20,
                'is_active' => true,
                'starts_at' => null,
                'ends_at' => null,
                'metadata' => json_encode(['review_seed' => true], JSON_UNESCAPED_UNICODE),
                'created_at' => $now,
                'updated_at' => $now,
            ];

            $sections[] = [
                'site_type' => $siteType,
                'type' => 'product_preview',
                'title' => "{$site['prefix']} Product Preview",
                'subtitle' => 'Representative Product Category Card (Plaque/Trophy/Medal)',
                'content' => json_encode([
                    'category_slugs' => ['상패', '트로피', '메달-뱃지'],
                    'catalog_link' => "{$site['link_prefix']}/products",
                ], JSON_UNESCAPED_UNICODE),
                'image' => null,
                'link' => "{$site['link_prefix']}/products",
                'sort_order' => 30,
                'is_active' => true,
                'starts_at' => null,
                'ends_at' => null,
                'metadata' => json_encode(['review_seed' => true], JSON_UNESCAPED_UNICODE),
                'created_at' => $now,
                'updated_at' => $now,
            ];

            $sections[] = [
                'site_type' => $siteType,
                'type' => 'portfolio_preview',
                'title' => "{$site['prefix']} Portfolio",
                'subtitle' => 'N recent portfolios',
                'content' => json_encode([
                    'limit' => 6,
                    'view_all_link' => "{$site['link_prefix']}/portfolio",
                    'items' => [
                        ['title' => 'Sample Award Ceremony', 'image_url' => null, 'link' => "{$site['link_prefix']}/portfolio/sample-award"],
                        ['title' => 'Sample Corporate Plaque', 'image_url' => null, 'link' => "{$site['link_prefix']}/portfolio/sample-plaque"],
                    ],
                ], JSON_UNESCAPED_UNICODE),
                'image' => null,
                'link' => "{$site['link_prefix']}/portfolio",
                'sort_order' => 40,
                'is_active' => true,
                'starts_at' => null,
                'ends_at' => null,
                'metadata' => json_encode(['review_seed' => true], JSON_UNESCAPED_UNICODE),
                'created_at' => $now,
                'updated_at' => $now,
            ];

            $sections[] = [
                'site_type' => $siteType,
                'type' => 'client_logos',
                'title' => "{$site['prefix']} Clients",
                'subtitle' => 'Major client companies/organizations logos',
                'content' => json_encode([
                    'marquee' => true,
                    'logos' => [
                        ['name' => 'Sample Organization A', 'logo_url' => null, 'link' => null],
                        ['name' => 'Sample Company B', 'logo_url' => null, 'link' => null],
                    ],
                ], JSON_UNESCAPED_UNICODE),
                'image' => null,
                'link' => null,
                'sort_order' => 50,
                'is_active' => true,
                'starts_at' => null,
                'ends_at' => null,
                'metadata' => json_encode(['review_seed' => true], JSON_UNESCAPED_UNICODE),
                'created_at' => $now,
                'updated_at' => $now,
            ];

            $sections[] = [
                'site_type' => $siteType,
                'type' => 'about_cta',
                'title' => "{$site['prefix']} About CTA",
                'subtitle' => 'CTA to Company Introduction',
                'content' => json_encode([
                    'button_label' => 'Company Introduction',
                    'button_variant' => 'primary',
                ], JSON_UNESCAPED_UNICODE),
                'image' => null,
                'link' => "{$site['link_prefix']}/company",
                'sort_order' => 60,
                'is_active' => true,
                'starts_at' => null,
                'ends_at' => null,
                'metadata' => json_encode(['review_seed' => true], JSON_UNESCAPED_UNICODE),
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        return $sections;
    }
}
