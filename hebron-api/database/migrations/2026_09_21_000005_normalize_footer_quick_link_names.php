<?php

use App\Enums\SiteType;
use App\Models\Page;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    private const FIELD_NAMES = ['order_method', 'order_shipping', 'one_to_one_inquiry'];

    public function up(): void
    {
        $section = Page::query()
            ->where('site_type', SiteType::SHOPPING_MALL->value)
            ->where('page_type', 'home_page')
            ->where('slug', 'home')
            ->first()?->sections()
            ->where('section_type', 'footer_quick_links')
            ->first();

        if ($section === null) {
            return;
        }

        $items = $section->content['items'] ?? [];
        $images = array_pad(array_map(static fn (array $item): mixed => $item['image'] ?? null, $items), 3, null);
        $section->update(['content' => ['items' => array_map(
            static fn (string $fieldName, int $index): array => ['field_name' => $fieldName, 'image' => $images[$index]],
            self::FIELD_NAMES,
            array_keys(self::FIELD_NAMES),
        )]]);
    }

    public function down(): void {}
};
