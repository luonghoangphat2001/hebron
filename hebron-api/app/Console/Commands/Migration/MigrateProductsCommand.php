<?php

namespace App\Console\Commands\Migration;

use App\Migration\Product\Importers\ProductImporter;
use App\Migration\Product\Readers\LegacyProductReader;
use App\Migration\Product\Transformers\ProductTransformer;
use App\Migration\Shared\Exceptions\Cafe24ApiException;
use App\Migration\Shared\Exceptions\ProductImportException;
use App\Models\Product;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Throwable;

class MigrateProductsCommand extends Command
{
    protected $signature = 'migrate:products
        {--sync : Run the import inline (no queue) instead of dispatching jobs}
        {--limit= : Override the page size from config}
        {--max-offset= : Override the maximum offset from config}
        {--product=* : Import a specific legacy product number (repeatable)}
        {--stock-only : Sync only stock quantity and inventory flag}
        {--dry-run : Log actions without writing to the database}
        {--stop-on-error : Abort on the first error}';

    protected $description = 'Migrate products from the legacy Cafe24 (Hebron21) system into Hebron.';

    public function handle(
        LegacyProductReader $reader,
        ProductTransformer $transformer,
        ProductImporter $importer,
    ): int {
        $this->applyOptionOverrides();

        if ($this->option('stock-only')) {
            return $this->runStockOnly($reader);
        }

        if ($this->option('sync')) {
            return $this->runSync($reader, $transformer, $importer);
        }

        return $this->runQueue();
    }

    protected function runSync(
        LegacyProductReader $reader,
        ProductTransformer $transformer,
        ProductImporter $importer,
    ): int {
        $specific = $this->option('product');
        $specific = is_array($specific) ? array_map('intval', $specific) : [];
        $specific = array_filter($specific, fn ($v) => $v > 0);

        if (! empty($specific)) {
            return $this->importSpecific($specific, $reader, $transformer, $importer);
        }

        $limit = (int) ($this->option('limit') ?? config('migration.pagination.products.limit', 100));
        $maxOffset = (int) ($this->option('max-offset') ?? config('migration.pagination.products.max_offset', 100000));
        $offset = 0;
        $imported = 0;
        $failed = 0;
        $pages = 0;

        $this->info("Starting sync product migration (limit={$limit}, max_offset={$maxOffset})...");

        do {
            try {
                $products = $reader->getProducts($offset, $limit);
            } catch (Cafe24ApiException $e) {
                $this->error('Cafe24 API error: '.$e->getMessage());
                return self::FAILURE;
            }

            $count = count($products);
            $pages++;

            if ($count === 0) {
                break;
            }

            foreach ($products as $product) {
                $productNo = (int) ($product['product_no'] ?? $product['no'] ?? 0);
                if ($productNo <= 0) {
                    continue;
                }

                $result = $this->importOne($productNo, $reader, $transformer, $importer);

                if ($result === 0) {
                    $imported++;
                } else {
                    $failed++;
                }
            }

            $offset += $limit;

            if ($offset > $maxOffset) {
                $this->warn("Reached max offset {$maxOffset}, stopping.");
                break;
            }
        } while ($count >= $limit);

        $this->info("Done. Imported: {$imported}, Failed: {$failed}, Pages: {$pages}.");

        return $failed > 0 && (bool) $this->option('stop-on-error') ? self::FAILURE : self::SUCCESS;
    }

    protected function runQueue(): int
    {
        $service = app(\App\Migration\Product\Services\ProductMigrationService::class);

        $this->info('Dispatching ImportProductJob for all legacy products...');

        try {
            $result = $service->migrate();
        } catch (Cafe24ApiException $e) {
            $this->error('Cafe24 API error: '.$e->getMessage());
            return self::FAILURE;
        }

        $this->info(sprintf(
            'Dispatched %d jobs across %d pages (last offset %d).%s',
            $result['dispatched'],
            $result['pages'],
            $result['last_offset'],
            $result['dry_run'] ? ' [dry-run]' : '',
        ));

        return self::SUCCESS;
    }

    /**
     * @param  array<int, int>  $productNos
     */
    protected function importSpecific(
        array $productNos,
        LegacyProductReader $reader,
        ProductTransformer $transformer,
        ProductImporter $importer,
    ): int {
        $failed = 0;

        foreach ($productNos as $productNo) {
            $this->line("Importing product {$productNo}...");
            $code = $this->importOne($productNo, $reader, $transformer, $importer);
            if ($code !== 0) {
                $failed++;
            }
        }

        return $failed > 0 ? self::FAILURE : self::SUCCESS;
    }

    protected function runStockOnly(LegacyProductReader $reader): int
    {
        $productNos = array_values(array_filter(
            array_map('intval', (array) $this->option('product')),
            fn (int $productNo): bool => $productNo > 0,
        ));

        if ($productNos === []) {
            $limit = (int) ($this->option('limit') ?? config('migration.pagination.products.limit', 100));
            $maxOffset = (int) ($this->option('max-offset') ?? config('migration.pagination.products.max_offset', 100000));
            $offset = 0;

            do {
                $products = $reader->getProducts($offset, $limit);
                $this->line(sprintf(
                    '  > fetched Cafe24 page offset=%d count=%d',
                    $offset,
                    count($products),
                ));
                foreach ($products as $product) {
                    $productNo = (int) ($product['product_no'] ?? $product['no'] ?? 0);
                    if ($productNo > 0) {
                        $productNos[] = $productNo;
                    }
                }

                $count = count($products);
                $offset += $limit;
            } while ($count >= $limit && $offset <= $maxOffset);

            $this->info(sprintf('Found %d Cafe24 products for stock-only sync.', count($productNos)));
        }

        $totalProducts = count($productNos);
        foreach ($productNos as $index => $productNo) {
            try {
                $this->line(sprintf(
                    '  > syncing stock %d/%d product_no=%d',
                    $index + 1,
                    $totalProducts,
                    $productNo,
                ));
                $variants = $this->getVariantsWithRateLimitRetry($reader, $productNo);
                $detail = $variants === [] ? $reader->getProductDetail($productNo) : [];
                $quantities = array_values(array_filter(
                    array_map(fn (array $variant): mixed => $variant['quantity'] ?? null, $variants),
                    fn (mixed $quantity): bool => $quantity !== null && $quantity !== '',
                ));
                $stockQuantity = $quantities !== []
                    ? max(0, array_sum(array_map('intval', $quantities)))
                    : max(0, (int) ($detail['stock_quantity'] ?? 0));
                $inventoryFlags = array_values(array_filter(
                    array_map(fn (array $variant): mixed => $variant['use_inventory'] ?? null, $variants),
                    fn (mixed $value): bool => $value !== null,
                ));
                $stockInventoryEnabled = $inventoryFlags !== []
                    ? collect($inventoryFlags)->contains(fn (mixed $value): bool => strtoupper((string) $value) === 'T')
                    : (! array_key_exists('use_inventory', $detail)
                        || strtoupper((string) $detail['use_inventory']) === 'T');
                $product = Product::where('legacy_product_id', $productNo)->first();

                if (! $product) {
                    $this->warn("  - product {$productNo}: local product not found.");
                    continue;
                }

                $oldStockQuantity = (int) $product->stock_quantity;
                $oldStockInventoryEnabled = (bool) $product->stock_inventory_enabled;

                if (! $this->option('dry-run')) {
                    $product->update([
                        'stock_quantity' => $stockQuantity,
                        'stock_inventory_enabled' => $stockInventoryEnabled,
                    ]);
                }

                Log::info('Cafe24 stock-only sync completed', [
                    'legacy_product_id' => $productNo,
                    'product_id' => $product->id,
                    'position' => $index + 1,
                    'total_products' => $totalProducts,
                    'old_stock_quantity' => $oldStockQuantity,
                    'stock_quantity' => $stockQuantity,
                    'old_stock_inventory_enabled' => $oldStockInventoryEnabled,
                    'stock_inventory_enabled' => $stockInventoryEnabled,
                    'dry_run' => (bool) $this->option('dry-run'),
                ]);

                $this->line(sprintf(
                    '  + stock %s -> id=%d quantity=%d inventory=%s%s%s',
                    $productNo,
                    $product->id,
                    $stockQuantity,
                    $stockInventoryEnabled ? 'T' : 'F',
                    sprintf(' position=%d/%d', $index + 1, $totalProducts),
                    $this->option('dry-run') ? ' [dry-run]' : '',
                ));
            } catch (Cafe24ApiException $e) {
                $this->error("  ! product {$productNo} api error: {$e->getMessage()}");

                if ($e->statusCode === 429) {
                    Log::warning('Cafe24 stock-only sync skipped rate-limited product', [
                        'legacy_product_id' => $productNo,
                        'endpoint' => $e->endpoint,
                    ]);
                    continue;
                }

                return self::FAILURE;
            } catch (Throwable $e) {
                $this->error("  ! product {$productNo} stock sync error: {$e->getMessage()}");

                return self::FAILURE;
            }
        }

        return self::SUCCESS;
    }

    protected function getVariantsWithRateLimitRetry(LegacyProductReader $reader, int $productNo): array
    {
        $maxAttempts = 5;

        for ($attempt = 1; $attempt <= $maxAttempts; $attempt++) {
            try {
                return $reader->getProductVariants($productNo);
            } catch (Cafe24ApiException $e) {
                if ($e->statusCode !== 429 || $attempt === $maxAttempts) {
                    throw $e;
                }

                $delaySeconds = min(10, $attempt * 2);
                $this->warn("  ! product {$productNo}: Cafe24 rate limit, retrying in {$delaySeconds}s ({$attempt}/{$maxAttempts})");
                sleep($delaySeconds);
            }
        }

        return [];
    }

    protected function importOne(
        int $productNo,
        LegacyProductReader $reader,
        ProductTransformer $transformer,
        ProductImporter $importer,
    ): int {
        try {
            $detail = $reader->getProductDetail($productNo);
            if (empty($detail)) {
                $this->warn("  - product {$productNo}: empty detail, skipped.");
                return 0;
            }

            $options = (bool) config('migration.options.import', true)
                ? $reader->getProductOptions($productNo)
                : [];

            $images = (bool) config('migration.images.enabled', true)
                ? $reader->getProductImages($productNo, $detail)
                : [];

            $variants = $reader->getProductVariants($productNo);

            $dto = $transformer->transform($detail, $options, $images, $variants);
            $product = $importer->import($dto);

            $this->line("  + product {$productNo} -> id={$product->id} (legacy={$dto->legacyId})");

            return 0;
        } catch (ProductImportException $e) {
            $this->error("  ! product {$productNo} import error: {$e->getMessage()}");
            return 1;
        } catch (Cafe24ApiException $e) {
            $this->error("  ! product {$productNo} api error: {$e->getMessage()}");
            return 1;
        } catch (Throwable $e) {
            $this->error("  ! product {$productNo} unexpected error: {$e->getMessage()}");
            return 1;
        }
    }

    protected function applyOptionOverrides(): void
    {
        if ($this->option('limit') !== null) {
            config(['migration.pagination.products.limit' => (int) $this->option('limit')]);
        }

        if ($this->option('max-offset') !== null) {
            config(['migration.pagination.products.max_offset' => (int) $this->option('max-offset')]);
        }

        if ($this->option('dry-run')) {
            config(['migration.dry_run' => true]);
        }

        if ($this->option('stop-on-error')) {
            config(['migration.stop_on_error' => true]);
        }
    }
}
