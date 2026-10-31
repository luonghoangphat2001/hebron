<?php

namespace App\Console\Commands\Migration;

use App\Migration\ExampleSentenceSamples\Services\ExampleSentenceSamplesMigrationService;
use Illuminate\Console\Command;
use Throwable;

class MigrateExampleSentenceSamplesCommand extends Command
{
    protected $signature = 'migration:example-sentence-samples {--limit=} {--max-offset=} {--dry-run}';
    protected $description = 'Migrate example sentence samples into example_sentence_samples.';

    public function handle(ExampleSentenceSamplesMigrationService $service): int
    {
        try {
            $result = $service->migrate(
                $this->option('limit') !== null ? (int) $this->option('limit') : null,
                $this->option('max-offset') !== null ? (int) $this->option('max-offset') : null,
                (bool) $this->option('dry-run'),
            );
        } catch (Throwable $e) {
            $this->error($e->getMessage());

            return self::FAILURE;
        }

        $this->info(sprintf('%s %d sample article(s).', $this->option('dry-run') ? 'Mapped' : 'Imported', $result['imported']));

        return self::SUCCESS;
    }
}
