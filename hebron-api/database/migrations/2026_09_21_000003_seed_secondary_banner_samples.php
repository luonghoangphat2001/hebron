<?php

use App\Enums\SiteType;
use App\Models\Page;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        $section = Page::query()
            ->where('site_type', SiteType::SHOPPING_MALL->value)
            ->where('page_type', 'home_page')
            ->where('slug', 'home')
            ->first()?->sections()
            ->where('section_type', 'secondary_banner')
            ->first();

        if ($section === null || ! empty($section->content['items'] ?? [])) {
            return;
        }

        $section->update([
            'content' => [
                'items' => [
                    ['name' => 'Secondary Banner 01', 'image' => 'https://picsum.photos/seed/hebron-secondary-banner-01/1600/500'],
                    ['name' => 'Secondary Banner 02', 'image' => 'https://picsum.photos/seed/hebron-secondary-banner-02/1600/500'],
                ],
            ],
        ]);
    }

    public function down(): void
    {
        $section = Page::query()
            ->where('site_type', SiteType::SHOPPING_MALL->value)
            ->where('page_type', 'home_page')
            ->where('slug', 'home')
            ->first()?->sections()
            ->where('section_type', 'secondary_banner')
            ->first();

        if ($section !== null && ($section->content['items'] ?? []) === [
            ['name' => 'Secondary Banner 01', 'image' => 'https://picsum.photos/seed/hebron-secondary-banner-01/1600/500'],
            ['name' => 'Secondary Banner 02', 'image' => 'https://picsum.photos/seed/hebron-secondary-banner-02/1600/500'],
        ]) {
            $section->update(['content' => ['items' => []]]);
        }
    }
};
