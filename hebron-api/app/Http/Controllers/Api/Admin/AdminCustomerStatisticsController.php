<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseController;
use App\Http\Exports\Admin\AdminCustomerStatisticsExport;
use App\Http\Requests\Admin\AdminCustomerStatistics\AdminCustomerStatisticsRequest;
use App\Http\Resources\AdminExportHistory;
use App\Services\Admin\AdminCustomerStatisticsService;
use App\Services\Admin\AdminExportHistoryService;
use Illuminate\Http\JsonResponse;

class AdminCustomerStatisticsController extends BaseController
{
    public function __construct(
        protected AdminCustomerStatisticsService $customerStatisticsService,
        protected AdminExportHistoryService $exportHistoryService
    ) {}

    public function index(AdminCustomerStatisticsRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            $data = $this->customerStatisticsService->getCustomerStatistics($filters);

            if ($request->boolean('export')) {
                $history = $this->exportHistoryService->executeExcel(
                    AdminCustomerStatisticsExport::class,
                    $data,
                    $request->user()->id,
                    'customer_statistics',
                    'customer_statistics'
                );

                return $this->responseSuccess(200, '고객 통계 내보내기 요청이 접수되었습니다.', new AdminExportHistory($history));
            }

            return $this->responseSuccess(200, '고객 통계 데이터가 성공적으로 조회되었습니다.', $data);
        } catch (\Throwable $e) {
            return $this->responseError($this->resolveStatusCode($e), $e->getMessage());
        }
    }
}
