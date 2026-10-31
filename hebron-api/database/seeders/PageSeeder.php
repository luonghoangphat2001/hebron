<?php

namespace Database\Seeders;

use App\Enums\SiteType;
use App\Models\AboutCta;
use App\Models\Page;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class PageSeeder extends Seeder
{
    public function run(): void
    {
        $this->truncatePageTables();
        self::seed();
    }

    public static function seed(): void
    {
        $pages = [
            ['brand-story', 'brand_story', 'Brand Story', [
                ['hero_section', 'Hero', ['items' => []]],
                ['company_history', 'Company History', [
                    'intro' => 'Hebron founding story and company history.',
                    'timeline' => [
                        [
                            'year' => '2000',
                            'title' => 'Hebron founded',
                            'description' => 'Hebron begins its award craftsmanship journey.',
                        ],
                        [
                            'year' => '2010',
                            'title' => 'Production expansion',
                            'description' => 'Expanded custom production and finishing capabilities.',
                        ],
                        [
                            'year' => '2020',
                            'title' => 'Brand growth',
                            'description' => 'Strengthened corporate and institutional award projects.',
                        ],
                    ],
                    'scroll_animation' => 'scroll_driven',
                ]],
                ['brand_identity', 'Brand Identity', [
                    'ci_bi_intro' => 'CI/BI introduction and Hebron brand philosophy.',
                    'philosophy' => 'Craft distinction for every achievement.',
                    'values' => [
                        [
                            'title' => 'Craft',
                            'description' => 'Precise finishing and balanced materials.',
                        ],
                        [
                            'title' => 'Trust',
                            'description' => 'Reliable custom production experience.',
                        ],
                        [
                            'title' => 'Presence',
                            'description' => 'Design with weight and lasting presence.',
                        ],
                    ],
                    'image' => null,
                ]],
                ['certificates', 'Certificates', ['items' => [
                    [
                        'type' => 'award',
                        'title' => 'Sample Design Award',
                        'issuer' => 'Award Organization',
                        'year' => '2022',
                        'image' => null,
                    ],
                    [
                        'type' => 'certification',
                        'title' => 'Sample Quality Certification',
                        'issuer' => 'Certification Body',
                        'year' => '2023',
                        'image' => null,
                    ],
                    [
                        'type' => 'patent',
                        'title' => 'Sample Product Patent',
                        'issuer' => 'Korean Intellectual Property Office',
                        'year' => '2024',
                        'image' => null,
                    ],
                ]]],
            ]],
            ['production-inquiry', 'production_inquiry', '제작 문의', [[
                'hero_section',
                'Hero',
                ['items' => null],
            ], [
                'inquiry_form',
                '문의 폼',
                [
                    'title' => 'Title',
                    'subtitle' => 'Subtitle',
                    'description' => '기업 행사, 시상식, 포상식, 기념일에 필요한 트로피와 상패를 제작해 드립니다.',
                    'image_url' => 'https://picsum.photos/seed/hebron-award-03/300/500',
                    'process_title' => '제작 과정',
                    'process_steps' => [
                        ['key' => 'inquiry', 'title' => '주문접수', 'description' => '제품 레퍼런스, 컨셉, 예상 수량 등 요구사항을 접수합니다.'],
                        ['key' => 'design', 'title' => '디자인 작업', 'description' => '필요에 따라 2D, 3D 렌더링 시안을 만들어 작업을 진행합니다.'],
                        ['key' => 'proposal', 'title' => '디자인 제안', 'description' => '요구사항에 맞춰 최적의 디자인을 제안합니다.'],
                        ['key' => 'approval', 'title' => '디자인 확정', 'description' => '수정과 보완 후 최종 디자인을 확정하며 제작을 위한 모델링을 진행합니다.'],
                        ['key' => 'production', 'title' => '제품제작', 'description' => '확정된 디자인에 따라 다양한 공정과 가공법을 조합해 제품을 제작합니다.'],
                        ['key' => 'delivery', 'title' => '검수 및 출고', 'description' => '최종 결과물을 검수한 뒤 안전하게 포장하여 출고합니다.'],
                    ],
                    'fields' => [
                        'inquiry_type',
                        'company_name',
                        'manager_name',
                        'phone',
                        'email',
                        'quantity',
                        'deadline',
                        'budget_range',
                        'message',
                        'attachments',
                    ],
                    'submit_label' => '문의하기',
                    'submit_endpoint' => '/api/brand/production-inquiry',
                    'image_upload' => [
                        'label' => '참고 파일 첨부',
                        'accept' => ['JPG', 'PNG', 'HEIC', 'PDF'],
                        'max_size_mb' => 10,
                    ],
                ],
            ]]],
            ['portfolio', 'portfolio', '포트폴리오', [[
                'hero_section',
                'Hero',
                ['items' => null],
            ], [
                'portfolio_featured',
                'Featured Portfolio',
                null,
            ], [
                'portfolio_list',
                'Major Projects',
                [
                    'list_endpoint' => '/api/brand/portfolios',
                    'detail_endpoint' => '/api/brand/portfolios/{id}',
                ],
            ], [
                'about_cta',
                '제작 문의',
                null,
                '/inquiry',
            ]]],
            [
                'portfolio-detail',
                'portfolio_detail',
                'Portfolio Detail',
                [[
                    'hero_section',
                    'Hero',
                    ['items' => null],
                ], [
                    'project_overview',
                    'Project Overview',
                    [
                        'fields' => [
                            'title',
                            'client',
                            'category',
                            'year',
                            'description',
                        ],
                        'gallery' => true,
                        'display' => 'overlay_or_page',
                        'source' => 'portfolio_api',
                        'detail_endpoint' => '/api/brand/portfolios/{id}',
                    ],
                ]],
            ],
            [
                'process',
                'process',
                'Making Process',
                [[
                    'hero_section',
                    'Hero',
                    ['items' => null],
                ], [
                    'process_steps',
                    'Production Process',
                    ['steps' => [[
                        'key' => 'raw_materials',
                        'title' => 'Raw Materials',
                    ], [
                        'key' => 'processing',
                        'title' => 'Processing',
                    ], ['key' => 'printing_engraving', 'title' => 'Printing / Engraving'], ['key' => 'assembly', 'title' => 'Assembly'], ['key' => 'quality_control', 'title' => 'QC'], ['key' => 'shipment', 'title' => 'Shipment']], 'interaction' => 'scroll_driven_or_tabs'],
                ], ['production_video', 'Production Video', ['provider' => 'youtube_or_self_hosted', 'url' => null]], ['equipment_gallery', 'Equipment Introduction', ['items' => []]], ['quality_control', 'Quality Control', ['description' => 'Quality management process overview.', 'visual' => null]], ['about_cta', '제작 문의', self::brandAboutCtaContent(), '/inquiry']],
            ],
            [
                'media',
                'media',
                'Media',
                [[
                    'hero_section',
                    'Hero',
                    ['items' => null],
                ], [
                    'media_list',
                    'The Media',
                    ['fields' => ['date', 'media', 'title', 'link'], 'items' => []],
                ], ['about_cta', '제작 문의', self::brandAboutCtaContent(), '/inquiry']],
            ],
            [
                'products-standard',
                'standard_products',
                'Standard Products',
                [[
                    'hero_section',
                    'Hero',
                    ['items' => null],
                ], [
                    'product_list',
                    'Standard Products',
                    [
                        'category_endpoint' => '/api/categories',
                        'product_endpoint' => '/api/brand/products',
                        'category_product_endpoint' => '/api/categories/{slug}/products',
                        'items' => [],
                    ],
                ], [
                    'about_cta',
                    '제작 문의',
                    self::brandAboutCtaContent(),
                    '/inquiry',
                ]],
            ],
            ['faqs', 'faqs', 'FAQs', [[
                'hero_section', 'Hero', ['items' => null],
            ], [
                'about_cta', '제작 문의', null, '/inquiry',
            ]]],
            ['contact-us', 'contact_us', 'Contact Us', [[
                'hero_section', 'Hero', ['items' => null],
            ]]],
        ];

        foreach ($pages as [$slug, $type, $title, $sections]) {
            $now = now();
            $page = Page::updateOrCreate([
                'site_type' => SiteType::BRAND_SITE->value,
                'slug' => $slug,
            ], [
                'page_type' => $type,
                'title' => $title,
                ...($slug === 'portfolio' ? ['image' => 'https://picsum.photos/seed/hebron-portfolio/1920/720'] : []),
                'sort_order' => count(Page::where('site_type', SiteType::BRAND_SITE->value)->get()) + 1,
                'is_active' => true,
                'updated_at' => $now,
                'created_at' => $now,
            ]);
            foreach ($sections as $index => $section) {
                [$sectionType, $sectionTitle, $content, $link] = array_pad($section, 4, null);
                $page->sections()->updateOrCreate(['section_type' => $sectionType], self::sectionData(
                    $sectionTitle,
                    $content,
                    [
                        'link' => $link,
                        'sort_order' => ($index + 1) * 10,
                        'is_active' => true,
                    ],
                ));
            }
        }

        self::seedHomePages();
        self::seedShoppingMallUtilityPages();
    }

    public static function seedShoppingMallUtilityPages(): void
    {
        $pages = [
            ['order-lookup', 'order_lookup', '주문조회', '주문번호와 주문 시 입력하신 핸드폰번호를 입력해주세요.', [
                ['hero_section', 'Hero', ['media_type' => 'banner', 'items' => []]],
                ['order_lookup', '주문조회 폼', [
                    'description' => '주문번호와 주문 시 입력하신 핸드폰번호를 입력해주세요.',
                    'fields' => ['order_number', 'mobile_phone'],
                    'submit_label' => '조회하기',
                    'endpoint' => '/api/inquiry/order-detail',
                ]],
            ]],
            ['terms', 'terms', '이용약관', null, [
                ['hero_section', 'Hero', ['media_type' => 'banner', 'items' => []]],
                ['rich_text', '이용약관 내용', ['format' => 'html', 'body' => '']],
            ]],
            ['privacy', 'privacy', '개인정보처리방침', null, [
                ['hero_section', 'Hero', ['media_type' => 'banner', 'items' => []]],
                ['rich_text', '개인정보처리방침 내용', ['format' => 'html', 'body' => '']],
            ]],
        ];

        foreach ($pages as [$slug, $type, $title, $subtitle, $sections]) {
            $page = Page::updateOrCreate(
                ['site_type' => SiteType::SHOPPING_MALL->value, 'slug' => $slug],
                ['page_type' => $type, 'title' => $title, 'subtitle' => $subtitle, 'is_active' => true]
            );

            foreach ($sections as $index => [$sectionType, $sectionTitle, $content]) {
                $page->sections()->updateOrCreate(['section_type' => $sectionType], self::sectionData(
                    $sectionTitle,
                    $content,
                    [
                        'sort_order' => ($index + 1) * 10,
                        'is_active' => true,
                    ],
                ));
            }
        }
    }

    private static function seedHomePages(): void
    {
        $sites = [
            SiteType::BRAND_SITE->value => ['title' => 'Brand Home', 'link_prefix' => ''],
            SiteType::SHOPPING_MALL->value => ['title' => 'Shopping Mall Home', 'link_prefix' => '/mall'],
            SiteType::PLAIN_SITE->value => ['title' => 'Vendor Home', 'link_prefix' => '/vendor'],
        ];

        foreach ($sites as $siteType => $site) {
            $aboutCtaTitle = $siteType === SiteType::BRAND_SITE->value ? '제작 문의' : 'About CTA';
            $aboutCtaContent = $siteType === SiteType::BRAND_SITE->value
                ? self::brandAboutCtaContent()
                : ['button_label' => 'Company Introduction', 'button_variant' => 'primary'];
            $aboutCtaLink = $siteType === SiteType::BRAND_SITE->value
                ? '/inquiry'
                : "{$site['link_prefix']}/company";

            $page = Page::updateOrCreate(
                ['site_type' => $siteType, 'slug' => 'home'],
                ['page_type' => 'home_page', 'title' => $site['title'], 'sort_order' => 0, 'is_active' => true]
            );

            $sections = [
                ['hero_section', 'Hero', ['media_type' => 'banner_slider', 'keywords' => ['Plaque', 'Trophy', 'Medal'], 'animation' => 'scroll_driven', 'items' => []], "{$site['link_prefix']}/products"],
                ['brand_statement', 'Brand Statement', ['slogan' => 'Crafting distinction for every achievement.', 'core_values' => [['title' => 'Craft', 'description' => 'Precise finishing and balanced materials.'], ['title' => 'Trust', 'description' => 'Reliable custom production experience.'], ['title' => 'Presence', 'description' => 'Design with weight and lasting presence.']], 'visual' => ['image_url' => null]], null],
                ['product_preview', 'Product Preview', ['category_slugs' => ['상패', '트로피', '메달-뱃지'], 'catalog_link' => "{$site['link_prefix']}/products"], "{$site['link_prefix']}/products"],
                ['notices_preview', 'Notices Preview', ['limit' => 6, 'view_all_link' => "{$site['link_prefix']}/notices", 'items' => []], "{$site['link_prefix']}/notices"],
                ['client_logos', 'Client Logos', ['marquee' => true, 'logos' => []], null],
                ['about_cta', $aboutCtaTitle, $aboutCtaContent, $aboutCtaLink],
            ];

            if ($siteType === SiteType::BRAND_SITE->value) {
                $sections[3] = [
                    'portfolio_preview',
                    'Portfolio Preview',
                    ['limit' => 6, 'view_all_link' => '/portfolio', 'items' => []],
                    '/portfolio',
                ];

                if (Schema::hasTable('craftsmanship_values')) {
                    BrandHomeCraftsmanshipValuesSeeder::seedValues();
                    $craftsmanshipContent = BrandHomeCraftsmanshipValuesSeeder::sectionContent();
                } else {
                    $craftsmanshipContent = [
                        'description' => '1998년부터 이어온 헤브론의 제조 철학—최고의 소재, 정밀한 공정, 그리고 장인의 이야기.',
                        'items' => [
                            ['title' => '자체제조인프라', 'subtitle' => 'One-stop Manufacturing', 'image_url' => 'https://picsum.photos/seed/hebron-in-house-manufacturing/900/1200', 'button_label' => '더 보기'],
                            ['title' => '엄선된 소재', 'subtitle' => 'Curated Material', 'image_url' => 'https://picsum.photos/seed/hebron-curated-material/900/1200', 'button_label' => '더 보기'],
                            ['title' => '주문제작 서비스', 'subtitle' => 'Bespoke Design', 'image_url' => 'https://picsum.photos/seed/hebron-bespoke-design/900/1200', 'button_label' => '더 보기'],
                        ],
                    ];
                }
                array_splice($sections, 2, 0, [[
                    'craftsmanship_values', '장인의 손끝에서 탄생하는 가치',
                    $craftsmanshipContent, null,
                ]]);
            }

            if ($siteType === SiteType::PLAIN_SITE->value) {
                $sections = array_slice($sections, 0, 1);
            }

            foreach ($sections as $index => [$sectionType, $sectionTitle, $content, $link]) {
                $page->sections()->updateOrCreate(
                    ['section_type' => $sectionType],
                    self::sectionData($sectionTitle, $content, [
                        'link' => $link,
                        'sort_order' => ($index + 1) * 10,
                        'is_active' => true,
                    ]),
                );
            }

            if ($siteType !== SiteType::PLAIN_SITE->value && Schema::hasTable('about_ctas')) {
                AboutCta::query()->updateOrCreate(
                    ['site_type' => $siteType],
                    [
                        'title' => $aboutCtaTitle,
                        'subtitle' => null,
                        'content' => $aboutCtaContent,
                        'image' => null,
                        'link' => $aboutCtaLink,
                        'metadata' => null,
                    ],
                );
            }
        }
    }

    /** @return array<string, mixed> */
    private static function brandAboutCtaContent(): array
    {
        return [
            'label' => '제작 문의',
            'heading' => "당신의 순간을\nHEBRON이 완성합니다",
            'description' => "기업 행사, 골프 대회, 포상식, 기념일\n어떤 자리든 헤브론의 상패가 그 가치를 더합니다",
            'button_label' => '제작문의',
            'button_variant' => 'primary',
            'primary_button' => [
                'link' => '/inquiry',
                'label' => '제작문의',
                'variant' => 'primary',
            ],
            'item' => [],
            'secondary_button' => [
                'link' => '/products',
                'label' => '기성품 보러가기',
                'variant' => 'outline',
            ],
            'third_button' => [
                'link' => '/inquiry',
                'label' => '제작 문의',
                'variant' => 'third',
            ],
        ];
    }

    private static function truncatePageTables(): void
    {
        $isMySql = DB::getDriverName() === 'mysql';

        if ($isMySql) {
            DB::statement('SET FOREIGN_KEY_CHECKS=0');
        }

        try {
            DB::table('page_sections')->truncate();
            DB::table('pages')->truncate();
        } finally {
            if ($isMySql) {
                DB::statement('SET FOREIGN_KEY_CHECKS=1');
            }
        }
    }

    /** @param array<string, mixed>|null $content */
    private static function sectionData(string $title, ?array $content, array $attributes): array
    {
        if (! Schema::hasColumn('page_sections', 'description')) {
            return [
                'title' => $title,
                'content' => $content,
                ...$attributes,
            ];
        }

        return [
            'title' => $content['heading'] ?? $title,
            'description' => $content['description'] ?? null,
            'content' => $content === null
                ? null
                : Arr::except($content, ['heading', 'description']),
            ...$attributes,
        ];
    }
}
