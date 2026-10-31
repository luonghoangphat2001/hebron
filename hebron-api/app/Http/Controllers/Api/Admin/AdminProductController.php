<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\ExcelHistoryStatus;
use App\Enums\FileType;
use App\Http\Controllers\Api\BaseController;
use App\Http\Exports\Admin\AdminProductExport;
use App\Http\Requests\Admin\Product\AdminProductBulkDeleteRequest;
use App\Http\Requests\Admin\Product\AdminProductBulkUpdateRequest;
use App\Http\Requests\Admin\Product\AdminProductBulkUpdateStatusRequest;
use App\Http\Requests\Admin\Product\AdminProductCopyRequest;
use App\Http\Requests\Admin\Product\AdminProductCreateRequest;
use App\Http\Requests\Admin\Product\AdminProductExportRequest;
use App\Http\Requests\Admin\Product\AdminProductListRequest;
use App\Http\Requests\Admin\Product\AdminProductToggleStatusRequest;
use App\Http\Requests\Admin\Product\AdminProductUpdateRequest;
use App\Http\Requests\Admin\Product\AdminProductUploadImagesRequest;
use App\Http\Resources\Admin\AdminProductListResource;
use App\Http\Resources\Admin\AdminProductResource;
use App\Http\Resources\AdminExportHistory;
use App\Models\ExportHistory;
use App\Models\Product;
use App\Services\Admin\AdminExportHistoryService;
use App\Services\Admin\AdminProductService;
use App\Services\Cache;
use App\Services\FileService;
use App\Services\MesStockService;
use App\Services\PaginationService;
use App\Services\SortOrderService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class AdminProductController extends BaseController
{
    public function __construct(
        protected AdminProductService $adminProductService,
        protected AdminExportHistoryService $adminExportHistoryService,
        protected PaginationService $paginationService,
        protected FileService $fileService,
        protected Cache $cache,
        protected SortOrderService $sortOrderService,
    ) {}

    /**
     * Update product MES inventory settings
     * 제품 MES 재고 설정 수정
     */
    public function updateMesSettings(Request $request, int|string $id): JsonResponse
    {
        $validated = $request->validate([
            'mes_inventory_enabled' => 'required|boolean',
        ]);

        try {
            $product = Product::findOrFail($id);
            $product->update($validated);

            return response()->json([
                'success' => true,
                'data' => [
                    'product' => new AdminProductResource($product),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update MES inventory settings.',
            ], 500);
        }
    }

    /**
     * Sync stock from MES
     * MES 재고 동기화 (관리자)
     * Supports:
     * - Option 1: Sync all when product_id and product_code are omitted.
     * - Option 2: Sync 1 product when product_id or product_code is provided.
     */
    public function syncStock(Request $request, MesStockService $mesStockService): JsonResponse
    {
        try {
            $sid = $request->input('sid');
            $stockRequestNo = $request->input('stock_request_no');
            $productId = $request->input('product_id') ? (int) $request->input('product_id') : null;
            $productCode = $request->input('product_code');
            $items = $request->input('items');

            $result = $mesStockService->syncStock(
                sid: $sid,
                stockRequestNo: $stockRequestNo,
                referenceId: $request->user()?->id,
                productId: $productId,
                productCode: $productCode,
                manualItems: $items
            );

            if (! ($result['success'] ?? false)) {
                return response()->json($result, $result['status_code'] ?? 400);
            }

            return response()->json($result);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Sync stock for a specific product from MES
     * 단일 제품 MES 재고 동기화 (관리자)
     */
    public function syncProductStock(Request $request, int|string $id, MesStockService $mesStockService): JsonResponse
    {
        try {
            $product = is_numeric($id)
                ? Product::find($id)
                : Product::where('sku', $id)->orWhere('slug', $id)->first();

            if (! $product) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product not found.',
                ], 404);
            }

            $sid = $request->input('sid');
            $stockRequestNo = $request->input('stock_request_no');

            $result = $mesStockService->syncStock(
                sid: $sid,
                stockRequestNo: $stockRequestNo,
                referenceId: $request->user()?->id,
                productId: $product->id,
            );

            if (! ($result['success'] ?? false)) {
                return response()->json($result, $result['status_code'] ?? 400);
            }

            return response()->json($result);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    public function moveToPosition(
        Request $request,
        int|string $id
    ) {
        $data = $request->validate([
            'position' => [
                'required',
                'integer',
                'min:1',
            ],
        ]);

        $product = Product::findOrFail($id);
        $oldSortOrder = (int) $product->sort_order;

        $sortOrder = $this->sortOrderService->moveToPosition(
            model: $product,
            position: $data['position'],
        );

        Log::info('Admin product position changed', [
            'product_id' => $product->id,
            'legacy_product_id' => $product->legacy_product_id,
            'sku' => $product->sku,
            'product_name' => $product->name,
            'old_sort_order' => $oldSortOrder,
            'requested_position' => $data['position'],
            'new_sort_order' => $sortOrder,
            'user_id' => $request->user()?->id,
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Product moved successfully.',
            'data' => [
                'id' => $product->id,
                'position' => $data['position'],
                'sort_order' => $sortOrder,
            ],
        ]);
    }

    /**
     * Get search filter options for products
     * 제품 목록 검색 필터 조회
     */
    public function searchFilters(): JsonResponse
    {
        try {
            $filters = $this->adminProductService->getSearchFilters();

            return response()->json([
                'success' => true,
                'data' => [
                    'filters' => $filters,
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Get product list for admin with filters
     * 제품 목록 조회 (관리자) - 템플릿 목록, 맞춤제품 목록, 홍보물 목록, 파일주문 제품목록
     */
    public function index(AdminProductListRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $perPage = (int) ($filters['per_page'] ?? 20);

            $products = $this->adminProductService->getProductsForAdmin($filters, $perPage);

            return $this->responsePaginatedSuccess(200, '상품 목록이 성공적으로 조회되었습니다.', [
                'products' => AdminProductListResource::collection($products->items()),
            ], $this->paginationService->format($products));
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Get product detail for admin
     * 제품 상세 조회 (관리자)
     */
    public function show(int|string $id): JsonResponse
    {
        try {
            // Admin can view deleted products if requested
            $includeDeleted = request()->boolean('include_deleted', false);

            $product = $this->adminProductService->getProductForAdmin($id, $includeDeleted);

            return response()->json([
                'success' => true,
                'data' => [
                    'product' => new AdminProductResource($product),
                ],
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '제품을 찾을 수 없습니다.',
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Create a new product
     * 제품 생성 (관리자)
     */
    public function store(AdminProductCreateRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();

            $product = $this->adminProductService->createProduct($validated);
            $this->cache->invalidate(['products', 'pages']);

            return response()->json([
                'success' => true,
                'message' => '제품이 성공적으로 생성되었습니다.',
                'data' => [
                    'product' => new AdminProductResource($product),
                ],
            ], 201);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Update a product
     * 제품 수정 (관리자)
     */
    public function update(AdminProductUpdateRequest $request, int|string $id): JsonResponse
    {
        try {
            $validated = $request->validated();

            $product = $this->adminProductService->updateProduct($id, $validated);
            $this->cache->invalidate(['products', 'pages']);

            return response()->json([
                'success' => true,
                'message' => '제품이 성공적으로 수정되었습니다.',
                'data' => [
                    'product' => new AdminProductResource($product),
                ],
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '제품을 찾을 수 없습니다.',
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Delete a product (soft delete)
     * 제품 삭제 (관리자)
     */
    public function destroy(int|string $id): JsonResponse
    {
        try {
            $this->adminProductService->deleteProduct($id);
            $this->cache->invalidate(['products', 'pages']);

            return response()->json([
                'success' => true,
                'message' => '제품이 성공적으로 삭제되었습니다.',
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '제품을 찾을 수 없습니다.',
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Get copy preview data for product copy modal.
     */
    public function copyPreview(int|string $id): JsonResponse
    {
        try {
            $preview = $this->adminProductService->getProductCopyPreview($id);

            return response()->json([
                'success' => true,
                'data' => $preview,
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '제품을 찾을 수 없습니다.',
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Copy product with templates, customers, erpOptions.
     */
    public function copy(AdminProductCopyRequest $request, int|string $id): JsonResponse
    {
        try {
            $copyTitle = (string) $request->validated()['copy_title'];
            $product = $this->adminProductService->copyProduct($id, $copyTitle);
            $this->cache->invalidate(['products', 'pages']);

            return response()->json([
                'success' => true,
                'message' => '제품이 복사되어 생성되었습니다.',
                'data' => [
                    'product' => new AdminProductResource($product),
                ],
            ], 201);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '제품을 찾을 수 없습니다.',
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Toggle product status (is_active, is_popular, is_featured)
     * 제품 상태 변경 (관리자)
     */
    public function toggleStatus(AdminProductToggleStatusRequest $request, int|string $id): JsonResponse
    {
        try {
            $validated = $request->validated();
            $field = $validated['field'];
            $value = $validated['value'] ?? null; // null means toggle

            $product = $this->adminProductService->toggleProductStatus($id, $field, $value);
            $this->cache->invalidate(['products', 'pages']);

            return response()->json([
                'success' => true,
                'message' => '제품 상태가 성공적으로 변경되었습니다.',
                'data' => [
                    'product' => new AdminProductResource($product),
                ],
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '제품을 찾을 수 없습니다.',
            ], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Upload product images
     * 제품 이미지 업로드 (관리자)
     * 제품 이미지를 업로드하세요 (Upload product images)
     * Upload product images (max 5 images). For Product List / create / update product_images field.
     */
    public function uploadImages(AdminProductUploadImagesRequest $request): JsonResponse
    {
        try {
            $files = $request->file('images');
            $files = is_array($files) ? $files : ($files ? [$files] : []);

            $paths = [];
            foreach ($files as $file) {
                $path = $file->store('products/images', config('filesystems.public_disk'));
                $paths[] = Storage::disk(config('filesystems.public_disk'))->url($path);
                $this->fileService->create($file, $path, FileType::PRODUCT_IMAGES, $request->user());
            }

            return response()->json([
                'success' => true,
                'message' => 'Product images uploaded successfully',
                'data' => [
                    'product_images' => $paths,
                ],
            ], 201);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Bulk update product status
     * 제품 상태 일괄 변경 (관리자)
     */
    public function bulkUpdateStatus(AdminProductBulkUpdateStatusRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            $productIds = $validated['product_ids'];
            $field = $validated['field'];
            $value = $validated['value'];

            $result = $this->adminProductService->bulkUpdateStatus($productIds, $field, $value);
            $this->cache->invalidate(['products', 'pages']);

            return response()->json([
                'success' => true,
                'message' => '제품 상태가 성공적으로 변경되었습니다.',
                'data' => $result,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Bulk update products
     * 제품 일괄 수정 (관리자)
     * Supports updating: category_ids, selling_price, stock_quantity, sort_order
     */
    public function bulkUpdate(AdminProductBulkUpdateRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            $productIds = $validated['product_ids'];
            $data = Arr::only($validated, ['category_ids', 'selling_price', 'stock_quantity', 'sort_order']);

            $result = $this->adminProductService->bulkUpdate($productIds, $data);
            $this->cache->invalidate(['products', 'pages']);

            return response()->json([
                'success' => true,
                'message' => '제품이 성공적으로 일괄 수정되었습니다.',
                'data' => $result,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Bulk delete products (soft delete)
     * 제품 일괄 삭제 (관리자)
     */
    public function bulkDelete(AdminProductBulkDeleteRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            $productIds = $validated['product_ids'];

            $result = $this->adminProductService->bulkDelete($productIds);
            $this->cache->invalidate(['products', 'pages']);

            return response()->json([
                'success' => true,
                'message' => '제품이 성공적으로 삭제되었습니다.',
                'data' => $result,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }

    /**
     * Export products to Excel
     * 제품 목록 Excel 다운로드
     * Supports 3 export types: ALL, CURRENT_PAGE, SELECTED
     * Supports locale for column headings and sheet name
     */
    public function exportExcel(AdminProductExportRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();

            // Create export history and queue Excel generation
            $history = $this->adminExportHistoryService->executeExcel(
                AdminProductExport::class,
                $filters,
                $request->user()->id,
                'exports',
                'products'
            );

            return response()->json([
                'success' => true,
                'message' => '엑셀 내보내기 요청이 접수되었습니다.',
                'data' => [
                    'history' => new AdminExportHistory($history),
                ],
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'success' => false,
                'message' => '상품 엑셀 내보내기에 실패했습니다.',
                'error' => $th->getMessage(),
            ], 500);
        }
    }

    /**
     * Check progress status of product export
     * 제품 Excel 다운로드 진행 상태 확인
     */
    public function checkProgressStatus(ExportHistory $history): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'history' => new AdminExportHistory($history),
            ],
        ]);
    }

    /**
     * Download product export file
     * 제품 Excel 파일 다운로드
     */
    public function download(ExportHistory $history)
    {
        if (! $history) {
            return response()->json([
                'success' => false,
                'message' => '내보내기 이력을 찾을 수 없습니다.',
            ], 404);
        }

        if ($history->status !== ExcelHistoryStatus::COMPLETED) {
            return response()->json([
                'success' => false,
                'message' => '내보내기 작업이 아직 완료되지 않았습니다.',
            ], 400);
        }

        $disk = Storage::disk(config('filesystems.public_disk'));
        if (! $disk->exists($history->file_path)) {
            return response()->json([
                'success' => false,
                'message' => '내보내기 파일을 찾을 수 없습니다.',
            ], 404);
        }

        return $disk->download($history->file_path, $history->file_name, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="'.$history->file_name.'"',
        ]);
    }
}
