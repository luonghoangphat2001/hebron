<?php

namespace App\Migration\Faq\Jobs;

use App\Migration\Faq\Importers\FaqImporter;
use App\Migration\Faq\Transformers\FaqTransformer;
use App\Migration\Shared\Exceptions\FaqImportException;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

class ImportFaqJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries;
    public int $timeout;
    public int $backoff;

    public function __construct(
        public readonly array $raw,
    ) {
        $this->tries = (int) config('migration.queue.tries', 3);
        $this->timeout = (int) config('migration.queue.timeout', 120);
        $this->backoff = (int) config('migration.queue.backoff', 10);
        $this->onQueue((string) config('migration.queue.name', 'migrations'));
    }

    public function handle(
        FaqTransformer $transformer,
        FaqImporter $importer,
    ): void {
        $article = $this->raw;
        if (empty($article)) {
            throw new FaqImportException(
                sprintf('Article %d returned empty payload.', $article['article_no'] ?? 0),
                $article['article_no'] ?? 0,
            );
        }

        $dto = $transformer->transform($article);
        $importer->import($dto);
    }

    public function failed(Throwable $e): void
    {
        Log::error('ImportFaqJob: failed', [
            'article_no' => $this->raw['article_no'] ?? null,
            'error' => $e->getMessage(),
        ]);
    }
}