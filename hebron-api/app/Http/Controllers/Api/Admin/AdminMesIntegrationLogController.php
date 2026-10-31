<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Admin\MesIntegrationLog\AdminMesIntegrationLogListRequest;
use App\Http\Resources\Admin\AdminMesIntegrationLogDetailResource;
use App\Http\Resources\Admin\AdminMesIntegrationLogResource;
use App\Services\Admin\AdminMesIntegrationLogService;
use App\Services\PaginationService;
use Illuminate\Http\JsonResponse;

class AdminMesIntegrationLogController extends BaseController
{
    public function __construct(
        protected AdminMesIntegrationLogService $mesIntegrationLogService,
        protected PaginationService $paginationService,
    ) {}

    /**
     * Get list of MES integration logs for Super Admin.
     */
    public function index(AdminMesIntegrationLogListRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $perPage = (int) ($filters['per_page'] ?? 20);

            $paginator = $this->mesIntegrationLogService->getLogs($filters, $perPage);

            return $this->responsePaginatedSuccess(200, 'MES 연동 로그 목록이 성공적으로 조회되었습니다.', [
                'mes_integration_logs' => AdminMesIntegrationLogResource::collection($paginator->items()),
            ], $this->paginationService->format($paginator));
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

/**
     * Get MES integration log dashboard statistics.
     */
    public function dashboard(): JsonResponse
    {
        try {
            $stats = $this->mesIntegrationLogService->getDashboardStats();

            return $this->responseSuccess(200, 'MES 연동 로그 대시보드 정보가 성공적으로 조회되었습니다.', [
                'dashboard' => $stats,
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }

    /**
     * Get single MES integration log detail.
     */
    public function show(int $id): JsonResponse
    {
        try {
            $log = $this->mesIntegrationLogService->getLog($id);

            return $this->responseSuccess(200, 'MES 연동 로그가 성공적으로 조회되었습니다.', [
                'mes_integration_log' => new AdminMesIntegrationLogDetailResource($log),
            ]);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }
}
