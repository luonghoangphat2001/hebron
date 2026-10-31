<?php

namespace App\Console\Commands;

use App\Enums\FileType;
use App\Models\File;
use App\Models\Product;
use App\Support\FileStorage;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MapProductAiFiles extends Command
{
    protected $signature = 'products:map-ai-files
        {--prefix=data/aiimg : S3 prefix containing the Illustrator files}
        {--dry-run : Report matches without changing the database}
        {--replace : Replace, rather than append to, each matched product\'s existing AI files}';

    protected $description = 'Map S3 Illustrator files to products using the filename portion from "hb" through ".ai" as the SKU.';

    public function handle(): int
    {
        $prefix = trim((string) $this->option('prefix'), '/');
        $disk = FileStorage::publicDisk();

        try {
            $paths = collect($disk->files($prefix))
                ->filter(fn (string $path): bool => str_ends_with(strtolower($path), '.ai'))
                ->sort()
                ->values();
        } catch (\Throwable $exception) {
            $this->error("Unable to list s3://{$this->bucketName()}/{$prefix}: {$exception->getMessage()}");

            return self::FAILURE;
        }

        $summary = [
            'files' => $paths->count(),
            'mapped' => 0,
            'already_mapped' => 0,
            'invalid_name' => 0,
            'product_not_found' => 0,
            'duplicate_sku_mapped' => 0,
            'failed' => 0,
        ];
        $matchedProductIds = [];
        // Avoid one database lookup per S3 object. The command only needs the
        // SKU, file references, and basic product details for its logs.
        $productsBySku = Product::query()
            ->whereNotNull('sku')
            ->select(['id', 'sku', 'name', 'file_ai'])
            ->get()
            ->groupBy(fn (Product $product): string => mb_strtolower((string) $product->sku));
        $filesByPath = File::withTrashed()
            ->whereIn('path', $paths->all())
            ->get()
            ->keyBy('path');

        foreach ($paths as $path) {
            $sku = $this->skuFromPath($path);
            if ($sku === null) {
                $summary['invalid_name']++;
                $this->warn("Skipped invalid filename (expected an SKU beginning with hb before .ai): {$path}");
                $this->record([
                    'status' => 'invalid_filename',
                    'path' => $path,
                    'reason' => 'The filename has no "hb" segment before .ai.',
                ]);
                continue;
            }

            $products = $this->findProductsForSku($sku, $productsBySku);

            if ($products->isEmpty()) {
                $summary['product_not_found']++;
                $this->warn("No product found for SKU {$sku}: {$path}");
                $this->record([
                    'status' => 'product_not_found',
                    'path' => $path,
                    'extracted_sku' => $sku,
                    'near_matches' => $this->nearMatchProducts($sku, $productsBySku),
                ]);
                continue;
            }

            if ($products->count() > 1) {
                $summary['duplicate_sku_mapped']++;
                $this->warn("Duplicate SKU {$sku}; mapping to all product IDs ({$products->pluck('id')->join(', ')}): {$path}");
                $this->record([
                    'status' => 'duplicate_sku_mapping',
                    'path' => $path,
                    'extracted_sku' => $sku,
                    'products' => $products->map(fn (Product $product) => $this->productReference($product))->values()->all(),
                ], 'warning');
            }

            foreach ($products as $product) {
            $matchedProductIds[] = (int) $product->id;
            $existingFile = $filesByPath->get($path);
            $existingIds = array_map('intval', (array) ($product->file_ai ?? []));
            $isMapped = $existingFile !== null && in_array((int) $existingFile->id, $existingIds, true);

            if ($isMapped && ! $this->option('replace')) {
                $summary['already_mapped']++;
                $this->line("Already mapped: {$path} -> product #{$product->id} ({$product->sku})");
                $this->record([
                    'status' => 'already_mapped',
                    'path' => $path,
                    'extracted_sku' => $sku,
                    'product' => $this->productReference($product),
                    'file_id' => (int) $existingFile->id,
                ]);
                continue;
            }

            if ($this->option('dry-run')) {
                $summary['mapped']++;
                $this->line("Would map: {$path} -> product #{$product->id} ({$product->sku})");
                $this->record([
                    'status' => 'would_map',
                    'path' => $path,
                    'extracted_sku' => $sku,
                    'product' => $this->productReference($product),
                ]);
                continue;
            }

            try {
                $file = DB::transaction(function () use ($existingFile, $path, $product): File {
                    $file = $existingFile;
                    if ($file?->trashed()) {
                        $file->restore();
                    }

                    if (! $file) {
                        $file = File::create([
                            'name' => basename($path),
                            'path' => $path,
                            'url' => FileStorage::publicUrl($path),
                            'type' => FileType::PRODUCT_AI->value,
                            // Calling S3 mimeType() and size() performs two
                            // remote HEAD requests per object. Both fields are
                            // optional, so do not make this migration wait on
                            // them; Illustrator files have a known MIME type.
                            'mime_type' => 'application/postscript',
                            'size' => null,
                        ]);
                    }

                    $currentIds = array_values(array_unique(array_map('intval', (array) ($product->file_ai ?? []))));
                    $fileIds = $this->option('replace')
                        ? [(int) $file->id]
                        : array_values(array_unique([...$currentIds, (int) $file->id]));

                    $product->update(['file_ai' => $fileIds]);
                    $product->file_ai = $fileIds;

                    return $file;
                });
                $filesByPath->put($path, $file);

                $summary['mapped']++;
                $this->info("Mapped: {$path} -> product #{$product->id} ({$product->sku})");
                $this->record([
                    'status' => 'mapped',
                    'path' => $path,
                    'extracted_sku' => $sku,
                    'product' => $this->productReference($product),
                ]);
            } catch (\Throwable $exception) {
                $summary['failed']++;
                $this->error("Failed {$path}: {$exception->getMessage()}");
                $this->record([
                    'status' => 'failed',
                    'path' => $path,
                    'extracted_sku' => $sku,
                    'product' => $this->productReference($product),
                    'error' => $exception->getMessage(),
                ], 'error');
            }
            }
        }

        $matchedProductIds = array_values(array_unique($matchedProductIds));
        Product::query()
            ->whereNotNull('sku')
            ->where('sku', '!=', '')
            ->when($matchedProductIds !== [], fn ($query) => $query->whereNotIn('id', $matchedProductIds))
            ->orderBy('id')
            ->get()
            ->each(function (Product $product): void {
                $reference = $this->productReference($product);
                Log::warning('Product AI file mapping: product has no matching S3 AI file', $reference);
            });

        $this->newLine();
        $this->table(array_keys($summary), [array_values($summary)]);

        return $summary['failed'] === 0 ? self::SUCCESS : self::FAILURE;
    }

    private function skuFromPath(string $path): ?string
    {
        $filename = pathinfo(basename($path), PATHINFO_FILENAME);
        $skuStart = stripos($filename, 'hb');
        if ($skuStart === false) {
            return null;
        }

        // Ignore every character before "hb". For example,
        // "1809110001_1hb-2017S.ai" maps to SKU "hb-2017S".
        $sku = trim(substr($filename, $skuStart));

        return $sku !== '' ? $sku : null;
    }

    private function bucketName(): string
    {
        return (string) config('filesystems.disks.'.config('filesystems.public_disk').'.bucket', 'configured-bucket');
    }

    /** @param array<string, mixed> $entry */
    private function record(array $entry, string $level = 'info'): void
    {
        Log::{$level}('Product AI file mapping', $entry);
    }

    /** @return array{id: int, sku: string|null, name: string} */
    private function productReference(Product $product): array
    {
        return [
            'id' => (int) $product->id,
            'sku' => $product->sku,
            'name' => $product->name,
        ];
    }

    /**
     * Find an exact SKU without a query first. If it does not exist, search
     * with LIKE so filenames containing an added note such as
     * "hb-6055y (2016수정).ai" can still find SKU "HB-6055Y".
     *
     * @param \Illuminate\Support\Collection<string, \Illuminate\Support\Collection<int, Product>> $productsBySku
     * @return \Illuminate\Support\Collection<int, Product>
     */
    private function findProductsForSku(string $sku, $productsBySku)
    {
        $exact = $productsBySku->get(mb_strtolower($sku), collect());
        if ($exact->isNotEmpty()) {
            return $exact;
        }

        $lookupSku = $this->searchableSku($sku);
        if ($lookupSku === '') {
            return collect();
        }

        $like = '%'.addcslashes(mb_strtolower($lookupSku), '\\%_').'%';

        return Product::query()
            ->whereNotNull('sku')
            ->whereRaw('LOWER(sku) LIKE ?', [$like])
            ->get();
    }

    /**
     * @param \Illuminate\Support\Collection<string, \Illuminate\Support\Collection<int, Product>> $productsBySku
     * @return array<int, array{id: int, sku: string|null, name: string}>
     */
    private function nearMatchProducts(string $sku, $productsBySku): array
    {
        $baseSku = $this->searchableSku($sku);
        if ($baseSku === '') {
            return [];
        }

        return $productsBySku
            ->get(mb_strtolower($baseSku), collect())
            ->map(fn (Product $product) => $this->productReference($product))
            ->values()
            ->all();
    }

    private function searchableSku(string $sku): string
    {
        return trim((string) preg_replace('/\s*\(.*\)$/u', '', $sku));
    }

}
