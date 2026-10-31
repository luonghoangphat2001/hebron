<?php

namespace App\Migration\Faq\Importers;

use App\Enums\ExposureTarget;
use App\Enums\PostCategoryPageType;
use App\Enums\SiteType;
use App\Migration\Faq\DTO\FaqImportData;
use App\Models\Faq;
use App\Services\PostCategoryService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class FaqImporter
{
    public function __construct(private readonly PostCategoryService $categories) {}

    public function import(FaqImportData $dto): Faq
    {
        $dryRun = (bool) config('migration.dry_run', false);

        if ($dryRun) {
            Log::info('[dry-run] FaqImporter::import', [
                'legacy_article_no' => $dto->legacyArticleNo,
            ]);

            return new Faq(['id' => 0]);
        }

        try {
            return DB::transaction(function () use ($dto) {
                $faq = $this->upsertFaq($dto);
                $this->categories->attachImported(
                    $faq,
                    PostCategoryPageType::FAQ->value,
                    $dto->boardCategoryNo,
                );

                return $faq;
            });
        } catch (Throwable $e) {
            Log::error('FaqImporter: failed', [
                'legacy_article_no' => $dto->legacyArticleNo,
                'error' => $e->getMessage(),
            ]);
            throw new \Exception(
                sprintf('Failed to import FAQ %d: %s', $dto->legacyArticleNo, $e->getMessage()),
                $dto->legacyArticleNo,
                $e,
            );
        }
    }

    protected function upsertFaq(FaqImportData $dto): Faq
    {
        $faq = Faq::updateOrCreate(
            ['legacy_article_no' => $dto->legacyArticleNo],
            [
                'category' => $dto->category,
                'question' => $dto->question,
                'answer' => $dto->answer,
                'exposure_target' => [ExposureTarget::ALL->value],
                'is_active' => $dto->display === 'T',
                'view_count' => $dto->hit,
                'legacy_data' => $dto->rawArticle,
                'site_type' => SiteType::SHOPPING_MALL->value,
            ],
        );

        Log::info('FAQ imported', [
            'legacy_article_no' => $dto->legacyArticleNo,
            'faq_id' => $faq->id,
        ]);

        return $faq;
    }
}
