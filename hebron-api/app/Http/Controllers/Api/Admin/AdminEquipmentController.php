<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Admin\Equipment\AdminCreateEquipmentLogRequest;
use App\Http\Requests\Admin\Equipment\AdminCreateEquipmentRequest;
use App\Http\Requests\Admin\Equipment\AdminGetEquipmentRequest;
use App\Http\Requests\Admin\Equipment\AdminUpdateEquipmentRequest;
use App\Http\Resources\Admin\AdminEquipmentLogResource;
use App\Http\Resources\Admin\AdminEquipmentResource;
use App\Services\Admin\AdminEquipmentService;
use App\Services\PaginationService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;

class AdminEquipmentController extends BaseController
{
    public function __construct(
        protected AdminEquipmentService $adminEquipmentService,
        protected PaginationService $paginationService,
    ) {}

    public function index(AdminGetEquipmentRequest $request): JsonResponse
    {
        try {
            $equipments = $this->adminEquipmentService->getList(
                searchType: $request->input('search_type'),
                keyword: $request->input('keyword'),
                workProcess: $request->input('work_process'),
                status: $request->input('status'),
                perPage: (int) $request->input('per_page', 15),
            );

            return $this->responsePaginatedSuccess(200, '장비 목록이 성공적으로 조회되었습니다.', [
                'equipments' => AdminEquipmentResource::collection($equipments->items()),
            ], $this->paginationService->format($equipments));
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function show(int $id): JsonResponse
    {
        try {
            $equipment = $this->adminEquipmentService->getById($id);

            return response()->json([
                'success' => true,
                'data' => ['equipment' => new AdminEquipmentResource($equipment)],
            ]);
        } catch (ModelNotFoundException) {
            return response()->json(['success' => false, 'message' => '장비를 찾을 수 없습니다.'], 404);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function store(AdminCreateEquipmentRequest $request): JsonResponse
    {
        try {
            $equipment = $this->adminEquipmentService->create($request->validated());

            return response()->json([
                'success' => true,
                'message' => '장비 등록 성공',
                'data' => ['equipment' => new AdminEquipmentResource($equipment)],
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function update(AdminUpdateEquipmentRequest $request, int $id): JsonResponse
    {
        try {
            $equipment = $this->adminEquipmentService->update($id, $request->validated());

            return response()->json([
                'success' => true,
                'message' => '장비 수정 성공',
                'data' => ['equipment' => new AdminEquipmentResource($equipment)],
            ]);
        } catch (ModelNotFoundException) {
            return response()->json(['success' => false, 'message' => '장비를 찾을 수 없습니다.'], 404);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->adminEquipmentService->delete($id);

            return response()->json(['success' => true, 'message' => '장비 삭제 성공']);
        } catch (ModelNotFoundException) {
            return response()->json(['success' => false, 'message' => '장비를 찾을 수 없습니다.'], 404);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function logs(int $id): JsonResponse
    {
        try {
            $logs = $this->adminEquipmentService->getLogs($id);

            return response()->json([
                'success' => true,
                'data' => ['logs' => AdminEquipmentLogResource::collection($logs)],
            ]);
        } catch (ModelNotFoundException) {
            return response()->json(['success' => false, 'message' => '장비를 찾을 수 없습니다.'], 404);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function storeLog(AdminCreateEquipmentLogRequest $request, int $id): JsonResponse
    {
        try {
            $log = $this->adminEquipmentService->createLog($id, $request->validated());

            return response()->json([
                'success' => true,
                'message' => '장비 로그 등록 성공',
                'data' => ['log' => new AdminEquipmentLogResource($log)],
            ], 201);
        } catch (ModelNotFoundException) {
            return response()->json(['success' => false, 'message' => '장비를 찾을 수 없습니다.'], 404);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function destroyLog(int $id, int $logId): JsonResponse
    {
        try {
            $this->adminEquipmentService->deleteLog($id, $logId);

            return response()->json(['success' => true, 'message' => '장비 로그 삭제 성공']);
        } catch (ModelNotFoundException) {
            return response()->json(['success' => false, 'message' => '로그를 찾을 수 없습니다.'], 404);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
