<?php

namespace App\Migration\Product\Services;

use App\Migration\Product\Jobs\ImportProductJob;
use App\Migration\Product\Readers\LegacyProductReader;
use App\Migration\Shared\Exceptions\Cafe24ApiException;
use Illuminate\Support\Facades\Log;

class ProductMigrationService
{
    public function __construct(
        protected LegacyProductReader $reader,
    ) {}

    /**
     * Dispatch ImportProductJob for every product page from the legacy system.
     *
     * @return array{dispatched:int, pages:int, last_offset:int, dry_run:bool}
     */
    public function migrate(): array
    {
        $limit = (int) config('migration.pagination.products.limit', 100);
        $maxOffset = (int) config('migration.pagination.products.max_offset', 100000);
        $stopOnError = (bool) config('migration.stop_on_error', false);
        $dryRun = (bool) config('migration.dry_run', false);

        $offset = 0;
        $dispatched = 0;
        $pages = 0;
        $lastOffset = 0;

        Log::info('ProductMigrationService: starting', [
            'limit' => $limit,
            'max_offset' => $maxOffset,
            'dry_run' => $dryRun,
        ]);

        do {
            try {
                $products = $this->reader->getProducts($offset, $limit);
            } catch (Cafe24ApiException $e) {
                Log::error('ProductMigrationService: API error', [
                    'offset' => $offset,
                    'error' => $e->getMessage(),
                ]);

                if ($stopOnError) {
                    throw $e;
                }

                break;
            }

            $count = count($products);
            $pages++;
            $lastOffset = $offset;

            Log::info('ProductMigrationService: page fetched', [
                'offset' => $offset,
                'limit' => $limit,
                'count' => $count,
            ]);

            if ($count === 0) {
                break;
            }

            foreach ($products as $product) {
                $productNo = (int) ($product['product_no'] ?? $product['no'] ?? 0);
                if ($productNo <= 0) {
                    continue;
                }

                if ($dryRun) {
                    Log::info('[dry-run] would dispatch ImportProductJob', [
                        'product_no' => $productNo,
                    ]);
                } else {
                    ImportProductJob::dispatch($productNo);
                }

                $dispatched++;
            }

            $offset += $limit;

            if ($offset > $maxOffset) {
                Log::warning('ProductMigrationService: max offset reached, stopping', [
                    'max_offset' => $maxOffset,
                ]);
                break;
            }
        } while ($count >= $limit);

        Log::info('ProductMigrationService: finished', [
            'dispatched' => $dispatched,
            'pages' => $pages,
            'last_offset' => $lastOffset,
        ]);

        return [
            'dispatched' => $dispatched,
            'pages' => $pages,
            'last_offset' => $lastOffset,
            'dry_run' => $dryRun,
        ];
    }
}
