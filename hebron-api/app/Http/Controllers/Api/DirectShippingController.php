<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CustomerService\DirectShippingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DirectShippingController extends Controller
{
    public function __construct(
        protected DirectShippingService $service
    ) {}

    /**
     * Get list of direct shipping requests (직배송 신청 목록).
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        try {
            $result = $this->service->getList(
                $request->user(),
                (int) $request->input('per_page', 15)
            );

            return response()->json([
                'success' => true,
                'data'    => $result,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '직배송 신청 목록을 가져오는 중 오류가 발생했습니다.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get a single direct shipping request (직배송 신청 상세).
     */
    public function show(Request $request, int $id): JsonResponse
    {
        try {
            $item = $this->service->getOne($request->user(), $id);

            return response()->json([
                'success' => true,
                'data'    => $item,
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return response()->json([
                'success' => false,
                'message' => '신청 내역을 찾을 수 없습니다.',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '오류가 발생했습니다.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create a new direct shipping request (직배송 신청 등록).
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'shipping_name'    => 'required|string|max:100',
            'recipient_name'   => 'required|string|max:100',
            'phone'            => 'nullable|string|max:20',
            'postcode'         => 'nullable|string|max:10',
            'address'          => 'required|string|max:255',
            'detailed_address' => 'nullable|string|max:255',
            'storage_location' => 'nullable|string|max:255',
            'file'             => 'nullable|file|mimes:pdf,jpeg,jpg,png|max:1048576',
            'detail_request'   => 'required|string|max:2000',
            'amount'           => 'nullable|integer|min:0',
        ]);

        try {
            $item = $this->service->create(
                $request->user(),
                $request->only([
                    'shipping_name', 'recipient_name', 'phone',
                    'postcode', 'address', 'detailed_address',
                    'storage_location', 'detail_request', 'amount',
                ]),
                $request->file('file')
            );

            return response()->json([
                'success' => true,
                'message' => '직배송 신청이 등록되었습니다.',
                'data'    => $item,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '직배송 신청 중 오류가 발생했습니다.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
}
