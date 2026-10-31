<?php

namespace App\Console\Commands\Migration;

use App\Migration\Notice\Services\NoticeMigrationService;
use Illuminate\Console\Command;
use Throwable;

class MigrateNoticesCommand extends Command
{
    protected $signature = 'migrate:notices
        {--sync : Run the import inline (no queue) instead of dispatching jobs}
        {--limit= : Override the page size from config}
        {--max-offset= : Override the maximum offset from config}
        {--dry-run : Log actions without writing to the database}
        {--stop-on-error : Abort on the first error}
        {--board= : Override the board number}
        {--queue= : Override queue name}';

    protected $description = 'Migrate notices from the legacy Cafe24 (Hebron21) system into Hebron.';

    public function handle(NoticeMigrationService $service): int
    {
        $this->applyOptionOverrides();

        $this->info(
            $this->option('sync')
                ? 'Starting sync notice migration...'
                : 'Dispatching ImportNoticeJob for all legacy notices...'
        );

        try {
            $result = $service->migrate(
                useQueue: ! $this->option('sync'),
            );
        } catch (Throwable $e) {
            $this->error($e->getMessage());

            return self::FAILURE;
        }

        $this->info(sprintf(
            'Done. Imported: %d, Failed: %d, Skipped: %d, Total: %d%s',
            $result['imported'],
            $result['failed'],
            $result['skipped'],
            $result['total'],
            config('migration.dry_run') ? ' [dry-run]' : '',
        ));

        return $result['failed'] > 0 && config('migration.stop_on_error')
            ? self::FAILURE
            : self::SUCCESS;
    }

    protected function applyOptionOverrides(): void
    {
        if ($this->option('limit') !== null) {
            config([
                'migration.pagination.notices.limit' => (int) $this->option('limit'),
            ]);
        }

        if ($this->option('max-offset') !== null) {
            config([
                'migration.pagination.notices.max_offset' => (int) $this->option('max-offset'),
            ]);
        }

        if ($this->option('board') !== null) {
            config([
                'migration.pagination.notices.board_no' => (int) $this->option('board'),
            ]);
        }

        if ($this->option('dry-run')) {
            config([
                'migration.dry_run' => true,
            ]);
        }

        if ($this->option('stop-on-error')) {
            config([
                'migration.stop_on_error' => true,
            ]);
        }

        if ($this->option('queue') !== null) {
            config([
                'migration.queue.name' => $this->option('queue'),
            ]);
        }
    }
}