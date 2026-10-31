<?php

namespace App\Http\Controllers\Api\MyPage;

use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\MyPage\BulkPaymentActionRequest;
use App\Http\Requests\PaymentMypageRequest;
use App\Http\Resources\PaymentResource;
use App\Services\MyPage\MyPagePaymentService;
use App\Services\PaginationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends BaseController
{
    public function __construct(
        protected MyPagePaymentService $paymentService,
        protected PaginationService $paginationService,
    ) {}

    /**
     * Get pending/processing payments for the current user
     */
    public function pending(PaymentMypageRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            $user = $request->user();

            $payments = $this->paymentService->getPendingPayments($user, $validated);
            $responseData = [
                'payments' => PaymentResource::collection($payments->items()),
            ];

            return $this->responsePaginatedSuccess(200, 'Successfully retrieved pending payments',
                $responseData, $this->paginationService->format($payments));
        } catch (\Exception $e) {
            return $this->responseError($this->resolveStatusCode($e), 'Failed to retrieve pending payments');
        }
    }

    /**
     * Get completed payments for the current user
     */
    public function completed(PaymentMypageRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            $user = $request->user();

            $payments = $this->paymentService->getCompletedPayments($user, $validated);
            $responseData = [
                'payments' => PaymentResource::collection($payments->items()),
            ];

            return $this->responsePaginatedSuccess(200, 'Successfully retrieved completed payments',
                $responseData, $this->paginationService->format($payments));
        } catch (\Exception $e) {
            return $this->responseError($this->resolveStatusCode($e), 'Failed to retrieve completed payments');
        }
    }

    /**
     * Get failed/cancelled payments for the current user
     */
    public function failed(PaymentMypageRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            $user = $request->user();

            $payments = $this->paymentService->getFailedPayments($user, $validated);
            $responseData = [
                'payments' => PaymentResource::collection($payments->items()),
            ];

            return $this->responsePaginatedSuccess(200, 'Successfully retrieved failed payments',
                $responseData, $this->paginationService->format($payments));
        } catch (\Exception $e) {
            return $this->responseError($this->resolveStatusCode($e), 'Failed to retrieve failed payments');
        }
    }

    /**
     * Get all payments for the current user
     */
    public function index(PaymentMypageRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            $user = $request->user();

            $payments = $this->paymentService->getAllPayments($user, $validated);
            $responseData = [
                'payments' => PaymentResource::collection($payments->items()),
            ];

            return $this->responsePaginatedSuccess(200, 'Successfully retrieved payments',
                $responseData, $this->paginationService->format($payments));
        } catch (\Exception $e) {
            return $this->responseError($this->resolveStatusCode($e), 'Failed to retrieve payments');
        }
    }

    /**
     * Get payment detail for the current user
     */
    public function show(Request $request, string $transactionId): JsonResponse
    {
        try {
            $user = $request->user();

            $payment = $this->paymentService->getPaymentDetail($user, $transactionId);

            if (! $payment) {
                return $this->responseError(404, 'Payment not found');
            }

            $responseData = [
                'payment' => new PaymentResource($payment),
            ];

            return $this->responseSuccess(200, 'Successfully retrieved payment detail', $responseData);
        } catch (\Exception $e) {
            return $this->responseError($this->resolveStatusCode($e), 'Failed to retrieve payment detail');
        }
    }

    /**
     * Get payment progress list for a specific order.
     */
    public function orderProgress(Request $request, string $orderNumber): JsonResponse
    {
        try {
            $user = $request->user();
            $progress = $this->paymentService->getOrderPaymentProgress($user, $orderNumber);

            if (empty($progress)) {
                return $this->responseError(404, 'Payment progress not available for this order or stage');
            }

            return $this->responseSuccess(200, 'Successfully retrieved payment progress', [
                'order_number' => $orderNumber,
                'payments' => $progress,
            ]);
        } catch (\Exception $e) {
            return $this->responseError($this->resolveStatusCode($e), 'Failed to retrieve payment progress');
        }
    }

    /**
     * Bulk approve payments
     */
    public function bulkApprove(BulkPaymentActionRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            $user = $request->user();

            $count = $this->paymentService->bulkApprovePayments(
                $user,
                $validated['transaction_ids']
            );

            return $this->responseSuccess(200, "Successfully approved {$count} payments", [
                'approved_count' => $count,
            ]);
        } catch (\Exception $e) {
            return $this->responseError($this->resolveStatusCode($e), 'Failed to approve payments');
        }
    }

    /**
     * Bulk reject payments
     */
    public function bulkReject(BulkPaymentActionRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            $user = $request->user();

            $count = $this->paymentService->bulkRejectPayments(
                $user,
                $validated['transaction_ids'],
                $validated['reason'] ?? null
            );

            return $this->responseSuccess(200, "Successfully rejected {$count} payments", [
                'rejected_count' => $count,
            ]);
        } catch (\Exception $e) {
            return $this->responseError($this->resolveStatusCode($e), 'Failed to reject payments');
        }
    }
}
