<?php

namespace Database\Seeders;

use App\Enums\PostCategoryPageType;
use App\Enums\SiteType;
use App\Models\Portfolio;
use App\Models\PostCategory;
use Illuminate\Database\Seeder;

class PortfolioSeeder extends Seeder
{
    public function run(): void
    {
        $category = PostCategory::updateOrCreate(
            ['page_type' => PostCategoryPageType::PORTFOLIO->value, 'name' => 'major_project'],
            ['is_active' => true],
        );

        $award = Portfolio::updateOrCreate(
            ['title' => 'Sample Award Ceremony'],
            [
                'site_type' => SiteType::BRAND_SITE->value,
                'client' => 'Sample Client',
                'year' => 2026,
                'description' => 'Custom award plaques produced for a corporate award ceremony.',
                'cover_image' => null,
                'gallery' => [],
                'is_featured' => true,
                'is_active' => true,
                'sort_order' => 10,
            ]
        );

        $plaque = Portfolio::updateOrCreate(
            ['title' => 'Sample Corporate Plaque'],
            [
                'site_type' => SiteType::BRAND_SITE->value,
                'client' => 'Sample Corporation',
                'year' => 2026,
                'description' => 'Corporate recognition plaques with custom finishing and presentation.',
                'cover_image' => null,
                'gallery' => [],
                'is_featured' => false,
                'is_active' => true,
                'sort_order' => 20,
            ]
        );

        $award->categories()->sync([$category->id]);
        $plaque->categories()->sync([$category->id]);
    }
}
