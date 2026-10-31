<?php

namespace App\Migration\Category\Services;

use App\Migration\Category\Importers\CategoryImporter;
use App\Migration\Category\Jobs\ImportCategoryJob;
use App\Migration\Category\Readers\LegacyCategoryReader;
use App\Migration\Category\Transformers\CategoryTransformer;
use App\Migration\Shared\Exceptions\Cafe24ApiException;
use Illuminate\Support\Facades\Log;
use Throwable;

class CategoryMigrationService
{
    public function __construct(
        protected LegacyCategoryReader $reader,
        protected CategoryTransformer $transformer,
        protected CategoryImporter $importer,
    ) {}

    /**
     * Fetch categories from the legacy system and process them sequentially in
     * depth-ascending order so that parents are imported before their children.
     *
     * @return array{imported:int, failed:int, skipped:int, total:int, dry_run:bool}
     */
    public function migrate(bool $useQueue = false, bool $fetchTranslations = false): array
    {
        $limit = (int) config('migration.pagination.categories.limit', 100);
        $maxOffset = (int) config('migration.pagination.categories.max_offset', 100000);
        $dryRun = (bool) config('migration.dry_run', false);

        Log::info('CategoryMigrationService: starting', [
            'limit' => $limit,
            'max_offset' => $maxOffset,
            'dry_run' => $dryRun,
            'use_queue' => $useQueue,
            'fetch_translations' => $fetchTranslations,
        ]);

        $categories = $this->fetchAllCategories($limit, $maxOffset);

        if (empty($categories)) {
            Log::info('CategoryMigrationService: no categories found, nothing to do.');

            return [
                'imported' => 0,
                'failed' => 0,
                'skipped' => 0,
                'total' => 0,
                'dry_run' => $dryRun,
            ];
        }

        $this->sortByDepthAsc($categories);

        $imported = 0;
        $failed = 0;
        $skipped = 0;

        foreach ($categories as $raw) {
            $categoryNo = (int) ($raw['category_no'] ?? $raw['no'] ?? 0);
            if ($categoryNo <= 0) {
                $skipped++;

                continue;
            }

            try {
                if ($useQueue) {
                    ImportCategoryJob::dispatchSync($categoryNo, $fetchTranslations);
                } else {
                    $this->importOne($categoryNo, $fetchTranslations);
                }
                $imported++;
            } catch (Cafe24ApiException $e) {
                $failed++;
                Log::error('CategoryMigrationService: api error', [
                    'category_no' => $categoryNo,
                    'error' => $e->getMessage(),
                ]);
            } catch (Throwable $e) {
                $failed++;
                Log::error('CategoryMigrationService: unexpected error', [
                    'category_no' => $categoryNo,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $summary = [
            'imported' => $imported,
            'failed' => $failed,
            'skipped' => $skipped,
            'total' => count($categories),
            'dry_run' => $dryRun,
        ];

        Log::info('CategoryMigrationService: finished', $summary);

        return $summary;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    protected function fetchAllCategories(int $limit, int $maxOffset): array
    {
        $all = [];
        $offset = 0;
        $pages = 0;

        do {
            $batch = $this->reader->getCategories($offset, $limit);
            $count = count($batch);
            $pages++;

            Log::info('CategoryMigrationService: page fetched', [
                'offset' => $offset,
                'limit' => $limit,
                'count' => $count,
            ]);

            if ($count === 0) {
                break;
            }

            foreach ($batch as $entry) {
                $all[] = $entry;
            }

            $offset += $limit;

            if ($offset > $maxOffset) {
                Log::warning('CategoryMigrationService: max offset reached, stopping', [
                    'max_offset' => $maxOffset,
                ]);
                break;
            }
        } while ($count >= $limit);

        return $all;
    }

    /**
     * @param  array<int, array<string, mixed>>  $categories
     */
    protected function sortByDepthAsc(array &$categories): void
    {
        usort($categories, function (array $a, array $b): int {
            $depthA = (int) ($a['category_depth'] ?? ($a['parent_category_no'] ?? 0) > 0 ? 2 : 1);
            $depthB = (int) ($b['category_depth'] ?? ($b['parent_category_no'] ?? 0) > 0 ? 2 : 1);

            if ($depthA === $depthB) {
                $aNo = (int) ($a['category_no'] ?? 0);
                $bNo = (int) ($b['category_no'] ?? 0);

                return $aNo <=> $bNo;
            }

            return $depthA <=> $depthB;
        });
    }

    protected function importOne(int $categoryNo, bool $fetchTranslations): void
    {
        $detail = $this->reader->getCategoryDetail($categoryNo);

        if (empty($detail)) {
            throw new Cafe24ApiException(
                sprintf('Category %d returned empty detail.', $categoryNo),
            );
        }
        $translations = [];
        if ($fetchTranslations) {
            $translations = $this->reader->getCategoryTranslations($categoryNo);
        }

        $dto = $this->transformer->transform($detail, $translations);
        $this->importer->import($dto);
    }
}
