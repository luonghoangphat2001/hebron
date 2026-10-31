<?php

namespace App\Migration\Portfolio\Importers;

use App\Enums\PostCategoryPageType;
use App\Enums\SiteType;
use App\Migration\Portfolio\DTO\PortfolioImportData;
use App\Models\Portfolio;
use App\Services\PostCategoryService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class PortfolioImporter
{
    public function __construct(private readonly PostCategoryService $categories) {}

    public function import(PortfolioImportData $dto): Portfolio
    {
        if (config('migration.dry_run')) {
            return new Portfolio(['id' => 0]);
        }

        return DB::transaction(function () use ($dto): Portfolio {
            $portfolio = Portfolio::updateOrCreate(
                ['title' => $dto->title],
                [
                    'description' => $dto->description,
                    'cover_image' => $dto->coverImage,
                    'gallery' => $dto->gallery,
                    'is_featured' => $dto->isFeatured,
                    'is_active' => $dto->isActive,
                    'site_type' => SiteType::BRAND_SITE->value,
                ],
            );

            if ($dto->createdDate) {
                $portfolio->forceFill(['created_at' => Carbon::parse($dto->createdDate)])->saveQuietly();
            }

            $this->categories->attachImported(
                $portfolio,
                PostCategoryPageType::PORTFOLIO->value,
                $dto->boardCategoryNo,
            );

            return $portfolio;
        });
    }
}
