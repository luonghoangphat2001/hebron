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
            ->where('section_type', 'steady_seller')
            ->first();

        if ($section === null || ($section->content['product_ids'] ?? null) !== []) {
            return;
        }

        $content = $section->content ?? [];
        unset($content['product_ids']);
        $section->update(['content' => $content]);
    }

    public function down(): void
    {
        // Keep the section content configured by the administrator intact.
    }
};
