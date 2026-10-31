<?php

namespace Database\Seeders;

use App\Enums\PostCategoryPageType;
use App\Enums\SiteType;
use App\Models\Media;
use App\Models\PostCategory;
use Illuminate\Database\Seeder;

class MediaSeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Company News',
                'slug' => 'company-news',
            ],
            [
                'name' => 'Brand Stories',
                'slug' => 'brand-stories',
            ],
            [
                'name' => 'Events',
                'slug' => 'events',
            ],
            [
                'name' => 'Facilities',
                'slug' => 'facilities',
            ],
        ];

        foreach ($categories as $categoryData) {
            $category = PostCategory::updateOrCreate(
                ['page_type' => PostCategoryPageType::MEDIA->value, 'name' => $categoryData['name']],
                ['is_active' => true]
            );

            $mediaItems = match ($categoryData['slug']) {
                'company-news' => [
                    ['title' => 'Company News Sample 1', 'description' => 'Sample image media for company news.', 'url' => 'https://picsum.photos/seed/hebron-company-news-1/1200/800', 'thumbnail_path' => 'https://picsum.photos/seed/hebron-company-news-1-thumb/400/260'],
                    ['title' => 'Company News Sample 2', 'description' => 'Sample image media for company news.', 'url' => 'https://picsum.photos/seed/hebron-company-news-2/1200/800', 'thumbnail_path' => 'https://picsum.photos/seed/hebron-company-news-2-thumb/400/260'],
                ],
                'brand-stories' => [
                    ['title' => 'Brand Story Sample 1', 'description' => 'Sample image media for brand stories.', 'url' => 'https://picsum.photos/seed/hebron-brand-story-1/1200/800', 'thumbnail_path' => 'https://picsum.photos/seed/hebron-brand-story-1-thumb/400/260'],
                    ['title' => 'Brand Story Sample 2', 'description' => 'Sample image media for brand stories.', 'url' => 'https://picsum.photos/seed/hebron-brand-story-2/1200/800', 'thumbnail_path' => 'https://picsum.photos/seed/hebron-brand-story-2-thumb/400/260'],
                ],
                'events' => [
                    ['title' => 'Event Sample 1', 'description' => 'Sample image media for events.', 'url' => 'https://picsum.photos/seed/hebron-event-1/1200/800', 'thumbnail_path' => 'https://picsum.photos/seed/hebron-event-1-thumb/400/260'],
                    ['title' => 'Event Sample 2', 'description' => 'Sample image media for events.', 'url' => 'https://picsum.photos/seed/hebron-event-2/1200/800', 'thumbnail_path' => 'https://picsum.photos/seed/hebron-event-2-thumb/400/260'],
                ],
                'facilities' => [
                    ['title' => 'Facility Sample', 'description' => 'Sample image media for facilities.', 'url' => 'https://picsum.photos/seed/hebron-facility/1200/800', 'thumbnail_path' => 'https://picsum.photos/seed/hebron-facility-thumb/400/260'],
                ],
            };

            foreach ($mediaItems as $index => $mediaData) {
                $media = Media::updateOrCreate(
                    ['title' => $mediaData['title']],
                    [
                        'site_type' => SiteType::BRAND_SITE->value,
                        ...$mediaData,
                        'sort_order' => ($index + 1) * 10,
                        'is_active' => true,
                    ]
                );
                $media->categories()->sync([$category->id]);
            }
        }
    }
}
