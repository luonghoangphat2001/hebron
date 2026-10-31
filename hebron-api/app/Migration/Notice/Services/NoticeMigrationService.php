<?php

namespace App\Migration\Notice\Services;

use App\Enums\PostCategoryPageType;
use App\Migration\Notice\Importers\NoticeImporter;
use App\Migration\Notice\Jobs\ImportNoticeJob;
use App\Migration\Notice\Readers\LegacyNoticeReader;
use App\Migration\Notice\Transformers\NoticeTransformer;
use App\Services\PostCategoryService;
use Illuminate\Support\Facades\Log;
use Throwable;

class NoticeMigrationService
{
    public function __construct(
        protected LegacyNoticeReader $reader,
        protected NoticeTransformer $transformer,
        protected NoticeImporter $importer,
        protected PostCategoryService $categories,
    ) {}

    public function migrate(bool $useQueue = false): array
    {
        $boardNo = (int) config('migration.pagination.notices.board_no', 1);
        $limit = (int) config('migration.pagination.notices.limit', 50);
        $maxOffset = (int) config('migration.pagination.notices.max_offset', 10000);
        $dryRun = (bool) config('migration.dry_run', false);

        $this->categories->import(
            PostCategoryPageType::NOTICE->value,
            $this->reader->getBoardCategories($boardNo),
        );

        Log::info('NoticeMigrationService: starting', [
            'board_no' => $boardNo,
            'limit' => $limit,
            'max_offset' => $maxOffset,
            'dry_run' => $dryRun,
        ]);

        $imported = 0;
        $failed = 0;
        $skipped = 0;
        $total = 0;

        $processBatch = function (array $batch) use ($useQueue, &$imported, &$failed, &$skipped, &$total): void {
            foreach ($batch as $raw) {
                $total++;
                $articleNo = (int) ($raw['article_no'] ?? 0);
                if ($articleNo <= 0) {
                    $skipped++;

                    continue;
                }

                try {
                    if ($useQueue) {
                        ImportNoticeJob::dispatch($raw);
                    } else {
                        $this->importOne($raw);
                    }
                    $imported++;
                } catch (Throwable $e) {
                    $failed++;
                    Log::error('NoticeMigrationService: error', [
                        'article_no' => $articleNo,
                        'error' => $e->getMessage(),
                    ]);
                }
            }
        };

        $this->fetchAllArticles($boardNo, $limit, $maxOffset, $processBatch);

        if ($total === 0) {
            Log::info('NoticeMigrationService: no articles found');
        }

        return ['imported' => $imported, 'failed' => $failed, 'skipped' => $skipped, 'total' => $total];
    }

    protected function fetchAllArticles(int $boardNo, int $limit, int $maxOffset, callable $processor): void
    {
        $offset = 0;

        do {
            $batch = $this->reader->getArticles($offset, $limit, $boardNo);
            $count = count($batch);
            if ($count === 0) {
                break;
            }

            $processor($batch);

            $offset += $limit;
            if ($offset > $maxOffset) {
                break;
            }
        } while ($count >= $limit);
    }

    protected function importOne(array $article): void
    {
        $dto = $this->transformer->transform($article);
        $this->importer->import($dto);
    }
}
