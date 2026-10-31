<?php

namespace App\Migration\Product\Jobs;

use App\Migration\Product\Importers\ProductImporter;
use App\Migration\Product\Readers\LegacyProductReader;
use App\Migration\Product\Transformers\ProductTransformer;
use App\Migration\Shared\Exceptions\ProductImportException;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

class ImportProductJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries;
    public int $timeout;
    public int $backoff;

    public function __construct(
        public readonly int $productNo,
    ) {
        $this->tries = (int) config('migration.queue.tries', 3);
        $this->timeout = (int) config('migration.queue.timeout', 120);
        $this->backoff = (int) config('migration.queue.backoff', 10);

        $connection = config('migration.queue.connection');
        if ($connection) {
            $this->onConnection($connection);
        }

        $this->onQueue((string) config('migration.queue.name', 'migrations'));
    }

    public function handle(
        LegacyProductReader $reader,
        ProductTransformer $transformer,
        ProductImporter $importer,
    ): void {
        $context = [
            'product_no' => $this->productNo,
            'attempt' => $this->attempts(),
        ];

        Log::info('ImportProductJob: starting', $context);
        try {
            $detail = $reader->getProductDetail($this->productNo);

            if (empty($detail)) {
                throw new ProductImportException(
                    sprintf('Product %d returned empty detail payload.', $this->productNo),
                    $this->productNo,
                );
            }

            $options = [];
            if ((bool) config('migration.options.import', true)) {
                $options = $reader->getProductOptions($this->productNo);
            }

            $images = [];
            if ((bool) config('migration.images.enabled', true)) {
                $images = $reader->getProductImages($this->productNo, $detail);
            }

            $variants = $reader->getProductVariants($this->productNo);

            $dto = $transformer->transform($detail, $options, $images, $variants);

            $product = $importer->import($dto);
            
            Log::info('ImportProductJob: completed', $context + [
                'product_id' => $product->id,
                'stock_inventory_enabled' => $dto->stockInventoryEnabled,
            ]);
        } catch (ProductImportException $e) {
            Log::error('ImportProductJob: domain error', $context + [
                'error' => $e->getMessage(),
            ]);

            throw $e;
        } catch (Throwable $e) {
            Log::error('ImportProductJob: unexpected error', $context + [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    public function failed(Throwable $e): void
    {
        Log::error('ImportProductJob: permanently failed', [
            'product_no' => $this->productNo,
            'error' => $e->getMessage(),
        ]);
    }
}
