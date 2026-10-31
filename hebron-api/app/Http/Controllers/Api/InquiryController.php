<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\Inquiry\InquiryOrderDetailRequest;
use App\Http\Resources\OrderResource;
use App\Repositories\Contracts\OrderRepositoryInterface;
use Illuminate\Http\JsonResponse;

class InquiryController extends BaseController
{
    public function __construct(
        protected OrderRepositoryInterface $orderRepository,
    ) {}

    /**
     * Get an order detail without login by verifying its order number and
     * shipping phone.
     */
    public function show(InquiryOrderDetailRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $order = $this->orderRepository->findForInquiry(
            $validated['order_number'],
            isset($validated['mobile_phone'])
                ? $this->normalizePhone($validated['mobile_phone'])
                : null
        );

        if (! $order) {
            return response()->json([
                'success' => false,
                'message' => '주문을 찾을 수 없습니다.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'order' => new OrderResource($order),
            ],
        ]);
    }

    private function normalizePhone(?string $phone): string
    {
        return preg_replace('/[^0-9]/', '', $phone) ?: '';
    }
}
