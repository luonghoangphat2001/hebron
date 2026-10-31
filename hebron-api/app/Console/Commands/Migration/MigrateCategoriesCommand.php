<?php

namespace App\Console\Commands\Migration;

use App\Migration\Category\Importers\CategoryImporter;
use App\Migration\Category\Readers\LegacyCategoryReader;
use App\Migration\Category\Services\CategoryMigrationService;
use App\Migration\Category\Transformers\CategoryTransformer;
use App\Migration\Shared\Exceptions\Cafe24ApiException;
use App\Migration\Shared\Exceptions\CategoryImportException;
use Illuminate\Console\Command;
use Throwable;

class MigrateCategoriesCommand extends Command
{
    protected $signature = 'migrate:categories
        {--sync : Run the import inline (no queue)}
        {--limit= : Override the page size from config}
        {--max-offset= : Override the maximum offset from config}
        {--with-translations : Also fetch category translations (en/ja names)}
        {--dry-run : Log actions without writing to the database}
        {--stop-on-error : Abort on the first error}';

    protected $description = 'Migrate product categories from the legacy Cafe24 (Hebron21) system into Hebron.';

    public function handle(
        LegacyCategoryReader $reader,
        CategoryTransformer $transformer,
        CategoryImporter $importer,
    ): int {
        $this->applyOptionOverrides();

        $service = app(CategoryMigrationService::class);
        $fetchTranslations = (bool) $this->option('with-translations')
            || (bool) config('migration.categories.fetch_translations', false);

        try {
            $result = $service->migrate(useQueue: false, fetchTranslations: $fetchTranslations);
        } catch (Cafe24ApiException $e) {
            $this->error('Cafe24 API error: '.$e->getMessage());

            return self::FAILURE;
        } catch (CategoryImportException $e) {
            $this->error('Category import error: '.$e->getMessage());

            return self::FAILURE;
        } catch (Throwable $e) {
            $this->error('Unexpected error: '.$e->getMessage());

            return self::FAILURE;
        }

        $this->info(sprintf(
            'Imported: %d, Failed: %d, Skipped: %d, Total: %d%s',
            $result['imported'],
            $result['failed'],
            $result['skipped'],
            $result['total'],
            $result['dry_run'] ? ' [dry-run]' : '',
        ));

        if ($result['failed'] > 0 && (bool) $this->option('stop-on-error')) {
            return self::FAILURE;
        }

        return self::SUCCESS;
    }

    protected function applyOptionOverrides(): void
    {
        if ($this->option('limit') !== null) {
            config(['migration.pagination.categories.limit' => (int) $this->option('limit')]);
        }

        if ($this->option('max-offset') !== null) {
            config(['migration.pagination.categories.max_offset' => (int) $this->option('max-offset')]);
        }

        if ($this->option('dry-run')) {
            config(['migration.dry_run' => true]);
        }

        if ($this->option('stop-on-error')) {
            config(['migration.stop_on_error' => true]);
        }
    }
}
