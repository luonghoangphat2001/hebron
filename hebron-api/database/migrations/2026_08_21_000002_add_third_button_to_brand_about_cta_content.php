<?php

use App\Enums\SiteType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $this->updateContent(function (array $content): array {
            $content['third_button'] = [
                'link' => '/inquiry',
                'label' => '제작 문의',
                'variant' => 'third',
            ];

            return $content;
        });
    }

    public function down(): void
    {
        $this->updateContent(function (array $content): array {
            unset($content['third_button']);

            return $content;
        });
    }

    private function updateContent(callable $transform): void
    {
        $aboutCta = DB::table('about_ctas')
            ->where('site_type', SiteType::BRAND_SITE->value)
            ->first(['id', 'content']);

        if ($aboutCta === null) {
            return;
        }

        $content = json_decode($aboutCta->content ?? 'null', true) ?: [];

        DB::table('about_ctas')->where('id', $aboutCta->id)->update([
            'content' => json_encode($transform($content), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            'updated_at' => now(),
        ]);
    }
};
