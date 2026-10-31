<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseController;
use App\Services\Admin\AdminPriceSimulationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminPriceSimulationController extends BaseController
{
    public function __construct(
        protected AdminPriceSimulationService $service,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'product_id'      => 'nullable|integer',
            'category'        => 'nullable|string|max:100',
            'erp_options_ids' => 'required|array',
            'erp_options_ids.*' => 'integer',
            'quantity'         => 'required|integer|min:1',
        ]);

        try {
            $result = $this->service->simulate(
                $request->only(['product_id', 'category', 'erp_options_ids', 'quantity'])
            );

            return response()->json([
                'success' => true,
                'message' => '단가 시뮬레이션 조회 성공',
                'data'    => $result,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $this->resolveStatusCode($e));
        }
    }
}
