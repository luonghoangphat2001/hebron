<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Admin\PrintingPrice\AdminPrintingPriceItemStoreRequest;
use App\Http\Requests\Admin\PrintingPrice\AdminPrintingPriceItemUpdateRequest;
use App\Http\Requests\Admin\PrintingPrice\AdminPrintingPriceListRequest;
use App\Http\Requests\Admin\PrintingPrice\AdminPrintingPriceStoreRequest;
use App\Http\Requests\Admin\PrintingPrice\AdminPrintingPriceUpdateRequest;
use App\Services\Admin\AdminPrintingPriceService;
use App\Services\PaginationService;
use Illuminate\Http\JsonResponse;

class PrintingPriceController extends BaseController
{
    public function __construct(
        protected AdminPrintingPriceService $printingPriceService,
        protected PaginationService $paginationService
    ) {}

    /**
     * Get list of printing prices.
     */
    public function index(AdminPrintingPriceListRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $perPage = (int) ($filters['per_page'] ?? 20);

            $paginator = $this->printingPriceService->getPrintingPrices($filters, $perPage);

            return $this->responsePaginatedSuccess(200, 'Printing prices retrieved successfully.', [
                'printing_prices' => $paginator->items(),
            ], $this->paginationService->format($paginator));
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Get single printing price detail.
     */
    public function show(int $id): JsonResponse
    {
        try {
            $printingPrice = $this->printingPriceService->getPrintingPrice($id);

            return $this->responseSuccess(200, 'Printing price retrieved successfully.', [
                'printing_price' => $printingPrice,
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Create a new printing price.
     */
    public function store(AdminPrintingPriceStoreRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();
            $printingPrice = $this->printingPriceService->createPrintingPrice($data);

            return $this->responseSuccess(201, 'Printing price created successfully.', [
                'printing_price' => $printingPrice,
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Update a printing price.
     */
    public function update(AdminPrintingPriceUpdateRequest $request, int $id): JsonResponse
    {
        try {
            $data = $request->validated();
            $printingPrice = $this->printingPriceService->updatePrintingPrice($id, $data);

            return $this->responseSuccess(200, 'Printing price updated successfully.', [
                'printing_price' => $printingPrice,
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Delete a printing price.
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $this->printingPriceService->deletePrintingPrice($id);

            return $this->responseSuccess(200, 'Printing price deleted successfully.');
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    public function items(int $printingPriceId): JsonResponse
    {
        try {
            $items = $this->printingPriceService->getPrintingPriceItems($printingPriceId);

            return $this->responseSuccess(200, 'Printing price items retrieved successfully.', [
                'items' => $items,
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    public function storeItem(AdminPrintingPriceItemStoreRequest $request, int $printingPriceId): JsonResponse
    {
        try {
            $data = $request->validated();
            $item = $this->printingPriceService->createPrintingPriceItem($printingPriceId, $data);

            return $this->responseSuccess(201, 'Printing price item created successfully.', [
                'item' => $item,
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    public function updateItem(AdminPrintingPriceItemUpdateRequest $request, int $id): JsonResponse
    {
        try {
            $data = $request->validated();
            $item = $this->printingPriceService->updatePrintingPriceItem($id, $data);

            return $this->responseSuccess(200, 'Printing price item updated successfully.', [
                'item' => $item,
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    public function destroyItem(int $id): JsonResponse
    {
        try {
            $this->printingPriceService->deletePrintingPriceItem($id);

            return $this->responseSuccess(200, 'Printing price item deleted successfully.');
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }
}
