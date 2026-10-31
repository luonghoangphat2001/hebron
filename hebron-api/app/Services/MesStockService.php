<?php

namespace App\Services;

use App\Integrations\Mes\MESOrderIntegration;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MesStockService
{
    public function __construct(
        protected MESOrderIntegration $mesIntegration,
        protected Cache $cache,
    ) {}

    /**
     * Synchronize stock from MES or commit manual items.
     * Supports:
     * - Manual commit: when manualItems is provided.
     * - Option 1 (Sync All): when productId and productCode are null.
     * - Option 2 (Sync 1 Product): when productId or productCode is specified.
     */
    public function syncStock(
        ?string $sid = null,
        ?string $stockRequestNo = null,
        ?int $referenceId = null,
        ?int $productId = null,
        ?string $productCode = null,
        ?array $manualItems = null
    ): array {
        if (! empty($manualItems)) {
            return [
                'success' => true,
                'message' => 'MES stock committed successfully.',
                'data' => $this->commitStock($manualItems),
            ];
        }

        $sid = $sid ?: config('services.mes.sid', 'withaward');
        $stockRequestNo = $stockRequestNo ?: 'stock_'.now()->format('YmdHis');
        $referenceId = $referenceId ?? 0;

        $targetLookup = $this->findProductForSync($productId, $productCode);
        if (isset($targetLookup['error'])) {
            return $targetLookup['error'];
        }

        if ($targetLookup['product'] instanceof Product) {
            return $this->syncSingleProductStock($targetLookup['product'], $sid, $stockRequestNo, $referenceId);
        }

        return $this->syncAllStock($sid, $stockRequestNo, $referenceId);
    }

    /**
     * Option 1: Synchronize stock for all MES-enabled products.
     */
    public function syncAllStock(string $sid, string $stockRequestNo, int $referenceId): array
    {
        $fetchResult = $this->requestMesStock($sid, $stockRequestNo, $referenceId);
        if (! ($fetchResult['success'] ?? false)) {
            return $fetchResult;
        }

        $commitResult = $this->commitStock($fetchResult['items']);

        return [
            'success' => true,
            'message' => 'MES stock synchronized successfully.',
            'data' => array_merge([
                'stock_request_no' => $stockRequestNo,
            ], $commitResult),
        ];
    }

    /**
     * Option 2: Synchronize stock for a single specified product.
     */
    public function syncSingleProductStock(Product $product, string $sid, string $stockRequestNo, int $referenceId): array
    {
        if (! $product->mes_inventory_enabled) {
            return [
                'success' => false,
                'status_code' => 422,
                'message' => "MES inventory synchronization is disabled for product '{$product->sku}'.",
                'data' => [
                    'product_id' => $product->id,
                    'sku' => $product->sku,
                    'mes_inventory_enabled' => false,
                ],
            ];
        }

        $fetchResult = $this->requestMesStock($sid, $stockRequestNo, $referenceId, $product->sku);
        if (! ($fetchResult['success'] ?? false)) {
            return $fetchResult;
        }

        $matchedItem = $this->findMatchingItemForProduct($fetchResult['items'], $product->sku);
        if (! $matchedItem) {
            return [
                'success' => false,
                'status_code' => 404,
                'message' => "Stock for product '{$product->sku}' was not found in MES.",
                'data' => [
                    'product_id' => $product->id,
                    'sku' => $product->sku,
                    'stock_request_no' => $stockRequestNo,
                ],
            ];
        }

        $qty = $matchedItem['qty'] ?? $matchedItem['quantity'] ?? $matchedItem['amount'] ?? null;
        if ($qty === null) {
            return [
                'success' => false,
                'status_code' => 422,
                'message' => "Invalid quantity returned by MES for product '{$product->sku}'.",
            ];
        }

        $stockUpdate = $this->applyProductStockQuantity($product, (int) $qty);

        return [
            'success' => true,
            'message' => "MES stock for product '{$product->sku}' synchronized successfully.",
            'data' => [
                'stock_request_no' => $stockRequestNo,
                'product_id' => $product->id,
                'sku' => $product->sku,
                'old_qty' => $stockUpdate['old_qty'],
                'new_qty' => $stockUpdate['new_qty'],
            ],
        ];
    }

    /**
     * Request stock data from MES API endpoint.
     */
    protected function requestMesStock(string $sid, string $stockRequestNo, int $referenceId, ?string $productCode = null): array
    {
        $response = $this->mesIntegration->stockInfo($sid, $stockRequestNo, $referenceId, $productCode);

        $code = $response['code'] ?? null;
        $hasValidCode = ($code === 'success' || $code === 200);
        $hasData = isset($response['data']) || isset($response['items']) || (array_is_list($response) && ! empty($response) && is_array($response[0]));

        if (! $hasValidCode && ! $hasData) {
            Log::error('MES stock sync failed', [
                'sid' => $sid,
                'stock_request_no' => $stockRequestNo,
                'product_code' => $productCode,
                'response' => $response,
            ]);

            return [
                'success' => false,
                'status_code' => 400,
                'message' => $response['message'] ?? 'Failed to retrieve stock from MES.',
                'raw_response' => $response,
            ];
        }

        return [
            'success' => true,
            'items' => $this->extractItemsFromResponse($response),
        ];
    }

    /**
     * Resolve product for single product synchronization.
     */
    protected function findProductForSync(?int $productId, ?string $productCode): array
    {
        if ($productId !== null) {
            $product = Product::find($productId);
            if (! $product) {
                return [
                    'error' => [
                        'success' => false,
                        'status_code' => 404,
                        'message' => 'Product not found.',
                    ],
                ];
            }

            return ['product' => $product];
        }

        if ($productCode !== null && $productCode !== '') {
            $product = Product::where('sku', $productCode)->first();
            if (! $product) {
                return [
                    'error' => [
                        'success' => false,
                        'status_code' => 404,
                        'message' => "Product with code '{$productCode}' not found.",
                    ],
                ];
            }

            return ['product' => $product];
        }

        return ['product' => null];
    }

    /** Find matching item from MES item list by SKU. */
    protected function findMatchingItemForProduct(array $items, string $sku): ?array
    {
        foreach ($items as $item) {
            $itemSku = $item['product_code'] ?? $item['sku'] ?? $item['prdname'] ?? null;
            if ($itemSku === $sku) {
                return $item;
            }
        }

        // If MES returned exactly 1 item without any SKU key, treat it as the targeted item
        if (count($items) === 1 && isset($items[0]['qty'])) {
            $itemSku = $items[0]['product_code'] ?? $items[0]['sku'] ?? $items[0]['prdname'] ?? null;
            if (! $itemSku) {
                return $items[0];
            }
        }

        return null;
    }

    /**
     * Apply updated stock quantity to a product and invalidate cache.
     */
    protected function applyProductStockQuantity(Product $product, int $quantity): array
    {
        $oldQty = $product->stock_quantity;
        $product->stock_quantity = max(0, $quantity);
        $product->save();

        $this->cache->invalidate(['products', 'pages']);

        return [
            'old_qty' => $oldQty,
            'new_qty' => $product->stock_quantity,
        ];
    }

    /**
     * Commit batch stock data to products table in a transaction.
     */
    public function commitStock(array $items): array
    {
        $synced = [];
        $skipped = [];
        $notFound = [];

        DB::beginTransaction();
        try {
            foreach ($items as $item) {
                $sku = $item['product_code'] ?? $item['sku'] ?? $item['prdname'] ?? null;
                if (! $sku) {
                    continue;
                }

                $qty = $item['qty'] ?? $item['quantity'] ?? $item['amount'] ?? null;
                if ($qty === null) {
                    continue;
                }

                $products = Product::where('sku', $sku)->get();
                if ($products->isEmpty()) {
                    $notFound[] = $sku;

                    continue;
                }

                foreach ($products as $product) {
                    if (! $product->mes_inventory_enabled) {
                        $skipped[] = [
                            'id' => $product->id,
                            'sku' => $product->sku,
                            'reason' => 'mes_inventory_disabled',
                        ];

                        continue;
                    }

                    $oldQty = $product->stock_quantity;
                    $product->stock_quantity = max(0, (int) $qty);
                    $product->save();

                    $synced[] = [
                        'id' => $product->id,
                        'sku' => $product->sku,
                        'old_qty' => $oldQty,
                        'new_qty' => $product->stock_quantity,
                    ];
                }
            }

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('MES commit stock failed: '.$e->getMessage(), ['exception' => $e]);
            throw $e;
        }

        $this->cache->invalidate(['products', 'pages']);

        return [
            'total_items' => count($items),
            'synced_count' => count($synced),
            'skipped_count' => count($skipped),
            'not_found_count' => count($notFound),
            'synced' => $synced,
            'skipped' => $skipped,
            'not_found_skus' => $notFound,
        ];
    }

    /**
     * Extract uniform list of items from diverse MES response structures.
     */
    protected function extractItemsFromResponse(array $response): array
    {
        if (isset($response['data']) && is_array($response['data'])) {
            return $response['data'];
        }
        if (isset($response['items']) && is_array($response['items'])) {
            return $response['items'];
        }
        if (array_is_list($response) && ! empty($response) && is_array($response[0])) {
            return $response;
        }

        return [];
    }
}
