<?php

namespace App\Migration\Category\Jobs;

use App\Migration\Category\Importers\CategoryImporter;
use App\Migration\Category\Readers\LegacyCategoryReader;
use App\Migration\Category\Transformers\CategoryTransformer;
use App\Migration\Shared\Exceptions\CategoryImportException;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

class ImportCategoryJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries;

    public int $timeout;

    public int $backoff;

    public function __construct(
        public readonly int $categoryNo,
        public readonly bool $fetchTranslations = false,
    ) {
        $this->tries = (int) config('migration.queue.tries', 3);
        $this->timeout = (int) config('migration.queue.timeout', 120);
        $this->backoff = (int) config('migration.queue.backoff', 10);

        $connection = config('migration.queue.connection');
        if ($connection) {
            $this->onConnection($connection);
        }

        $this->onQueue((string) config('migration.queue.name', 'migrations'));
    }

    public function handle(
        LegacyCategoryReader $reader,
        CategoryTransformer $transformer,
        CategoryImporter $importer,
    ): void {
        $context = [
            'category_no' => $this->categoryNo,
            'attempt' => $this->attempts(),
        ];

        Log::info('ImportCategoryJob: starting', $context);

        try {
            $detail = $reader->getCategoryDetail($this->categoryNo);

            if (empty($detail)) {
                throw new CategoryImportException(
                    sprintf('Category %d returned empty detail payload.', $this->categoryNo),
                    $this->categoryNo,
                );
            }

            $translations = [];
            if ($this->fetchTranslations) {
                $translations = $reader->getCategoryTranslations($this->categoryNo);
            }

            $dto = $transformer->transform($detail, $translations);
            $category = $importer->import($dto);

            Log::info('ImportCategoryJob: completed', $context + [
                'category_id' => $category->id,
            ]);
        } catch (CategoryImportException $e) {
            Log::error('ImportCategoryJob: domain error', $context + [
                'error' => $e->getMessage(),
            ]);
            throw $e;
        } catch (Throwable $e) {
            Log::error('ImportCategoryJob: unexpected error', $context + [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    public function failed(Throwable $e): void
    {
        Log::error('ImportCategoryJob: permanently failed', [
            'category_no' => $this->categoryNo,
            'error' => $e->getMessage(),
        ]);
    }
}
