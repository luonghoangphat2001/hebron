<?php

namespace App\Migration\Notice\Importers;

use App\Enums\ExposureTarget;
use App\Enums\PostCategoryPageType;
use App\Migration\Notice\DTO\NoticeImportData;
use App\Models\Notice;
use App\Services\PostCategoryService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class NoticeImporter
{
    public function __construct(private readonly PostCategoryService $categories) {}

    public function import(NoticeImportData $dto): Notice
    {
        $dryRun = (bool) config('migration.dry_run', false);

        if ($dryRun) {
            Log::info('[dry-run] NoticeImporter::import', [
                'legacy_article_no' => $dto->legacyArticleNo,
            ]);

            return new Notice(['id' => 0]);
        }

        try {
            return DB::transaction(function () use ($dto) {
                $notice = $this->upsertNotice($dto);
                $this->categories->attachImported(
                    $notice,
                    PostCategoryPageType::NOTICE->value,
                    $dto->boardCategoryNo,
                );

                return $notice;
            });
        } catch (Throwable $e) {
            Log::error('NoticeImporter: failed', [
                'legacy_article_no' => $dto->legacyArticleNo,
                'error' => $e->getMessage(),
            ]);
            throw new \Exception(
                sprintf('Failed to import Notice %d: %s', $dto->legacyArticleNo, $e->getMessage()),
                $dto->legacyArticleNo,
                $e,
            );
        }
    }

    protected function upsertNotice(NoticeImportData $dto): Notice
    {
        $notice = Notice::updateOrCreate(
            ['legacy_article_no' => $dto->legacyArticleNo],
            [
                'title' => $dto->title,
                'content' => $dto->content,
                'type' => $dto->type,
                'is_pinned' => $dto->isPinned,
                'is_active' => $dto->display,
                'view_count' => $dto->hit,
                'published_at' => $dto->createdDate,
                'exposure_target' => [ExposureTarget::ALL->value],
                'attachments' => $dto->attachments,
                'legacy_data' => $dto->rawArticle,
            ],
        );

        Log::info('Notice imported', [
            'legacy_article_no' => $dto->legacyArticleNo,
            'notice_id' => $notice->id,
        ]);

        return $notice;
    }
}
