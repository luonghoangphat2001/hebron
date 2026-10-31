<?php

namespace App\Console\Commands;

use App\Support\FileStorage;
use Illuminate\Console\Command;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;
use SplFileInfo;

class MigrateStorageToS3 extends Command
{
    protected $signature = 'storage:migrate-to-s3
        {--source=both : public, local, or both}
        {--prefix= : Only migrate keys below this relative prefix}
        {--dry-run : Report work without uploading}';

    protected $description = 'Copy legacy storage/app files to the configured S3 disks without deleting the source files.';

    public function handle(): int
    {
        $source = $this->option('source');
        if (! in_array($source, ['public', 'local', 'both'], true)) {
            $this->error('--source must be public, local, or both.');

            return self::INVALID;
        }

        $prefix = trim((string) $this->option('prefix'), '/');
        $summary = ['copied' => 0, 'skipped' => 0, 'failed' => 0, 'bytes' => 0];
        $sources = $source === 'both' ? ['public', 'local'] : [$source];

        foreach ($sources as $sourceName) {
            $root = $sourceName === 'public' ? storage_path('app/public') : storage_path('app');

            if (! is_dir($root)) {
                $this->warn("Source directory does not exist: {$root}");
                continue;
            }

            $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root, RecursiveDirectoryIterator::SKIP_DOTS));
            foreach ($iterator as $file) {
                /** @var SplFileInfo $file */
                if (! $file->isFile()) {
                    continue;
                }

                $absolutePath = $file->getPathname();
                $key = ltrim(substr($absolutePath, strlen($root)), DIRECTORY_SEPARATOR);
                $key = str_replace(DIRECTORY_SEPARATOR, '/', $key);

                if (str_starts_with(basename($key), '.')) {
                    continue;
                }

                // storage/app/public is handled by the public source; never copy it twice.
                if ($sourceName === 'local' && str_starts_with($key, 'public/')) {
                    continue;
                }
                if ($prefix !== '' && ! str_starts_with($key, $prefix.'/') && $key !== $prefix) {
                    continue;
                }

                $destination = FileStorage::publicDisk();

                try {
                    if ($destination->exists($key) && $destination->size($key) === $file->getSize()) {
                        $summary['skipped']++;
                        continue;
                    }

                    if ($this->option('dry-run')) {
                        $this->line("Would copy {$sourceName}: {$key}");
                        $summary['copied']++;
                        $summary['bytes'] += $file->getSize();
                        continue;
                    }

                    $stream = fopen($absolutePath, 'rb');
                    if ($stream === false) {
                        throw new \RuntimeException('Unable to open source file.');
                    }
                    $written = $destination->writeStream($key, $stream);
                    fclose($stream);

                    if (! $written) {
                        throw new \RuntimeException('S3 rejected the upload.');
                    }
                    $summary['copied']++;
                    $summary['bytes'] += $file->getSize();
                } catch (\Throwable $exception) {
                    $summary['failed']++;
                    $this->error("Failed {$sourceName}: {$key} ({$exception->getMessage()})");
                }
            }
        }

        $this->table(array_keys($summary), [array_values($summary)]);

        return $summary['failed'] === 0 ? self::SUCCESS : self::FAILURE;
    }
}
