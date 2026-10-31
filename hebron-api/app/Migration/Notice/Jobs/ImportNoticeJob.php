<?php

namespace App\Migration\Notice\Jobs;

use App\Migration\Notice\Importers\NoticeImporter;
use App\Migration\Notice\Transformers\NoticeTransformer;
use App\Migration\Shared\Exceptions\NoticeImportException;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

class ImportNoticeJob implements ShouldQueue
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
        NoticeTransformer $transformer,
        NoticeImporter $importer,
    ): void {
        $article = $this->raw;
        if (empty($article)) {
            throw new NoticeImportException(
                sprintf('Article %d returned empty payload.', $article['article_no'] ?? 0),
                $article['article_no'] ?? 0,
            );
        }

        $dto = $transformer->transform($article);
        $importer->import($dto);
    }

    public function failed(Throwable $e): void
    {
        Log::error('ImportNoticeJob: failed', [
            'article_no' => $this->raw['article_no'] ?? null,
            'error' => $e->getMessage(),
        ]);
    }
}