<?php

namespace App\Migration\ExampleSentenceSamples\Services;

use App\Enums\PostCategoryPageType;
use App\Migration\ExampleSentenceSamples\Importers\ExampleSentenceSamplesImporter;
use App\Migration\ExampleSentenceSamples\Readers\ExampleSentenceSamplesReader;
use App\Migration\ExampleSentenceSamples\Transformers\ExampleSentenceSamplesTransformer;
use App\Migration\Shared\Clients\AssetDownloader;
use App\Services\PostCategoryService;

class ExampleSentenceSamplesMigrationService
{
    public function __construct(
        private readonly ExampleSentenceSamplesReader $reader,
        private readonly ExampleSentenceSamplesTransformer $transformer,
        private readonly ExampleSentenceSamplesImporter $importer,
        private readonly AssetDownloader $assetDownloader,
        private readonly PostCategoryService $categories,
    ) {}

    public function migrate(?int $limit = null, ?int $maxOffset = null, bool $dryRun = false): array
    {
        $config = config('migration.pagination.example_sentence_samples');
        $boardNo = (int) $config['board_no'];
        $limit ??= (int) $config['limit'];
        $maxOffset ??= (int) $config['max_offset'];
        config(['migration.dry_run' => $dryRun]);

        $this->categories->import(
            PostCategoryPageType::EXAMPLE_SENTENCE_SAMPLE->value,
            $this->reader->getBoardCategories($boardNo),
        );

        return $this->fetchAll($boardNo, $limit, $maxOffset, $dryRun);
    }

    private function fetchAll(int $boardNo, int $limit, int $maxOffset, bool $dryRun): array
    {
        $imported = $skipped = $offset = 0;

        do {
            $batch = $this->reader->getArticles($offset, $limit, $boardNo);
            foreach ($batch as $article) {
                if (($article['deleted'] ?? 'F') === 'T' || (int) ($article['article_no'] ?? 0) <= 0) {
                    $skipped++;

                    continue;
                }

                if (! $dryRun) {
                    $article = $this->assetDownloader->download($article, 'example_sentence_samples');
                }
                $this->importer->import($this->transformer->transform($article));
                $imported++;
            }
            $offset += $limit;
        } while (count($batch) >= $limit && $offset <= $maxOffset);

        return compact('imported', 'skipped');
    }
}
