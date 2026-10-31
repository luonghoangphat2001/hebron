<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $page = DB::table('pages')
            ->where('site_type', 'BRAND_SITE')
            ->where('page_type', 'home_page')
            ->where('slug', 'home')
            ->first();

        if ($page === null) {
            return;
        }

        $craftsmanshipExists = DB::table('page_sections')
            ->where('page_id', $page->id)
            ->where('section_type', 'craftsmanship_values')
            ->exists();

        $manufacturing = DB::table('page_sections')
            ->where('page_id', $page->id)
            ->where('section_type', 'manufacturing_process')
            ->first();

        if (! $craftsmanshipExists && $manufacturing !== null && $this->isMistakenSection($manufacturing)) {
            DB::table('page_sections')
                ->where('id', $manufacturing->id)
                ->update([
                    'section_type' => 'craftsmanship_values',
                    'updated_at' => now(),
                ]);

            return;
        }

        if ($craftsmanshipExists) {
            return;
        }

        DB::table('page_sections')
            ->where('page_id', $page->id)
            ->where('sort_order', '>=', 30)
            ->increment('sort_order', 10);

        DB::table('page_sections')->insert([
            'page_id' => $page->id,
            'section_type' => 'craftsmanship_values',
            'title' => '장인의 손끝에서 탄생하는 가치',
            'subtitle' => null,
            'content' => json_encode($this->content(), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            'image' => null,
            'link' => null,
            'sort_order' => 30,
            'is_active' => true,
            'metadata' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        $pageIds = DB::table('pages')
            ->where('site_type', 'BRAND_SITE')
            ->where('page_type', 'home_page')
            ->where('slug', 'home')
            ->pluck('id');

        DB::table('page_sections')
            ->whereIn('page_id', $pageIds)
            ->where('section_type', 'craftsmanship_values')
            ->delete();
    }

    private function isMistakenSection(object $section): bool
    {
        $content = json_decode($section->content ?? 'null', true);
        $keys = array_column($content['items'] ?? [], 'key');

        return $section->title === '장인의 손끝에서 탄생하는 가치'
            && $keys === ['in_house_manufacturing', 'curated_material', 'bespoke_design'];
    }

    private function content(): array
    {
        return [
            'description' => '1998년부터 이어온 헤브론의 제조 철학—최고의 소재, 정밀한 공정, 그리고 장인의 이야기.',
            'items' => [
                [
                    'key' => 'in_house_manufacturing',
                    'title' => '자체제조인프라',
                    'subtitle' => 'One-stop Manufacturing',
                    'image_url' => 'https://picsum.photos/seed/hebron-in-house-manufacturing/900/1200',
                    'button_label' => '더 보기',
                    'link' => '/process',
                ],
                [
                    'key' => 'curated_material',
                    'title' => '엄선된 소재',
                    'subtitle' => 'Curated Material',
                    'image_url' => 'https://picsum.photos/seed/hebron-curated-material/900/1200',
                    'button_label' => '더 보기',
                    'link' => '/process',
                ],
                [
                    'key' => 'bespoke_design',
                    'title' => '주문제작 서비스',
                    'subtitle' => 'Bespoke Design',
                    'image_url' => 'https://picsum.photos/seed/hebron-bespoke-design/900/1200',
                    'button_label' => '더 보기',
                    'link' => '/production-inquiry',
                ],
            ],
        ];
    }
};
