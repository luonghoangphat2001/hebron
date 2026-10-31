<?php

namespace App\Migration\Portfolio\Services;

use App\Enums\PostCategoryPageType;
use App\Migration\Portfolio\Importers\PortfolioImporter;
use App\Migration\Portfolio\Readers\PortfolioReader;
use App\Migration\Portfolio\Transformers\PortfolioTransformer;
use App\Migration\Shared\Clients\AssetDownloader;
use App\Services\PostCategoryService;

class PortfolioMigrationService
{
    public function __construct(
        private readonly PortfolioReader $reader,
        private readonly PortfolioTransformer $transformer,
        private readonly PortfolioImporter $importer,
        private readonly AssetDownloader $assetDownloader,
        private readonly PostCategoryService $categories,
    ) {}

    public function migrate(?int $limit = null, ?int $maxOffset = null, bool $dryRun = false): array
    {
        $config = config('migration.pagination.portfolios');
        $boardNo = (int) $config['board_no'];
        $limit ??= (int) $config['limit'];
        $maxOffset ??= (int) $config['max_offset'];
        config(['migration.dry_run' => $dryRun]);

        $this->categories->import(
            PostCategoryPageType::PORTFOLIO->value,
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
                    $article = $this->assetDownloader->download($article, 'portfolio');
                }
                $this->importer->import($this->transformer->transform($article));
                $imported++;
            }
            $offset += $limit;
        } while (count($batch) >= $limit && $offset <= $maxOffset);

        return compact('imported', 'skipped');
    }
}
