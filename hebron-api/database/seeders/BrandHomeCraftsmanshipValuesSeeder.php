<?php

namespace Database\Seeders;

use App\Enums\SectionType;
use App\Enums\SiteType;
use App\Models\CraftsmanshipValue;
use App\Models\Page;
use Illuminate\Database\Seeder;

class BrandHomeCraftsmanshipValuesSeeder extends Seeder
{
    public function run(): void
    {
        $brandHome = Page::query()
            ->where('site_type', SiteType::BRAND_SITE->value)
            ->where('page_type', 'home_page')
            ->where('slug', 'home')
            ->firstOrFail();

        self::seedValues();

        $brandHome->sections()->updateOrCreate(
            ['section_type' => SectionType::CRAFTSMANSHIP_VALUES->value],
            [
                'title' => '장인의 손끝에서 탄생하는 가치',
                'subtitle' => null,
                'content' => self::sectionContent(),
                'image' => null,
                'link' => null,
                'sort_order' => 30,
                'is_active' => true,
            ]
        );
    }

    /** @return array<int, int> */
    public static function seedValues(): array
    {
        return collect(self::defaults())->map(function (array $attributes): int {
            $value = CraftsmanshipValue::query()->updateOrCreate(
                ['title' => $attributes['title']],
                $attributes,
            );

            return $value->id;
        })->all();
    }

    public static function sectionContent(): array
    {
        return [
            'description' => '1998년부터 이어온 헤브론의 제조 철학—최고의 소재, 정밀한 공정, 그리고 장인의 이야기.',
        ];
    }

    /** @return array<int, array<string, mixed>> */
    private static function defaults(): array
    {
        return [
            [
                'title' => '자체제조인프라',
                'subtitle' => 'One-stop Manufacturing',
                'image_url' => 'https://picsum.photos/seed/hebron-in-house-manufacturing/900/1200',
                'description' => null,
                'button_label' => '더 보기',
                'sort_order' => 10,
                'is_active' => true,
            ],
            [
                'title' => '엄선된 소재',
                'subtitle' => 'Curated Material',
                'image_url' => 'https://picsum.photos/seed/hebron-curated-material/900/1200',
                'description' => null,
                'button_label' => '더 보기',
                'sort_order' => 20,
                'is_active' => true,
            ],
            [
                'title' => '주문제작 서비스',
                'subtitle' => 'Bespoke Design',
                'image_url' => 'https://picsum.photos/seed/hebron-bespoke-design/900/1200',
                'description' => null,
                'button_label' => '더 보기',
                'sort_order' => 30,
                'is_active' => true,
            ],
        ];
    }
}
