<?php

use App\Enums\SiteType;
use App\Models\Page;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    private const IMAGES = [
        'https://picsum.photos/seed/hebron-order-method/800/500',
        'https://picsum.photos/seed/hebron-order-shipping/800/500',
        'https://picsum.photos/seed/hebron-one-to-one-inquiry/800/500',
    ];

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
        $keys = ['order_method', 'order_shipping', 'one_to_one_inquiry'];

        $section->update([
            'content' => [
                'items' => collect($keys)->values()->map(
                    fn (string $key, int $index): array => [
                        'field_name' => $key,
                        'image' => $items[$index]['image'] ?? self::IMAGES[$index],
                    ],
                )->all(),
            ],
        ]);
    }

    public function down(): void {}
};
