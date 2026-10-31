<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\ExcelHistoryStatus;
use App\Http\Controllers\Api\BaseController;
use App\Http\Exports\Admin\AdminProductOptionGroupExport;
use App\Http\Requests\Admin\ProductOptionGroup\AdminProductOptionGroupAssignProductsRequest;
use App\Http\Requests\Admin\ProductOptionGroup\AdminProductOptionGroupExportRequest;
use App\Http\Requests\Admin\ProductOptionGroup\AdminProductOptionGroupListRequest;
use App\Http\Requests\Admin\ProductOptionGroup\AdminProductOptionGroupStoreRequest;
use App\Http\Requests\Admin\ProductOptionGroup\AdminProductOptionGroupUpdateRequest;
use App\Http\Resources\Admin\AdminProductOptionGroupDetailResource;
use App\Http\Resources\AdminExportHistory;
use App\Models\ExportHistory;
use App\Services\Admin\AdminExportHistoryService;
use App\Services\Admin\AdminProductOptionGroupService;
use App\Services\Cache;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class AdminProductOptionGroupController extends BaseController
{
    public function __construct(
        protected AdminProductOptionGroupService $adminProductOptionGroupService,
        protected AdminExportHistoryService $adminExportHistoryService,
        protected Cache $cache
    ) {}

    public function index(AdminProductOptionGroupListRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $perPage = (int) ($filters['per_page'] ?? 20);

            $result = $this->adminProductOptionGroupService->getProductOptionGroups($filters, $perPage);

            return $this->responsePaginatedSuccess(200, '상품 옵션 그룹 목록이 성공적으로 조회되었습니다.', $result);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    public function show(int $id): JsonResponse
    {
        try {
            $group = $this->adminProductOptionGroupService->getProductOptionGroup($id);

            return $this->responseSuccess(200, '상품 옵션 그룹이 성공적으로 조회되었습니다.', [
                'product_option_group' => new AdminProductOptionGroupDetailResource($group),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    public function store(AdminProductOptionGroupStoreRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();

            $group = $this->adminProductOptionGroupService->createProductOptionGroup($data);
            $this->cache->invalidate('products');

            return $this->responseSuccess(201, '상품 옵션 그룹이 성공적으로 생성되었습니다.', [
                'product_option_group' => new AdminProductOptionGroupDetailResource($group->load(['options'])),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    public function update(AdminProductOptionGroupUpdateRequest $request, int $id): JsonResponse
    {
        try {
            $data = $request->validated();

            $group = $this->adminProductOptionGroupService->updateProductOptionGroup($id, $data);
            $this->cache->invalidate('products');

            return $this->responseSuccess(200, '상품 옵션 그룹이 성공적으로 수정되었습니다.', [
                'product_option_group' => new AdminProductOptionGroupDetailResource($group->load(['options'])),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    public function assignProducts(AdminProductOptionGroupAssignProductsRequest $request, int $id): JsonResponse
    {
        try {
            $productIds = $request->validated()['product_ids'];

            $group = $this->adminProductOptionGroupService->assignProducts($id, $productIds);
            $this->cache->invalidate('products');

            return $this->responseSuccess(200, '상품 옵션 그룹에 상품이 성공적으로 할당되었습니다.', [
                'product_option_group' => new AdminProductOptionGroupDetailResource($group->load(['options', 'products'])),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->adminProductOptionGroupService->deleteProductOptionGroup($id);
            $this->cache->invalidate('products');

            return $this->responseSuccess(200, '상품 옵션 그룹이 성공적으로 삭제되었습니다.');
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    public function exportExcel(AdminProductOptionGroupExportRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();

            $history = $this->adminExportHistoryService->executeExcel(
                AdminProductOptionGroupExport::class,
                $filters,
                $request->user()->id,
                'exports',
                'product-option-groups'
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
                'message' => '상품 옵션 그룹 엑셀 내보내기에 실패했습니다.',
                'error' => $th->getMessage(),
            ], 500);
        }
    }

    public function checkProgressStatus(ExportHistory $history): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'history' => new AdminExportHistory($history),
            ],
        ]);
    }

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
