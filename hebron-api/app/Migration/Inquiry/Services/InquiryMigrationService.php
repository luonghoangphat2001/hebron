<?php

namespace App\Migration\Inquiry\Services;

use App\Enums\InquiryCategory;
use App\Enums\InquiryStatus;
use App\Migration\Inquiry\DTO\InquiryImportData;
use App\Migration\Inquiry\Importers\InquiryImporter;
use App\Migration\Inquiry\Jobs\ImportInquiryJob;
use App\Migration\Inquiry\Readers\LegacyInquiryReader;
use App\Migration\Inquiry\Transformers\InquiryTransformer;
use App\Models\Inquiry;
use App\Models\InquiryComment;
use Illuminate\Support\Facades\Log;
use Throwable;

class InquiryMigrationService
{
    public function __construct(
        protected LegacyInquiryReader $reader,
        protected InquiryTransformer $transformer,
        protected InquiryImporter $importer,
    ) {}

    /**
     * Fetch inquiries from the legacy system and process them.
     *
     * @return array{imported:int, failed:int, skipped:int, total:int}
     */
    public function migrate(bool $useQueue = false): array
    {
        $boardNo = (int) config('migration.pagination.inquiries.board_no', 9);
        $limit = (int) config('migration.pagination.inquiries.limit', 50);
        $maxOffset = (int) config('migration.pagination.inquiries.max_offset', 10000);
        $dryRun = (bool) config('migration.dry_run', false);

        Log::info('InquiryMigrationService: starting', [
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
                        ImportInquiryJob::dispatch($raw);
                    } else {
                        $this->importOne($raw);
                    }
                    $imported++;
                } catch (Throwable $e) {
                    $failed++;
                    Log::error('InquiryMigrationService: error', [
                        'article_no' => $articleNo,
                        'error' => $e->getMessage(),
                    ]);
                }
            }
        };

        $this->fetchAllArticles($boardNo, $limit, $maxOffset, $processBatch);

        if ($total === 0) {
            Log::info('InquiryMigrationService: no articles found');
        }

        return ['imported' => $imported, 'failed' => $failed, 'skipped' => $skipped, 'total' => $total];
    }

    /**
     * @param callable(array<int, array<string, mixed>>): void $processor
     */
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

    /**
     * Import a single article. If parent_article_no exists, it's a reply/comment.
     */
    protected function importOne(array $article): void
    {
        $dto = $this->transformer->transform($article);

        if ($dto->legacyParentArticleNo !== null) {
            $this->importer->importReply($dto);
        } else {
            $this->importer->import($dto);
        }
    }
}