<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Admin\Inquiry\AdminInquiryStatisticsRequest;
use App\Services\Admin\AdminInquiryStatisticsService;
use Illuminate\Http\JsonResponse;

class AdminInquiryStatisticsController extends BaseController
{
    public function __construct(
        protected AdminInquiryStatisticsService $adminInquiryStatisticsService
    ) {}

    /**
     * Get inquiry statistics
     */
    public function index(AdminInquiryStatisticsRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();

            $customerIds = $validated['customer_ids'] ?? [];
            if (is_string($customerIds)) {
                $customerIds = explode(',', $customerIds);
            }

            $config = [];
            if (isset($validated['start_date']) && isset($validated['end_date'])) {
                $config['start_date'] = $validated['start_date'];
                $config['end_date'] = $validated['end_date'];
            } else {
                $period = $validated['period'] ?? '30d';
                $config = $this->adminInquiryStatisticsService->periodConfig($period);
            }

            $data = $this->adminInquiryStatisticsService->getInquiryStatistics($customerIds, $config);

            return $this->responseSuccess(200, '문의 통계 데이터가 성공적으로 조회되었습니다.', $data);
        } catch (\Exception $e) {
            return $this->responseError(500, '문의 통계 데이터 조회에 실패하였습니다.', [$e->getMessage()]);
        }
    }
}
