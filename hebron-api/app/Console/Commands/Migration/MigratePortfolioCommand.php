<?php

namespace App\Console\Commands\Migration;

use App\Migration\Portfolio\Services\PortfolioMigrationService;
use Illuminate\Console\Command;
use Throwable;

class MigratePortfolioCommand extends Command
{
    protected $signature = 'migration:portfolio {--limit=} {--max-offset=} {--dry-run}';
    protected $description = 'Migrate portfolio articles into portfolios.';

    public function handle(PortfolioMigrationService $service): int
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

        $this->info(sprintf('%s %d portfolio article(s).', $this->option('dry-run') ? 'Mapped' : 'Imported', $result['imported']));

        return self::SUCCESS;
    }
}
