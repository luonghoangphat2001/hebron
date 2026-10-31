<?php

namespace App\Console\Commands\Migration;

use App\Migration\Media\Services\MediaMigrationService;
use Illuminate\Console\Command;
use Throwable;

class MigrateMediaCommand extends Command
{
    protected $signature = 'migration:media {--limit=} {--max-offset=} {--dry-run}';
    protected $description = 'Migrate press articles into media.';

    public function handle(MediaMigrationService $service): int
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

        $this->info(sprintf('%s %d media article(s).', $this->option('dry-run') ? 'Mapped' : 'Imported', $result['imported']));

        return self::SUCCESS;
    }
}
