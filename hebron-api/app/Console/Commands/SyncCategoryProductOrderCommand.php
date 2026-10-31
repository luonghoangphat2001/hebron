<?php

namespace App\Console\Commands;

use App\Models\Category;
use App\Models\Product;
use App\Services\Cache;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SyncCategoryProductOrderCommand extends Command
{
    protected $signature = 'category:sync-product-order
        {category_id? : Optional Category ID to re-order}
        {--batch=500 : Number of pivot rows to update per SQL statement}';

    protected $description = 'Sync category_product sort_order to align with legacy product order';

    public function handle(Cache $cache): int
    {
        $categoryId = $this->argument('category_id');

        if ($categoryId) {
            $categoryIds = [(int) $categoryId];
        } else {
            $categoryIds = DB::table('category_product')
                ->whereNull('deleted_at')
                ->distinct()
                ->pluck('category_id')
                ->all();
        }

        $legacyOrderFile = database_path('data/legacy_category_orders.json');
        $legacyOrders = file_exists($legacyOrderFile)
            ? json_decode(file_get_contents($legacyOrderFile), true)
            : [];

        foreach ($categoryIds as $catId) {
            $category = Category::find($catId);
            $legacyCatId = $category?->legacy_category_id;

            $pnos = $legacyCatId && isset($legacyOrders[(string) $legacyCatId])
                ? $legacyOrders[(string) $legacyCatId]
                : null;

            if ($pnos !== null && ! empty($pnos)) {
                $this->syncWithLegacyOrder($catId, $pnos);
            } else {
                $this->syncWithDefaultOrder($catId);
            }
        }

        $cache->invalidate(['categories', 'pages', 'products']);
        $this->info('Cache invalidated successfully.');

        return self::SUCCESS;
    }

    /**
     * Sync sort_order using exact legacy product display order from Cafe24.
     */
    protected function syncWithLegacyOrder(int $catId, array $pnos): void
    {
        $productMap = Product::whereIn('legacy_product_id', $pnos)
            ->pluck('id', 'legacy_product_id')
            ->all();

        $records = DB::table('category_product')
            ->where('category_id', $catId)
            ->whereNull('deleted_at')
            ->select(['id', 'product_id', 'sort_order'])
            ->get();
        $recordsByProductId = $records->keyBy('product_id');

        $order = 1000;
        $processedProductIds = [];
        $changes = [];

        foreach ($pnos as $pno) {
            $productId = $productMap[(int) $pno] ?? ($productMap[(string) $pno] ?? null);
            $record = $productId ? $recordsByProductId->get($productId) : null;
            if (! $record) {
                continue;
            }

            $processedProductIds[(int) $productId] = true;
            if ((int) $record->sort_order !== $order) {
                $changes[(int) $record->id] = $order;
            }
            $order += 1000;
        }

        // Remaining products in category_product not in legacy list (e.g., new/inactive items)
        $remaining = $records
            ->reject(fn (object $record): bool => isset($processedProductIds[(int) $record->product_id]))
            ->sortBy('product_id');

        foreach ($remaining as $record) {
            if ((int) $record->sort_order !== $order) {
                $changes[(int) $record->id] = $order;
            }
            $order += 1000;
        }

        $updated = $this->batchUpdateSortOrders($changes);
        $totalCount = $records->count();
        $this->info("Processed {$totalCount} products in category {$catId} using legacy order (".count($processedProductIds)." matched legacy, {$updated} changed).");
    }

    /**
     * Fallback: Sync sequentially by product_id ASC.
     */
    protected function syncWithDefaultOrder(int $catId): void
    {
        $records = DB::table('category_product')
            ->where('category_id', $catId)
            ->whereNull('deleted_at')
            ->orderBy('product_id', 'asc')
            ->select(['id', 'product_id', 'sort_order'])
            ->get();

        $order = 1000;
        $changes = [];
        foreach ($records as $record) {
            if ((int) $record->sort_order !== $order) {
                $changes[(int) $record->id] = $order;
            }
            $order += 1000;
        }

        $updated = $this->batchUpdateSortOrders($changes);
        $this->info("Processed {$records->count()} products in category {$catId} using default order ({$updated} changed).");
    }

    /**
     * Update many pivot rows in a small number of statements rather than one
     * UPDATE per product. IDs and sort positions are integers generated here,
     * so embedding them in the CASE expression is safe.
     *
     * @param array<int, int> $changes category_product.id => sort_order
     */
    protected function batchUpdateSortOrders(array $changes): int
    {
        if ($changes === []) {
            return 0;
        }

        $batchSize = max(1, min((int) $this->option('batch'), 1000));
        $updated = 0;

        foreach (array_chunk($changes, $batchSize, true) as $batch) {
            $ids = array_map('intval', array_keys($batch));
            $cases = [];
            foreach ($batch as $id => $sortOrder) {
                $cases[] = 'WHEN '.(int) $id.' THEN '.(int) $sortOrder;
            }

            $caseSql = 'CASE id '.implode(' ', $cases).' ELSE sort_order END';
            $updated += DB::update(
                'UPDATE category_product SET sort_order = '.$caseSql.', updated_at = ? WHERE id IN ('.implode(', ', $ids).')',
                [now()]
            );
        }

        return $updated;
    }
}
