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
            ->first();

        if ($page === null || DB::table('page_sections')
            ->where('page_id', $page->id)
            ->where('section_type', 'manufacturing_process')
            ->exists()) {
            return;
        }

        $now = now();

        DB::table('page_sections')
            ->where('page_id', $page->id)
            ->where('sort_order', '>=', 30)
            ->increment('sort_order', 10);

        DB::table('page_sections')->insert([
            'page_id' => $page->id,
            'section_type' => 'manufacturing_process',
            'title' => '장인의 손끝에서 탄생하는 가치',
            'subtitle' => null,
            'content' => json_encode([
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
            ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            'image' => null,
            'link' => null,
            'sort_order' => 30,
            'is_active' => true,
            'metadata' => null,
            'created_at' => $now,
            'updated_at' => $now,
        ]);
    }

    public function down(): void
    {
        $pageIds = DB::table('pages')
            ->where('site_type', 'BRAND_SITE')
            ->where('page_type', 'home_page')
            ->pluck('id');

        DB::table('page_sections')
            ->where('section_type', 'manufacturing_process')
            ->whereIn('page_id', $pageIds)
            ->delete();

        DB::table('page_sections')
            ->whereIn('page_id', $pageIds)
            ->where('sort_order', '>=', 40)
            ->decrement('sort_order', 10);
    }
};
