<?php

namespace App\Migration\Inquiry\Jobs;

use App\Migration\Inquiry\Importers\InquiryImporter;
use App\Migration\Inquiry\Readers\LegacyInquiryReader;
use App\Migration\Inquiry\Transformers\InquiryTransformer;
use App\Migration\Shared\Exceptions\InquiryImportException;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

class ImportInquiryJob implements ShouldQueue
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
        InquiryTransformer $transformer,
        InquiryImporter $importer,
    ): void {
        $article = $this->raw;
        if (empty($article)) {
            throw new InquiryImportException(
                sprintf('Article %d returned empty payload.', $article['article_no'] ?? 0),
                $article['article_no'] ?? 0,
            );
        }

        $dto = $transformer->transform($article);
        if ($dto->legacyParentArticleNo !== null) {
            $importer->importReply($dto);
        } else {
           $importer->import($dto);
        }
    }

    public function failed(Throwable $e): void
    {
        Log::error('ImportInquiryJob: failed', [
            'board_no' => $this->raw['board_no'] ?? null,
            'article_no' => $this->raw['article_no'] ?? null,
            'error' => $e->getMessage(),
        ]);
    }
}
