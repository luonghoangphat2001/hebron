<?php

namespace App\Http\Controllers\Api\MyPage;

use App\Http\Controllers\Api\BaseController;
use App\Http\Resources\ReceiptItemResource;
use App\Services\MyPage\MyPageReceiptService;
use App\Services\PaginationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CashReceiptController extends BaseController
{
    public function __construct(
        protected MyPageReceiptService $service,
        protected PaginationService $paginationService,
    ) {}

    /**
     * GET /api/mypage/cash-receipts
     * 현금영수증 목록 (individual members)
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'months'   => 'nullable|integer|in:6',
            'years'    => 'nullable|integer|in:1,2,3',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        try {
            $paginator = $this->service->getCashReceiptList(
                $request->user(),
                $request->only(['months', 'years']),
                (int) $request->input('per_page', 15)
            );

            return $this->responsePaginatedSuccess(200, 'successfully', [
                'items' => ReceiptItemResource::collection($paginator->items()),
            ], $this->paginationService->format($paginator));
        } catch (\Throwable $e) {
            return $this->responseError(500, '현금영수증 목록을 가져오는 중 오류가 발생했습니다.', [$e->getMessage()]);
        }
    }
}
