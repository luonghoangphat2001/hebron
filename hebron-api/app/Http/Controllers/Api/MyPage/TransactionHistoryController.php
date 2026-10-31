<?php

namespace App\Http\Controllers\Api\MyPage;

use App\Http\Controllers\Api\BaseController;
use App\Services\MyPage\MyPageTransactionHistoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TransactionHistoryController extends BaseController
{
    public function __construct(
        protected MyPageTransactionHistoryService $service,
    ) {}

    /**
     * GET /api/mypage/transaction-history
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'months' => 'nullable|integer|in:1,3,6',
            'search' => 'nullable|string|max:100',
        ]);

        try {
            $result = $this->service->getList(
                $request->user(),
                $request->only(['months', 'search'])
            );

            return $this->responseSuccess(200, 'successfully', $result);
        } catch (\Throwable $e) {
            return $this->responseError(500, '거래내역을 가져오는 중 오류가 발생했습니다.', [$e->getMessage()]);
        }
    }
}
