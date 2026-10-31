<?php

namespace App\Http\Controllers\Api\MyPage;

use App\Http\Controllers\Api\BaseController;
use App\Http\Resources\DepositStatusResource;
use App\Services\MyPage\MyPageDepositStatusService;
use App\Services\PaginationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DepositStatusController extends BaseController
{
    public function __construct(
        protected MyPageDepositStatusService $service,
        protected PaginationService $paginationService,
    ) {}

    /**
     * GET /api/mypage/deposit-status
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'per_page' => 'nullable|integer|min:1|max:100',
            'months'   => 'nullable|integer|in:1,3,6',
            'search'   => 'nullable|string|max:100',
        ]);

        try {
            $filters   = $request->only(['months', 'search']);
            $paginator = $this->service->getList(
                $request->user(),
                $filters,
                (int) $request->input('per_page', 15)
            );

            return $this->responsePaginatedSuccess(200, 'successfully', [
                'items' => DepositStatusResource::collection($paginator->items()),
                'total' => $this->service->getTotal($request->user(), $filters),
            ], $this->paginationService->format($paginator));
        } catch (\Throwable $e) {
            return $this->responseError(500, '입금현황을 가져오는 중 오류가 발생했습니다.', [$e->getMessage()]);
        }
    }
}
