<?php

namespace App\Migration\Media\Importers;

use App\Enums\PostCategoryPageType;
use App\Enums\SiteType;
use App\Migration\Media\DTO\MediaImportData;
use App\Models\Media;
use App\Services\PostCategoryService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class MediaImporter
{
    public function __construct(private readonly PostCategoryService $categories) {}

    public function import(MediaImportData $dto): Media
    {
        if (config('migration.dry_run')) {
            return new Media(['id' => 0]);
        }

        return DB::transaction(function () use ($dto): Media {
            $media = Media::updateOrCreate(
                ['title' => $dto->title],
                [
                    'description' => $dto->description,
                    'url' => $dto->url,
                    'thumbnail_path' => $dto->thumbnailPath,
                    'link_url' => null,
                    'is_active' => $dto->isActive,
                    'sort_order' => 0,
                    'site_type' => SiteType::BRAND_SITE->value,
                ],
            );

            if ($dto->createdDate) {
                $media->forceFill(['created_at' => Carbon::parse($dto->createdDate)])->saveQuietly();
            }

            $this->categories->attachImported(
                $media,
                PostCategoryPageType::MEDIA->value,
                $dto->boardCategoryNo,
            );

            return $media;
        });
    }
}
