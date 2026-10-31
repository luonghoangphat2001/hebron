<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Admin\UnitPrice\AdminUnitPriceItemStoreRequest;
use App\Http\Requests\Admin\UnitPrice\AdminUnitPriceItemUpdateRequest;
use App\Http\Requests\Admin\UnitPrice\AdminUnitPriceListRequest;
use App\Http\Requests\Admin\UnitPrice\AdminUnitPriceStoreRequest;
use App\Http\Requests\Admin\UnitPrice\AdminUnitPriceUpdateRequest;
use App\Services\Admin\AdminUnitPriceService;
use App\Services\PaginationService;
use Illuminate\Http\JsonResponse;

class AdminUnitPriceController extends BaseController
{
    public function __construct(
        protected AdminUnitPriceService $unitPriceService,
        protected PaginationService $paginationService,
    ) {}

    public function index(AdminUnitPriceListRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $perPage = (int) ($filters['per_page'] ?? 20);

            $unitPrices = $this->unitPriceService->getUnitPrices($filters, $perPage);

            return $this->responsePaginatedSuccess(200, '단가 목록이 성공적으로 조회되었습니다.', [
                'unit_prices' => $unitPrices->items(),
            ], $this->paginationService->format($unitPrices));
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function show(int $id): JsonResponse
    {
        try {
            $unitPrice = $this->unitPriceService->getUnitPrice($id);

            return response()->json([
                'success' => true,
                'data' => ['unit_price' => $unitPrice],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function store(AdminUnitPriceStoreRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();
            $unitPrice = $this->unitPriceService->createUnitPrice($request->user(), $data);

            return response()->json([
                'success' => true,
                'message' => 'Unit price created successfully',
                'data' => ['unit_price' => $unitPrice],
            ], 201);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function update(AdminUnitPriceUpdateRequest $request, int $id): JsonResponse
    {
        try {
            $data = $request->validated();
            $unitPrice = $this->unitPriceService->updateUnitPrice($id, $data, $request->user());

            return response()->json([
                'success' => true,
                'message' => 'Unit price updated successfully',
                'data' => ['unit_price' => $unitPrice],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->unitPriceService->deleteUnitPrice($id);

            return response()->json([
                'success' => true,
                'message' => 'Unit price deleted successfully',
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function toggleStatus(int $id): JsonResponse
    {
        try {
            $unitPrice = $this->unitPriceService->toggleStatus($id);

            return response()->json([
                'success' => true,
                'message' => 'Unit price status toggled successfully',
                'data' => ['unit_price' => $unitPrice],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function items(int $unitPriceId): JsonResponse
    {
        try {
            $items = $this->unitPriceService->getItemsByUnitPrice($unitPriceId, []);

            return response()->json([
                'success' => true,
                'data' => ['items' => $items],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function storeItem(AdminUnitPriceItemStoreRequest $request, int $unitPriceId): JsonResponse
    {
        try {
            $data = $request->validated();
            $item = $this->unitPriceService->createItem($request->user(), $unitPriceId, $data);

            return response()->json([
                'success' => true,
                'message' => 'Unit price item created successfully',
                'data' => ['item' => $item],
            ], 201);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function updateItem(AdminUnitPriceItemUpdateRequest $request, int $id): JsonResponse
    {
        try {
            $data = $request->validated();
            $item = $this->unitPriceService->updateItem($id, $data, $request->user());

            return response()->json([
                'success' => true,
                'message' => 'Unit price item updated successfully',
                'data' => ['item' => $item],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function destroyItem(int $id): JsonResponse
    {
        try {
            $this->unitPriceService->deleteItem($id);

            return response()->json([
                'success' => true,
                'message' => 'Unit price item deleted successfully',
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }
}
