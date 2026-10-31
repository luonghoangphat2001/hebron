<?php

use Database\Seeders\ShoppingMallHomeSectionSeeder;
use App\Enums\SiteType;
use App\Models\Page;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        ShoppingMallHomeSectionSeeder::seed();
    }

    public function down(): void
    {
        Page::query()
            ->where('site_type', SiteType::SHOPPING_MALL->value)
            ->where('page_type', 'home_page')
            ->where('slug', 'home')
            ->first()?->sections()
            ->whereIn('section_type', ['secondary_banner', 'steady_seller', 'footer_quick_links'])
            ->delete();
    }
};
